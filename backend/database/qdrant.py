import os
import logging
from dotenv import load_dotenv
from qdrant_client import QdrantClient

load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '.env'))

logger = logging.getLogger("qdrant")

QDRANT_URL = os.getenv("QDRANT_URL", "").strip().rstrip(":6333")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", "").strip()
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION", "neurosphere_vectors").strip()

logger.info(f"Qdrant URL: {QDRANT_URL}")

try:
    client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
    logger.info(f"Qdrant client initialized, collection: {COLLECTION_NAME}")
except Exception as e:
    logger.error(f"Qdrant initialization failed: {e}")
