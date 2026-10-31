from typing import Literal

from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from ollama import ResponseError
from pydantic import BaseModel

from .config import OLLAMA_MODEL
from .llm import stream_reply
from .personas import DEFAULT_PERSONA, PERSONAS

app = FastAPI(title="bookish-eureka")


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    persona: str = DEFAULT_PERSONA
    messages: list[Message]


@app.get("/api/personas")
def list_personas():
    return [{"id": pid, "label": p["label"]} for pid, p in PERSONAS.items()]


@app.get("/api/health")
def health():
    return {"status": "ok", "model": OLLAMA_MODEL}


@app.post("/api/chat")
async def chat(req: ChatRequest):
    async def body():
        try:
            async for chunk in stream_reply(req.persona, [m.model_dump() for m in req.messages]):
                yield chunk
        except ResponseError as e:
            yield f"[Ollama error: {e.error}]"
        except Exception as e:
            yield f"[Could not reach Ollama - is it running? ({type(e).__name__})]"

    return StreamingResponse(body(), media_type="text/plain; charset=utf-8")
