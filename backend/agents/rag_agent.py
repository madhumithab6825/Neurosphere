import logging
from services.retrieval_service import retrieve
from services.llm_service import get_ai_response

logger = logging.getLogger("rag_agent")

def run(query: str, user_id: str = None) -> dict:
    logger.info(f"RAG agent running for: {query} | user: {user_id}")
    context, sources = retrieve(query, user_id=user_id)

    if not context.strip():
        logger.info("No relevant docs found — answering as general question")
        prompt = f"""You are NeuroSphere AI, a helpful assistant.
Answer the following question using your general knowledge.

Question: {query}

Answer:"""
        answer = get_ai_response(prompt)
        return {"answer": answer, "sources": [], "tool": "chat"}

    prompt = f"""You are NeuroSphere AI, a helpful assistant.
Use the context below to answer the question. If the context is relevant, prioritize it.
If the question goes beyond the context, supplement with your general knowledge.

Context:
{context}

Question: {query}

Answer:"""

    answer = get_ai_response(prompt)
    logger.info(f"RAG answer generated from {len(sources)} sources")
    return {"answer": answer, "sources": sources, "tool": "rag"}
