from fastapi import APIRouter, UploadFile, File
import uuid, os

from app.services.pdf_loader import extract_text_from_pdf
from app.services.chunker import chunk_text
from app.services.embeddings import embed_texts
from app.services.vector_store import get_collection

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_document(
    tenant_id: str,
    file: UploadFile = File(...)
):
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")

    with open(file_path, "wb") as f:
        f.write(await file.read())

    text = extract_text_from_pdf(file_path)
    chunks = chunk_text(text)
    embeddings = embed_texts(chunks)

    collection = get_collection(tenant_id)

    ids = [f"{file_id}_{i}" for i in range(len(chunks))]

    collection.add(
        documents=chunks,
        embeddings=embeddings,
        ids=ids
    )

    return {
        "message": "Document indexed successfully",
        "tenant_id": tenant_id,
        "chunks_indexed": len(chunks)
    }
