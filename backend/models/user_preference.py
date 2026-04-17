import logging
from database.mongodb import db

logger = logging.getLogger("user_preference")

prefs_collection = db["user_preferences"]

def get_preference(user_id: str) -> dict:
    pref = prefs_collection.find_one({"user_id": user_id}, {"_id": 0})
    return pref or {"user_id": user_id, "response_style": "default", "tts_enabled": False}

def save_preference(user_id: str, response_style: str = "default", tts_enabled: bool = False):
    prefs_collection.update_one(
        {"user_id": user_id},
        {"$set": {"response_style": response_style, "tts_enabled": tts_enabled}},
        upsert=True
    )
    logger.info(f"Preference saved for user {user_id}: style={response_style}")
