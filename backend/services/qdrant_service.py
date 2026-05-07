import uuid
import logging
from qdrant_client.models import Distance, VectorParams, PointStruct
from database.qdrant import client, COLLECTION_NAME

logger = logging.getLogger("qdrant_service")

VECTOR_SIZE = 384

def create_collection():
    try:
        existing = [c.name for c in client.get_collections().collections]
        if COLLECTION_NAME not in existing:
            client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE)
            )
            logger.info(f"Created Qdrant collection: {COLLECTION_NAME}")
        else:
            logger.info(f"Collection already exists: {COLLECTION_NAME}")
    except Exception as e:
        logger.warning(f"Collection check failed, attempting to create: {e}")
        try:
            client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE)
            )
            logger.info(f"Created Qdrant collection: {COLLECTION_NAME}")
        except Exception as e2:
            logger.error(f"Failed to create collection: {e2}")

def upsert_chunks(chunks: list, vectors: list):
    points = [
        PointStruct(
            id=str(uuid.uuid4()),
            vector=vectors[i],
            payload=chunks[i]
        )
        for i in range(len(chunks))
    ]
    client.upsert(collection_name=COLLECTION_NAME, points=points)
    logger.info(f"Upserted {len(points)} chunks to Qdrant")

def search(query_vector: list, top_k: int = 5, with_vectors: bool = False, user_id: str = None) -> list:
    from qdrant_client.models import Filter, FieldCondition, MatchValue
    query_filter = None
    if user_id:
        query_filter = Filter(
            must=[FieldCondition(key="metadata.user_id", match=MatchValue(value=user_id))]
        )
    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        limit=top_k,
        with_vectors=with_vectors,
        query_filter=query_filter
    ).points
    logger.info(f"Qdrant search returned {len(results)} results for user: {user_id}")
    return results
