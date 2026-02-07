from fastapi import APIRouter
from pydantic import BaseModel

from app.services.llm import generate_answer
from app.services.embeddings import embed_texts
from app.services.vector_store import get_collection
from app.services.rag import build_prompt

router = APIRouter()

class ChatRequest(BaseModel):
    tenant_id: str
    question: str

@router.post("/")
def chat(req: ChatRequest):
    collection = get_collection(req.tenant_id)

    query_embedding = embed_texts([req.question])[0]

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=4
    )

    docs = results["documents"][0] if results["documents"] else []

    if not docs:
        return {
            "answer": "I couldn’t find this information in the provided documents."
        }

    prompt = build_prompt(docs, req.question)
    answer = generate_answer(prompt)

    return {
        "answer": answer
    }
