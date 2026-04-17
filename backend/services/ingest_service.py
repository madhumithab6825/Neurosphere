import os
import logging
from datetime import datetime
from services.chunk_service import load_and_chunk
from services.embedding_service import embed_batch
from services.qdrant_service import upsert_chunks, create_collection
from services.s3_service import upload_to_s3
from database.mongodb import db

logger = logging.getLogger("ingest_service")
files_collection = db["uploaded_files"]

def ingest_document(file_path: str, user_id: str = "default"):
    logger.info(f"Starting ingestion: {file_path} for user: {user_id}")
    create_collection()

    chunks = load_and_chunk(file_path)

    # tag each chunk with user_id for per-user filtering
    for chunk in chunks:
        chunk["metadata"]["user_id"] = user_id

    texts = [c["text"] for c in chunks]
    vectors = embed_batch(texts)
    upsert_chunks(chunks, vectors)

    # upload to S3 for persistence
    filename = os.path.basename(file_path)
    try:
        s3_url = upload_to_s3(file_path, user_id, filename)
    except Exception as e:
        logger.warning(f"S3 upload failed (continuing): {e}")
        s3_url = None

    file_size = os.path.getsize(file_path)
    metadata = {
        "user_id": user_id,
        "filename": filename,
        "file_path": file_path,
        "s3_url": s3_url,
        "file_size_bytes": file_size,
        "chunks_stored": len(chunks),
        "uploaded_at": datetime.utcnow().isoformat()
    }
    files_collection.insert_one({**metadata})
    logger.info(f"Ingestion complete: {len(chunks)} chunks for user {user_id}")
    return metadata
