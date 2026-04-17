import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '.env'))

import logging
from qdrant_client import QdrantClient

logger = logging.getLogger("qdrant")

try:
    client = QdrantClient(
        url=os.getenv("QDRANT_URL"),
        api_key=os.getenv("QDRANT_API_KEY")
    )
    COLLECTION_NAME = os.getenv("QDRANT_COLLECTION")
    logger.info(f"Qdrant client initialized, collection: {COLLECTION_NAME}")
except Exception as e:
    logger.error(f"Qdrant initialization failed: {e}")
