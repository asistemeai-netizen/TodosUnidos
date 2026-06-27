---
name: dokploy-deploy
description: >
  Battle-tested deployment checklist and anti-patterns for Dokploy (Docker Compose on VPS).
  Use when deploying any containerised app to Dokploy: web apps, workers, background services,
  SIP/WebRTC services. Covers env vars, build args, networking, TLS, health checks, and common
  runtime crashes discovered through real production incidents.
allowed-tools: Read, Write, Edit, Bash
version: 1.0
priority: HIGH
---

# Dokploy Deploy — Production Survival Guide

> **USE THIS SKILL** any time you are preparing, reviewing, or debugging a deployment on Dokploy
> (or any Docker Compose stack on a VPS behind Traefik). The anti-patterns below have each caused
> at least one real production outage.

---

## 1. Environment Variables — The Minefield

### 1.1 Build-time vs. Runtime Variables

| Type | Where set | When resolved | Example |
|------|-----------|---------------|---------|
| **Build-time** | `ARG` in Dockerfile + `build.args` in compose | During `docker build` | `NEXT_PUBLIC_*` in Next.js |
| **Runtime** | `environment:` in compose | Container startup | `DATABASE_URL`, `API_KEY` |

> ⚠️ **CRITICAL for Next.js / Vite:** Any variable prefixed `NEXT_PUBLIC_` or `VITE_` is **baked
> into the JS bundle at build time**. Setting it only in `environment:` does NOTHING in production.

**Fix pattern — Next.js:**
```dockerfile
# Dockerfile
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
RUN pnpm build   # ← must happen AFTER ENV
```

```yaml
# docker-compose.prod.yml
services:
  web:
    build:
      context: .
      args:
        NEXT_PUBLIC_APP_URL: https://myapp.example.com
    environment:
      DATABASE_URL: ${DATABASE_URL}
```

### 1.2 Length / Format Constraints

| Variable | Hard Constraint | What crashes if wrong |
|----------|----------------|-----------------------|
| `ENCRYPTION_KEY` (AES-256-GCM) | **Exactly 32 chars** | Worker refuses to start; web silently returns null |
| `JWT_SECRET` | Min 32 chars recommended | Auth tokens become predictable |
| `LIVEKIT_API_SECRET` | Base64url, no colons | SDK can mistake it for encrypted blob |

**Generate a valid 32-char key:**
```bash
openssl rand -hex 16   # → 32 hex chars
```

> 🔴 **Rule:** Validate key lengths at module load time so the service fails fast instead of
> silently corrupting data.

### 1.3 The "Same Variable, Two Services" Trap

When two services share encrypted data (e.g., web encrypts → worker decrypts), **both must have
the identical `ENCRYPTION_KEY`**. In Dokploy each service has its own env var panel — it is *easy*
to update one and forget the other.

**Checklist before deploy:**
- [ ] All services that read/write the same encrypted column have the same key
- [ ] Both services implement identical logic: if Web encrypts data, Worker MUST decrypt it before passing it to 3rd party APIs (e.g., Gemini SDK).
- [ ] After rotating a key, all previously-encrypted rows are migrated/re-encrypted BEFORE deploying

---

## 2. Docker Networking — Where Most Surprises Hide

### 2.1 The Bridge vs. Host Mode Divide

```
bridge network (default):
  [container A] ←→ [container B]  ✅ reach each other by service name
  [container A] ←→ [host OS]      ✅ via host.docker.internal (Linux: needs extra-hosts)

host network:
  [container C]  shares the host's network stack
  [container C] ←→ [bridge container]  ❌ CANNOT reach by service name
  [container C] ←→ [host ports]        ✅ via 127.0.0.1
```

**Real-world example (SIP service):**
SIP requires `network_mode: host` for RTP port range (10000-20000). This means:
- It **cannot** reach other containers by their hostname (`redis`, `livekit`).
- It **must** use `127.0.0.1:<mapped-port>` to reach services whose ports are bound to the host.

```yaml
# redis exposes port to host
redis:
  ports:
    - "127.0.0.1:6379:6379"   # accessible from host-mode containers

sip:
  network_mode: host
  environment:
    SIP_CONFIG_BODY: |
      redis:
        address: 127.0.0.1:6379   # ← NOT "redis:6379"
```

### 2.2 Health Checks Across Network Modes

TCP port checks (`nc -z host port`) from a bridge container **cannot** reach a `host`-mode
container because they're on different network namespaces.

**Workaround:** Use an API probe instead of a TCP probe.

```typescript
// ❌ WRONG for host-mode services
const ok = await tcpPing(SIP_HOST, 5060);

// ✅ CORRECT — use a real API method
const trunks = await sipService.listSipInboundTrunk();
const sipOk = Array.isArray(trunks);
```

### 2.3 Health Check Syntax in Compose

Docker Compose in Dokploy expects array syntax for health checks to avoid shell interpretation issues across different base images (alpine vs debian).

```yaml
# ❌ WRONG (can cause parsing errors in some engines)
healthcheck:
  test: wget -qO- http://localhost:7880 || exit 1

# ✅ CORRECT (explicit shell invocation)
healthcheck:
  test: ["CMD-SHELL", "wget -qO- http://localhost:7880 || exit 1"]
```

### 2.4 Traefik & Dokploy — Two Networks Required

Any service that needs Traefik routing must be in **two** networks: its own default network AND
`dokploy-network`.

```yaml
services:
  web:
    networks:
      - default          # inter-service communication
      - dokploy-network  # Traefik routing

networks:
  dokploy-network:
    external: true       # must already exist on the host
```

---

## 3. TLS / SSL — The Silent Killer

### 3.1 CA Certificates in Slim Images

`*-slim` base images (Debian bookworm-slim, alpine, etc.) often strip the `ca-certificates`
package. Any library with its own TLS stack (Rust, Go, native Node addons) reads certs from
`/etc/ssl/certs/` and will throw `UnknownIssuer` / `certificate verify failed` against
Let's Encrypt.

```dockerfile
# ✅ Add to ANY runner stage that uses native TLS (Rust addons, Go binaries, etc.)
FROM node:22-bookworm-slim AS runner
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*
```

**Affected packages:** `@livekit/rtc-node`, any Rust-based npm addon, Go CGO binaries.

### 3.2 Internal vs External URLs

| Connection | URL format | Why |
|------------|------------|-----|
| WebSocket (LiveKit SDK room.connect) | `wss://public.domain.com` | Goes through Traefik/TLS |
| Internal service-to-service | `ws://service-name:7880` | Direct, no TLS needed |
| Agent dispatch (worker→LiveKit) | `https://public.domain.com` | Uses public cert |

---

## 4. Build Process — pnpm / npm Gotchas

### 4.1 Native Node Modules

Using `--frozen-lockfile` with native modules (`.node` binaries compiled for a specific arch)
fails when the lockfile was generated on a different OS (Windows/macOS vs Linux in Docker).

```dockerfile
# ❌ Fails if lockfile was built on Windows
RUN pnpm install --frozen-lockfile

# ✅ Allow pnpm to resolve native modules for target arch
RUN pnpm install --prod=false
```

### 4.2 Module Resolution Types (`import.meta` vs CommonJS)

If your `tsconfig.json` uses `NodeNext` but `package.json` lacks `"type": "module"`, `tsc` will compile to CommonJS. In strict Docker build environments:
- `import.meta.url` will cause `error TS1470: The 'import.meta' meta-property is not allowed in files which will build into CommonJS output.`
- **Fix:** Use standard CommonJS paths instead:
  ```typescript
  import { createRequire } from "node:module";
  const _require = createRequire(require.resolve("@livekit/agents"));
  ```

### 4.3 Prune After Build

After building, prune dev dependencies and let pnpm re-link for production:
```dockerfile
RUN pnpm prune --prod
```

---

## 5. Protobuf / SDK Type Safety

### 5.1 Protobuf Objects Cannot Cross Server→Client Boundary

In Next.js, objects returned from Server Actions or passed to Client Components **must be plain
JSON**. Protobuf objects have circular references and non-standard `toJSON` methods.

```typescript
// ❌ Crashes in production: cannot pass protobuf to client
return { trunk: livekitSdkResponse };

// ✅ Strip to plain object first
function toPlain<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
return { trunk: toPlain(livekitSdkResponse) };
```

### 5.2 SDK Update API — Partial Updates Need Special Types

Many SDKs (LiveKit SIP, protobuf-based APIs) have two update variants:
- **Full replace:** pass the complete object → use `SIPInboundTrunkInfo({ ...allFields })`
- **Partial update:** pass a `ListUpdate` / field-mask object → types are NOT `string[]`

```typescript
// ❌ Compiles but crashes at runtime — wrong type for ListUpdate
await sipService.updateSipInboundTrunkFields(id, {
  numbers: { set: ["1234"] } as any,  // ← this will serialize incorrectly
});

// ✅ Use full-replace when in doubt
await sipService.updateSipInboundTrunk(id,
  new SIPInboundTrunkInfo({ sipTrunkId: id, numbers: ["1234"], name: "..." })
);
```

---

## 6. Next.js Server Components — Runtime Traps

### 6.1 Session Null After `revalidatePath`

When a Server Action calls `revalidatePath()`, Next.js re-renders the page in the background.
If the page does `session!.user.id` without a null check, the background render crashes with
a cryptic "An error occurred in the Server Components render" in production (the real error
is hidden for security).

```typescript
// ❌ WRONG — crashes in background revalidation
export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = await db.select().where(eq(users.id, session!.user.id)); // ← BOOM
}

// ✅ CORRECT — always guard session
export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = await db.select().where(eq(users.id, session.user.id));
}
```

### 6.2 Decryption Errors After Key Rotation

When rotating an `ENCRYPTION_KEY`, all previously-encrypted rows are now unreadable. The
`decryptString` function will throw `Unsupported state or unable to authenticate data`
(AES-GCM auth tag mismatch).

**Mitigation strategy:**
1. Deploy with the new key.
2. Add a **legacy fallback** in `decryptString`: if decryption fails, try the old key once.
3. Or expose an admin UI to re-enter sensitive values (API keys, secrets) so they get
   re-encrypted with the new key.
4. Make `decryptString` non-fatal — return `null` and let the app show "please re-enter".

```typescript
export function decryptString(text?: string | null): string | null {
  if (!text || !text.includes(':')) return text ?? null; // plaintext / null passthrough
  try {
    // ... AES-GCM decrypt ...
  } catch {
    return null; // non-fatal — caller must handle
  }
}
```

---

## 7. Pre-Deploy Checklist

Run through this before **every** Dokploy deploy:

### Environment Variables
- [ ] All `NEXT_PUBLIC_*` / `VITE_*` vars set as **build args**, not just runtime env
- [ ] `ENCRYPTION_KEY` is exactly 32 characters
- [ ] Same `ENCRYPTION_KEY` in ALL services that share encrypted data
- [ ] `LIVEKIT_URL` uses `wss://` (not `ws://`) for production
- [ ] `BETTER_AUTH_URL` / `NEXTAUTH_URL` matches the public domain exactly (no trailing slash)
- [ ] Database URL points to production DB, not localhost
- [ ] `.env.*-prod` files are added to `.gitignore` so secrets don't leak

### Docker / Compose
- [ ] Runner stage of Dockerfile installs `ca-certificates` if using native TLS addons
- [ ] Services that need Traefik are in both `default` and `dokploy-network`
- [ ] `network_mode: host` services access other services via `127.0.0.1:<mapped-port>`
- [ ] Native Node modules use `pnpm install` without `--frozen-lockfile`
- [ ] `pnpm prune --prod` runs after build

### Code
- [ ] All SDK responses passed to Client Components go through `JSON.parse(JSON.stringify(obj))`
- [ ] Every Server Component page has `if (!session) redirect("/login")`
- [ ] No leftover `console.log("DEBUG...")` in Server Actions
- [ ] Import names match exports exactly (typos compile but crash at runtime)

### After Deploy
- [ ] Check container logs for immediate crash messages (first 30 seconds)
- [ ] Verify health check indicators in the Dokploy dashboard
- [ ] Re-enter any secrets that were encrypted with the old key
- [ ] Test the full user flow end-to-end (don't just check the health endpoint)

---

## 8. Common Error Messages & Their Root Causes

| Error message | Root cause | Fix |
|---------------|------------|-----|
| `ENCRYPTION_KEY is missing or not 32 chars (Got: 16)` | Key has wrong length | Generate with `openssl rand -hex 16` |
| `invalid peer certificate: UnknownIssuer` | No `ca-certificates` in Docker image | Add `apt-get install ca-certificates` to runner stage |
| `Unsupported state or unable to authenticate data` | Wrong encryption key or key rotation | Re-enter encrypted values via UI; check key is same in all services |
| Worker passes `[object Object]` to 3rd party API | Worker forgot to decrypt data | Call `decryptString(val)` before sending to external SDK like Gemini |
| `An error occurred in the Server Components render` | Null session in page + revalidatePath | Add `if (!session) redirect("/login")` at top of every page |
| `widget.js net::ERR_CONNECTION_REFUSED` | `NEXT_PUBLIC_APP_URL` not baked at build time | Set as `build.args` in compose + `ARG/ENV` in Dockerfile |
| `room not connect after 10 seconds` | Worker can't reach LiveKit room via WebSocket (TLS issue) | Add ca-certificates; verify `LIVEKIT_URL` is correct |
| `Cannot read properties of null` (hidden in prod) | Accessing `session!.user.id` when session is null | Guard every page with `if (!session) redirect()` |
| Protobuf serialization fails silently | Passing `{ set: [] } as any` to SDK expecting `ListUpdate` | Use full-replace API variant with proper proto objects |
| `Cannot find module '@package'` during `pnpm build` | A type-only dependency is missing from `package.json` | Even if a package is only used for `import type`, `tsc` in Docker strictly requires it in `dependencies` |
