import logging
import numpy as np
from services.embedding_service import embed_text, embed_batch
from services.qdrant_service import search

logger = logging.getLogger("retrieval_service")

SCORE_THRESHOLD = 0.45      # ignore chunks below this similarity
TOP_K_FETCH = 10            # fetch more, then re-rank
FINAL_TOP_K = 4             # return top N after MMR
MMR_DIVERSITY = 0.3         # 0=max relevance, 1=max diversity


def expand_query(query: str) -> list[str]:
    """Generate query variations to improve recall"""
    variations = [
        query,
        f"explain {query}",
        f"what is {query}",
    ]
    return variations


def mmr_rerank(query_vector: list, results: list, top_k: int, diversity: float) -> list:
    """
    Maximal Marginal Relevance:
    Balances relevance to query vs diversity among selected chunks
    Prevents returning near-duplicate chunks
    """
    if not results:
        return []

    selected = []
    candidates = results.copy()

    while len(selected) < top_k and candidates:
        if not selected:
            # first pick: highest relevance score
            best = max(candidates, key=lambda r: r.score)
        else:
            # subsequent picks: balance relevance and diversity
            selected_vectors = np.array([r.vector for r in selected if r.vector])
            best = None
            best_score = -999

            for candidate in candidates:
                if not candidate.vector:
                    continue
                relevance = candidate.score
                candidate_vec = np.array(candidate.vector)

                # similarity to already selected chunks
                sim_to_selected = max(
                    np.dot(candidate_vec, sv) /
                    (np.linalg.norm(candidate_vec) * np.linalg.norm(sv) + 1e-9)
                    for sv in selected_vectors
                ) if len(selected_vectors) > 0 else 0

                mmr_score = (1 - diversity) * relevance - diversity * sim_to_selected
                if mmr_score > best_score:
                    best_score = mmr_score
                    best = candidate

            if best is None:
                best = candidates[0]

        selected.append(best)
        candidates.remove(best)

    return selected


def retrieve(query: str, top_k: int = FINAL_TOP_K, user_id: str = None) -> tuple[str, list[dict]]:
    """
    Structured retrieval:
    1. Expand query into variations
    2. Embed all variations
    3. Search Qdrant for each, merge results (filtered by user_id)
    4. Filter by score threshold
    5. MMR rerank for diversity
    6. Return context string + source metadata
    """
    logger.info(f"Retrieving context for: {query} | user: {user_id}")

    variations = expand_query(query)
    vectors = embed_batch(variations)

    seen_ids = set()
    all_results = []

    for vector in vectors:
        results = search(vector, top_k=TOP_K_FETCH, with_vectors=True, user_id=user_id)
        for r in results:
            if r.id not in seen_ids and r.score >= SCORE_THRESHOLD:
                seen_ids.add(r.id)
                all_results.append(r)

    logger.info(f"After threshold filter: {len(all_results)} chunks")

    if not all_results:
        logger.warning("No relevant chunks found above threshold")
        return "", []

    # step 3: sort by score descending
    all_results.sort(key=lambda r: r.score, reverse=True)
    top_results = all_results[:TOP_K_FETCH]

    # step 4: MMR rerank
    final_results = mmr_rerank(vectors[0], top_results, top_k=top_k, diversity=MMR_DIVERSITY)

    # step 5: build structured context with source info
    context_parts = []
    sources = []

    for r in final_results:
        payload = r.payload or {}
        text = payload.get("text", "")
        metadata = payload.get("metadata", {})

        source_label = f"[Source: {metadata.get('source', 'unknown')} | Page: {metadata.get('page', '?')} | Chunk: {metadata.get('chunk_index', '?')}]"
        context_parts.append(f"{source_label}\n{text}")
        sources.append({
            "source": metadata.get("source", "unknown"),
            "page": metadata.get("page", "?"),
            "chunk_index": metadata.get("chunk_index", "?"),
            "score": round(r.score, 3)
        })

    context = "\n\n---\n\n".join(context_parts)
    logger.info(f"Final context: {len(final_results)} chunks from {len(set(s['source'] for s in sources))} sources")

    return context, sources
