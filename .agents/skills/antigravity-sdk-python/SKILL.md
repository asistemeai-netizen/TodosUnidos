---
name: antigravity-sdk-python
description: Use this skill when building or interacting with Python AI agents powered by the Google Antigravity SDK and Gemini.
---

# Google Antigravity SDK for Python

The Google Antigravity SDK is a Python framework for building secure, scalable, and stateful AI agents powered by Antigravity and Gemini. It abstracts the agentic loop, manages tool calling, streaming, and reasoning discovery.

## Installation

```sh
pip install google-antigravity
```

> [!IMPORTANT]
> The Google Antigravity SDK relies on a compiled runtime binary included in platform-specific wheels on PyPI. **Cloning the repository is not sufficient.** Always install using `pip install google-antigravity`.

---

## Core Usage Patterns

### 1. Simple Agent (Async Context Manager)
The `Agent` class handles the lifecycle, binary discovery, tool wiring, and defaults.

```python
import asyncio
from google.antigravity import Agent, LocalAgentConfig

async def main():
    config = LocalAgentConfig(
        system_instructions="You are a helpful assistant.",
        # api_key="your_api_key_here", # Optional if GEMINI_API_KEY is in env
    )
    async with Agent(config) as agent:
        response = await agent.chat("What is gravity?")
        print(await response.text())

if __name__ == "__main__":
    asyncio.run(main())
```

### 2. Streaming Responses
Iterate over `ChatResponse` using `async for` to stream conversational text tokens in real-time.

```python
async with Agent(config) as agent:
    response = await agent.chat("Write a poem.")
    async for token in response:
        sys.stdout.write(token)
        sys.stdout.flush()
```

### 3. Streaming Thoughts and Tool Calls (Advanced)
Stream the model's reasoning process (thoughts) or intercept tool calls before dispatch.

```python
# Stream reasoning thought deltas
async for thought in response.thoughts:
    show_thinking_bubble(thought)

# Stream strongly-typed ToolCall events
async for call in response.tool_calls:
    show_executing_spinner(call.name)
```

### 4. Capabilities (Read-Only by Default)
Agents run in **read-only** mode by default. Enable tools and system write operations by passing `capabilities=CapabilitiesConfig()`.

```python
from google.antigravity import Agent, LocalAgentConfig, CapabilitiesConfig

config = LocalAgentConfig(
    capabilities=CapabilitiesConfig(),
)
```

### 5. Interactive Terminal Loop
Run an interactive session in the console.

```python
from google.antigravity import Agent, LocalAgentConfig, CapabilitiesConfig
from google.antigravity.utils.interactive import run_interactive_loop

async def main():
    config = LocalAgentConfig(capabilities=CapabilitiesConfig())
    async with Agent(config) as agent:
        await run_interactive_loop(agent)
```
