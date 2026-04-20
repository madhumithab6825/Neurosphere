import logging
from sentence_transformers import SentenceTransformer

logger = logging.getLogger("embedding_service")

model = SentenceTransformer("all-MiniLM-L6-v2")
logger.info("Embedding model loaded: all-MiniLM-L6-v2")

def embed_text(text: str) -> list:
    return model.encode(text).tolist()

def embed_batch(texts: list) -> list:
    return model.encode(texts).tolist()
