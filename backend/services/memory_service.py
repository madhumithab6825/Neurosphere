import logging
from datetime import datetime
from database.mongodb import db

logger = logging.getLogger("memory_service")

memory_collection = db["user_memory"]

def save_memory(user_id: str, query: str, answer: str, tool: str = "chat"):
    memory_collection.insert_one({
        "user_id": user_id,
        "query": query,
        "answer": answer,
        "tool": tool,
        "timestamp": datetime.utcnow().isoformat()
    })
    logger.info(f"Memory saved for user: {user_id}")

def get_recent_memory(user_id: str, limit: int = 10) -> list:
    records = list(
        memory_collection.find({"user_id": user_id}, {"_id": 0})
        .sort("timestamp", -1)
        .limit(limit)
    )
    return list(reversed(records))

def build_memory_context(user_id: str) -> str:
    records = get_recent_memory(user_id)
    if not records:
        return ""
    lines = []
    for r in records:
        lines.append(f"User: {r['query']}\nAssistant: {r['answer'][:200]}...")
    return "Previous conversation:\n" + "\n\n".join(lines)

def get_memory_summary(user_id: str) -> str:
    records = get_recent_memory(user_id, limit=20)
    if not records:
        return ""
    topics = list({r["query"][:60] for r in records})[:5]
    return "You previously asked about: " + ", ".join(topics)

def get_all_topics(user_id: str) -> list:
    records = list(
        memory_collection.find({"user_id": user_id}, {"_id": 0, "query": 1, "timestamp": 1})
        .sort("timestamp", -1)
        .limit(50)
    )
    return records
