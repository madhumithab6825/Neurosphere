import re
import logging

logger = logging.getLogger("router_agent")

URL_PATTERN = re.compile(r"https?://[^\s]+")
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"}
DATA_EXTENSIONS = {".csv", ".xlsx", ".xls"}


def detect_intent(query: str, file_path: str = None) -> str:
    """
    Autonomously detects which tool to use based on:
    1. Attached file type
    2. URL in query
    3. Data-related keywords
    4. Fallback to RAG → Chat
    """
    # check attached file type
    if file_path:
        ext = "." + file_path.rsplit(".", 1)[-1].lower()
        if ext in IMAGE_EXTENSIONS:
            logger.info("Router → ocr (image file detected)")
            return "ocr"
        if ext in DATA_EXTENSIONS:
            logger.info("Router → data (CSV/Excel file detected)")
            return "data"

    # check URL in query
    if URL_PATTERN.search(query):
        logger.info("Router → web (URL detected in query)")
        return "web"

    # check data analysis keywords
    data_keywords = ["analyze", "analyse", "chart", "graph", "plot", "statistics",
                     "average", "mean", "median", "sum", "count", "trend", "compare",
                     "correlation", "distribution", "dataset", "rows", "columns"]
    if any(kw in query.lower() for kw in data_keywords):
        logger.info("Router → data (data keywords detected)")
        return "data"

    # default: try RAG first, fallback to chat inside rag_agent
    logger.info("Router → rag (default)")
    return "rag"
