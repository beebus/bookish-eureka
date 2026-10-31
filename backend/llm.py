from collections.abc import AsyncIterator

from ollama import AsyncClient

from .config import OLLAMA_HOST, OLLAMA_MODEL
from .personas import system_prompt

client = AsyncClient(host=OLLAMA_HOST)


async def stream_reply(persona_id: str, messages: list[dict]) -> AsyncIterator[str]:
    """Yield the recruiter's reply in chunks as the local model generates it."""
    full = [{"role": "system", "content": system_prompt(persona_id)}, *messages]
    stream = await client.chat(model=OLLAMA_MODEL, messages=full, stream=True)
    async for part in stream:
        chunk = part["message"]["content"]
        if chunk:
            yield chunk
