---
name: gemini-live-api-dev
description: Use this skill for building real-time, bidirectional streaming applications with the Gemini Live API. Supports WebSocket-based audio/video/text streaming, voice activity detection (VAD), function calling, and session management. Supports @google/genai for JavaScript/TypeScript (Node.js and Web).
---

# Gemini Live API Development Skill

## Critical Rules

> [!IMPORTANT]
> The Gemini Live API requires **WebSockets** and works with special multimodal models.

### Target Models
- `gemini-3.1-pro-preview`
- `gemini-3-flash-preview`

### Key Differences from Standard API
- **Real-time**: Near-zero latency response.
- **Multimodal Stream**: Can receive and send raw audio bytes and video frames.
- **Interruptible**: The model can be stopped mid-sentence if the user starts speaking (VAD).

---

## Technical Details (Node.js/TypeScript)

### 1. Connection Lifecycle
Connect directly to the WebSocket endpoint or use the SDK wrapper.

```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});
const liveSession = ai.models.startLiveSession({
    model: "gemini-3-flash-preview",
    config: {
        voice: "Puck" // Choose from: Puck, Aoide, Charon, Fenrir, Kore
    }
});

liveSession.on("content", (content) => {
    // Handle audio bytes or text
});

liveSession.send("Hello, I am ready to stream.");
```

### 2. Audio Processing (Node.js)
Use standard Node buffers and streaming libraries (like `ffmpeg` or `node-speaker`) to handle the bidirectional audio.

### 3. Function Calling (Live)
Functions are defined in the initial configuration. The model can pause the stream to wait for a tool result.

---

## Documentation Lookup

**Index URL**: `https://ai.google.dev/gemini-api/docs/live/llms.txt`

Key pages:
- [WebSocket Reference](https://ai.google.dev/gemini-api/docs/live/websocket-ref.md.txt)
- [Voice & Sound Configuration](https://ai.google.dev/gemini-api/docs/live/voice-config.md.txt)
- [Multimodal Inputs](https://ai.google.dev/gemini-api/docs/live/multimodal.md.txt)

---

## 🛠 Advanced LiveKit & Gemini Realtime Integration Learnings

When bridging LiveKit WebRTC sessions with the Google GenAI Live API (specifically via `@livekit/agents-plugin-google`), there are several critical gotchas and undocumented behaviors:

### 1. Tool Declaration Race Condition
If you are dynamically pulling tool definitions from a database to pass into Gemini, the LiveKit plugin SDK (`RealtimeSession`) has a race condition. If you attempt to update the tools via standard setter functions *after* the session connects, they may be omitted from the initial `setup` message. 
**Fix:** Inject `geminiDeclarations` and `_tools` directly into the `RealtimeSession` object instance *before* the WebSocket opens.

### 2. LiveKit Video Auto-Subscription
By default, the LiveKit Agent framework (`@livekit/agents`) **auto-subscribes to audio tracks but ignores video tracks**. If your agent is multimodal, the WebRTC stream will exist in the room but the agent will never read the frames.
**Fix:** You must explicitly intercept the `trackPublished` event and call `pub.setSubscribed(true)` for tracks with `TrackKind.KIND_VIDEO`. Additionally, you must loop through existing `room.remoteParticipants` and subscribe to pre-existing video tracks upon connection.

### 3. The `realtime_input` Silent Image Drop
The Google GenAI WebSocket standard has a `BidiGenerateContentRealtimeInput` (`realtime_input`) message. While the official documentation states it supports video frames, **Gemini 2.5 Live silently drops `image/jpeg` payloads sent over the `realtime_input` channel**.
If you send base64 frames wrapped in `realtime_input.mediaChunks`, the frame is thrown away and the model's `promptTokensDetails` will stubbornly show `{"modality":"TEXT"}`. The agent will hallucinate that it cannot see the screen.

**The Fix (Turn Buffering Pattern):**
Video frames must be sent as standard conversational pieces (`clientContent` / `content`).
However, sending a frame as a completed conversational turn will cause Gemini to generate a response instantly ("Ok, I see an image"), interrupting the user 1 time per second.
You must wrap the image frame as `content` but append `turnComplete: false`:

```typescript
// Sending a base64 JPEG from a video stream
patchedRealtimeSession.sendClientEvent({
  type: "content",
  value: {
    turns: [{
      role: "user",
      parts: [{ inlineData: { mimeType: "image/jpeg", data: b64 } }]
    }],
    turnComplete: false // CRITICAL: Buffers into memory without triggering a generation
  }
});
```
When the user speaks into their microphone (which is routed through `realtime_input` audio channels) and stops, the turn is completed normally, and the LLM assesses the buffered image context natively.
