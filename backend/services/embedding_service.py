from sentence_transformers import SentenceTransformer
import logging

logger = logging.getLogger("embedding_service")

model = SentenceTransformer("all-MiniLM-L6-v2")
logger.info("Embedding model loaded: all-MiniLM-L6-v2")

def embed_text(text: str) -> list:
    vector = model.encode(text).tolist()
    logger.info(f"Embedded text of length {len(text)}")
    return vector

def embed_batch(texts: list) -> list:
    vectors = model.encode(texts).tolist()
    logger.info(f"Embedded batch of {len(texts)} texts")
    return vectors
