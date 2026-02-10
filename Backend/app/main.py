from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from app.api import documents, chat

app = FastAPI(title="GyaanChat AI")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global configuration
RAG_DISTANCE_THRESHOLD = float(os.getenv("RAG_DISTANCE_THRESHOLD", "0.5"))

app.include_router(documents.router, prefix="/documents")
app.include_router(chat.router, prefix="/chat")

@app.get("/")
def health_check():
    return {"status": "ok", "threshold": RAG_DISTANCE_THRESHOLD}
