from fastapi import FastAPI
from app.api import documents, chat

app = FastAPI(title="GyaanChat AI")

app.include_router(documents.router, prefix="/documents")
app.include_router(chat.router, prefix="/chat")

@app.get("/")
def health_check():
    return {"status": "ok"}
