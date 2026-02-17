from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import time
from .db import engine
from .models import Base
from .api.auth import router as auth_router
from app.api import documents, chat

app = FastAPI(title="GyaanChat AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request, call_next):
    start = time.time()
    try:
        response = await call_next(request)
        return response
    finally:
        ms = int((time.time() - start) * 1000)
        print(f"{request.method} {request.url.path} -> {ms}ms")


RAG_DISTANCE_THRESHOLD = float(os.getenv("RAG_DISTANCE_THRESHOLD", "0.5"))

app.include_router(auth_router)
app.include_router(documents.router, prefix="/documents")
app.include_router(chat.router, prefix="/chat")

@app.get("/")
def health_check():
    return {"status": "ok", "threshold": RAG_DISTANCE_THRESHOLD}

@app.on_event("startup")
def on_startup():
    print("Creating DB tables...")
    Base.metadata.create_all(bind=engine)
