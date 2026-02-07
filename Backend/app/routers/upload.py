from fastapi import APIRouter, UploadFile, File, HTTPException
from app.utils.pdf_loader import extract_text_from_pdf
from app.utils.chunker import chunk_text
import os
import shutil

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text
    extracted_text = extract_text_from_pdf(file_path)

    if not extracted_text.strip():
        raise HTTPException(status_code=400, detail="No text found in PDF")

    # Chunk text
    chunks = chunk_text(extracted_text)

    return {
        "filename": file.filename,
        "total_chunks": len(chunks),
        "message": "Document uploaded and processed successfully"
    }
