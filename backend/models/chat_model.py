from database.mongodb import chat_collection
from services.log_service import get_logger
import datetime

logger = get_logger("chat_model")

def save_chat(user_input: str, response: str, user_id: str = "default"):
    try:
        chat_collection.insert_one({
            "user_id": user_id,
            "user_input": user_input,
            "response": response,
            "timestamp": str(datetime.datetime.now()),
            "metadata": {"module": "chat", "type": "conversation"}
        })
        logger.info(f"Chat saved for user: {user_id}")
    except Exception as e:
        logger.error(f"Failed to save chat: {e}")
