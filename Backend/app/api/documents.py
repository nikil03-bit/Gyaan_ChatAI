from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
import uuid
import os
import json
import time

from app.services.pdf_loader import extract_text_from_pdf
from app.services.chunker import chunk_text
from app.services.embeddings import embed_texts
from app.services.vector_store import get_collection

router = APIRouter()

UPLOAD_DIR = "uploads"
STATUS_DIR = os.path.join(UPLOAD_DIR, "status")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(STATUS_DIR, exist_ok=True)

def update_status(doc_id: str, status: str, tenant_id: str, filename: str, error: str = None):
    status_path = os.path.join(STATUS_DIR, f"{doc_id}.json")
    status_data = {
        "doc_id": doc_id,
        "tenant_id": tenant_id,
        "filename": filename,
        "status": status,
        "updated_at": time.time(),
        "error": error
    }
    with open(status_path, "w") as f:
        json.dump(status_data, f)

def process_document_task(file_path: str, doc_id: str, tenant_id: str, filename: str, bot_id: str = "default"):
    try:
        update_status(doc_id, "processing", tenant_id, filename)
        
        text = extract_text_from_pdf(file_path)
        chunks = chunk_text(text)
        embeddings = embed_texts(chunks)

        collection = get_collection(tenant_id)

        ids = [f"{doc_id}_{i}" for i in range(len(chunks))]
        metadatas = [
            {
                "tenant_id": tenant_id,
                "doc_id": doc_id,
                "chunk_index": i,
                "filename": filename,
                "bot_id": bot_id
            } for i in range(len(chunks))
        ]

        collection.add(
            documents=chunks,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )
        
        update_status(doc_id, "ready", tenant_id, filename)
    except Exception as e:
        update_status(doc_id, "failed", tenant_id, filename, error=str(e))

@router.post("/upload")
async def upload_document(
    tenant_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    bot_id: str = "default"
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    doc_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{file.filename}")

    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Initialize status
    update_status(doc_id, "uploaded", tenant_id, file.filename)

    # Add background task
    background_tasks.add_task(process_document_task, file_path, doc_id, tenant_id, file.filename, bot_id)

    return {
        "message": "Processing started",
        "doc_id": doc_id,
        "tenant_id": tenant_id
    }

@router.get("/status")
def get_doc_status(tenant_id: str, doc_id: str):
    status_path = os.path.join(STATUS_DIR, f"{doc_id}.json")
    if not os.path.exists(status_path):
        raise HTTPException(status_code=404, detail="Document status not found")
    
    with open(status_path, "r") as f:
        status_data = json.load(f)
    
    if status_data["tenant_id"] != tenant_id:
        raise HTTPException(status_code=403, detail="Unauthorized access to document status")
        
    return status_data

@router.get("/list")
def list_documents(tenant_id: str):
    docs = []
    for filename in os.listdir(STATUS_DIR):
        if filename.endswith(".json"):
            with open(os.path.join(STATUS_DIR, filename), "r") as f:
                data = json.load(f)
                if data["tenant_id"] == tenant_id:
                    docs.append(data)
    return docs

@router.delete("/delete")
def delete_document(tenant_id: str, doc_id: str):
    # Remove from status directory
    status_path = os.path.join(STATUS_DIR, f"{doc_id}.json")
    if not os.path.exists(status_path):
        raise HTTPException(status_code=404, detail="Document not found")
    
    with open(status_path, "r") as f:
        data = json.load(f)
        if data["tenant_id"] != tenant_id:
            raise HTTPException(status_code=403, detail="Unauthorized")

    # Remove the status file
    os.remove(status_path)

    # Remove from vector store (Chroma)
    try:
        collection = get_collection(tenant_id)
        # Note: Chroma delete works by matching IDs or metadata
        # Since we use doc_id in metadata, we can filter by that
        collection.delete(where={"doc_id": doc_id})
    except Exception as e:
        print(f"Error deleting from Chroma: {e}")
        # Continue even if Chroma delete fails, as status file is gone

    # Attempt to remove original file (filename is stored in status)
    filename = data.get("filename")
    if filename:
        file_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{filename}")
        if os.path.exists(file_path):
            os.remove(file_path)

    return {"message": "Document deleted successfully"}
