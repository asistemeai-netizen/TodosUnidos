---
name: modular-architecture
description: Regla de arquitectura Anti-Monolito ("Anti-Gaveta de Ropa"). Define cómo dividir archivos grandes en módulos de única responsabilidad para mantener el código limpio y escalable.
allowed-tools: Read, Write, Edit
version: 1.0
priority: HIGH
---

# Modular Architecture ("Anti-Gaveta de Ropa" Protocol)

> **Regla de Oro:** Un archivo NO es una caja donde meter todo el código relacionado con un sistema. Si un archivo pasa las 300-400 líneas, es hora de aplicar el protocolo de partición.

Esta habilidad define la metodología universal para mantener la separación de responsabilidades a nivel de archivos y carpetas, aplicable a cualquier proyecto (Frontend, Backend, Workers).

## 1. El Principio de "Single Responsibility File" (SRF)
Así como las funciones deben hacer una sola cosa, **los archivos deben representar un solo concepto arquitectónico**.
No mezcles en un mismo archivo:
- Definiciones de Tipos/Interfaces.
- Lógica de persistencia o llamadas a Base de Datos.
- Reglas de negocio puras.
- Integraciones con APIs externas de terceros.
- Lógica de la interfaz de usuario (UI).

## 2. Anatomía de la Refactorización

Cuando encuentres un monolito (o vayas a crearlo), usa esta estructura base:

### El Orquestador (Entrypoint)
`index.ts`, `agent.ts`, o `main.ts` **nunca** debe contener implementaciones densas.
- Solo debe inicializar.
- Inyectar dependencias.
- Llamar a funciones importadas.
- **Límite sugerido:** ~100-150 líneas máximo.

### La Carpeta de Tipos
Extrae todos los `Type`, `Interface`, `Zod schemas` a un archivo o carpeta dedicada (ej. `types.ts` o `types/`).
- Facilita la reutilización.
- Previene dependencias cíclicas.

### Factorías y Módulos de Dominio (`/domain` o `/tools`)
Agrupa la funcionalidad densa en subcarpetas temáticas.
- Por ejemplo, si tienes 4 formas de autenticar, crea `auth/oauth.ts`, `auth/jwt.ts`, `auth/magic.ts`.
- Exporta una fábrica (factory) unificada desde un archivo barril `auth/index.ts`.

### Lógica de Especialidad Temática (`/vision`, `/telephony`, `/mcp`)
Cualquier hack, manipulación de buffers, o configuración arcana de un SDK de terceros va a su propio archivo. Así, si algo se rompe, el desarrollador sabe exactamente que la manipulación de video está en `vision.ts`, no perdida en la línea 684 del entrypoint.

## 3. The 3-Strike Rule for Extraction
Debes iniciar una refactorización de separación de archivos automáticamente si se cumplen 2 de estas 3 condiciones:
1. El archivo tiene más de 400 líneas.
2. Contiene más de 3 contextos lógicos distintos (ej. Types + DB + LLM).
3. Requiere más de 6 imports de librerías externas distintas de áreas desconectadas (ej. importar `sharp` para imágenes y `postgres` para SQL en el mismo archivo).

## 4. Reglas de Invocación
- Siempre usa dependencias explícitas en las funciones extraídas. Pásale los parámetros necesarios en vez de leer estados globales.
- Si una refactorización es extensa, usa un plan de migración (`implementation_plan.md`) antes de tocar el código (como lo hicimos con la cirugía de JJ Benítez).
