from typing import Optional, List
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
import re
from ..db import get_db
from ..models import Bot

from app.services.llm import generate_answer
from app.services.embeddings import embed_texts
from app.services.vector_store import get_collection
from app.services.rag import build_prompt

router = APIRouter()

# Simple widget mapping: widget_key -> tenant_id
WIDGET_MAPPING = {
    "default_key": "test_tenant"
}

class ChatRequest(BaseModel):
    tenant_id: str
    question: str

class WidgetChatRequest(BaseModel):
    widget_key: str
    visitor_id: str
    message: str

@router.post("/")
def chat(req: ChatRequest):
    msg = req.question.strip()

    # robust Small-talk / greetings bypass (no RAG needed)
    if re.match(r"^(hi|hello|hey|hii|hola|good morning|good afternoon|good evening|howdy|greetings)\b", msg.lower()):
        return {
            "answer": "Hello! 👋 I am your GyaanChat assistant. How can I help you today?",
            "sources": []
        }

    if re.match(r"^(thanks|thank you|thx|cool|great|awesome)\b", msg.lower()):
        return {
            "answer": "You're welcome! 😊 Is there anything else I can help you with?",
            "sources": []
        }

    # Import threshold from main to keep it configurable
    from app.main import RAG_DISTANCE_THRESHOLD

    collection = get_collection(req.tenant_id)
    query_embedding = embed_texts([req.question])[0]

    # Request distances to implement threshold check
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=4
    )

    docs = results["documents"][0] if results["documents"] else []
    metadatas = results["metadatas"][0] if results["metadatas"] else []
    distances = results["distances"][0] if results["distances"] else []


    # Note: Chroma cosine distance: lower is more similar.
    is_relevant = False
    if distances and distances[0] < RAG_DISTANCE_THRESHOLD:
        is_relevant = True

    if not docs or not is_relevant:
        return {
            "answer": "I couldn’t find this information in the provided documents.",
            "used_sources": False,
            "sources": []
        }

    prompt = build_prompt(docs, req.question)
    answer = generate_answer(prompt)

    # Prepare sources (simplified as requested)
    sources = []
    if metadatas:
        for meta in metadatas:
            sources.append({
                "doc_id": meta.get("doc_id"),
                "chunk_index": meta.get("chunk_index"),
                "filename": meta.get("filename")
            })

    return {
        "answer": answer,
        "used_sources": True,
        "sources": sources
    }

@router.post("/widget")
def widget_chat(req: WidgetChatRequest, db: Session = Depends(get_db)):
    bot = db.query(Bot).filter(Bot.widget_key == req.widget_key).first()
    if not bot:
        return {
            "answer": "Invalid widget key.",
            "used_sources": False,
            "sources": []
        }
    
    tenant_id = bot.tenant_id
    # Reuse chat logic
    chat_req = ChatRequest(tenant_id=tenant_id, question=req.message)
    return chat(chat_req)
