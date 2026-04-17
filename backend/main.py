import os
import shutil
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.orchestrator import run as orchestrate
from models.chat_model import save_chat
from services.ingest_service import ingest_document, files_collection
from services.log_service import log_event, get_logger
from auth.auth_routes import router as auth_router
from middleware.auth_middleware import get_current_user
from models.user_preference import get_preference, save_preference
from services.memory_service import get_memory_summary, get_all_topics

logger = get_logger("main")
app = FastAPI(title="NeuroSphere Multi-Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


class ChatRequest(BaseModel):
    message: str


@app.post("/chat")
async def chat(request: ChatRequest, user=Depends(get_current_user)):
    user_id = user["user_id"]
    user_message = request.message
    logger.info(f"Chat request from {user_id}: {user_message}")
    log_event("USER_INPUT", user_message)

    try:
        result = orchestrate(user_message, user_id=user_id)
    except Exception as e:
        logger.error(f"Orchestrator error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    save_chat(user_message, result["answer"], user_id=user_id)
    log_event("RESPONSE_SENT", result["answer"])

    return {
        "response": result["answer"],
        "tool_used": result.get("tool", "chat"),
        "sources": result.get("sources", [])
    }


@app.post("/upload")
async def upload(file: UploadFile = File(...), user=Depends(get_current_user)):
    user_id = user["user_id"]
    user_dir = os.path.join(UPLOAD_DIR, user_id)
    os.makedirs(user_dir, exist_ok=True)

    file_path = os.path.join(user_dir, file.filename)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    logger.info(f"File uploaded by {user_id}: {file.filename}")

    try:
        metadata = ingest_document(file_path, user_id=user_id)
    except Exception as e:
        logger.error(f"Ingestion error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "message": "Document ingested successfully",
        "metadata": {
            "filename": metadata["filename"],
            "file_size_bytes": metadata["file_size_bytes"],
            "chunks_stored": metadata["chunks_stored"],
            "uploaded_at": metadata["uploaded_at"]
        }
    }


@app.post("/analyze")
async def analyze(file: UploadFile = File(...), query: str = Form(default="Summarize this dataset"), user=Depends(get_current_user)):
    user_id = user["user_id"]
    user_dir = os.path.join(UPLOAD_DIR, user_id)
    os.makedirs(user_dir, exist_ok=True)

    file_path = os.path.join(user_dir, file.filename)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        result = orchestrate(query, file_path=file_path, user_id=user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "response": result["answer"],
        "tool_used": result.get("tool"),
        "data_info": result.get("data_info", {})
    }


@app.post("/ocr")
async def ocr(file: UploadFile = File(...), query: str = Form(default=""), user=Depends(get_current_user)):
    user_id = user["user_id"]
    user_dir = os.path.join(UPLOAD_DIR, user_id)
    os.makedirs(user_dir, exist_ok=True)

    file_path = os.path.join(user_dir, file.filename)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        result = orchestrate(query, file_path=file_path, user_id=user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "response": result["answer"],
        "extracted_text": result.get("extracted_text", ""),
        "tool_used": result.get("tool")
    }


@app.post("/web")
async def web(request: ChatRequest, user=Depends(get_current_user)):
    try:
        result = orchestrate(request.message, user_id=user["user_id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "response": result["answer"],
        "tool_used": result.get("tool"),
        "sources": result.get("sources", [])
    }


@app.get("/files")
async def list_files(user=Depends(get_current_user)):
    files = list(files_collection.find({"user_id": user["user_id"]}, {"_id": 0}))
    return {"files": files}


@app.get("/qdrant/info")
async def qdrant_info(user=Depends(get_current_user)):
    from database.qdrant import client, COLLECTION_NAME
    collections = [c.name for c in client.get_collections().collections]
    try:
        info = client.get_collection(COLLECTION_NAME)
        return {
            "collections": collections,
            "collection": COLLECTION_NAME,
            "vectors_count": info.vectors_count,
            "points_count": info.points_count
        }
    except Exception as e:
        return {"collections": collections, "error": str(e)}


@app.get("/preference")
async def get_pref(user=Depends(get_current_user)):
    return get_preference(user["user_id"])


@app.post("/preference")
async def update_pref(
    response_style: str = Form(default="default"),
    tts_enabled: bool = Form(default=False),
    user=Depends(get_current_user)
):
    save_preference(user["user_id"], response_style, tts_enabled)
    return {"message": "Preference saved", "response_style": response_style}


@app.get("/memory")
async def get_memory(user=Depends(get_current_user)):
    summary = get_memory_summary(user["user_id"])
    topics = get_all_topics(user["user_id"])
    return {"summary": summary, "topics": topics}


@app.get("/welcome")
async def welcome(user=Depends(get_current_user)):
    summary = get_memory_summary(user["user_id"])
    return {
        "message": f"Welcome back!",
        "reminder": summary or "No previous conversations yet. Start asking!"
    }
