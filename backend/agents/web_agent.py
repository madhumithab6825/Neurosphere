import re
import logging
import requests
from bs4 import BeautifulSoup
from services.llm_service import get_ai_response

logger = logging.getLogger("web_agent")

URL_PATTERN = re.compile(r"https?://[^\s]+")


def scrape_url(url: str) -> str:
    try:
        response = requests.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
        soup = BeautifulSoup(response.text, "html.parser")
        for tag in soup(["script", "style", "nav", "footer", "header"]):
            tag.decompose()
        text = soup.get_text(separator=" ", strip=True)
        # limit to 3000 words
        words = text.split()[:3000]
        return " ".join(words)
    except Exception as e:
        logger.error(f"Scraping failed for {url}: {e}")
        return ""


def run(query: str) -> dict:
    logger.info(f"Web agent running for: {query}")
    urls = URL_PATTERN.findall(query)
    clean_query = URL_PATTERN.sub("", query).strip()

    all_content = []
    for url in urls:
        content = scrape_url(url)
        if content:
            all_content.append(f"[From {url}]:\n{content}")
            logger.info(f"Scraped {len(content)} chars from {url}")

    if not all_content:
        return {"answer": "Could not retrieve content from the provided URL.", "sources": urls, "tool": "web"}

    context = "\n\n".join(all_content)
    prompt = f"""You are NeuroSphere AI. Use the web content below to answer the question.

Web Content:
{context}

Question: {clean_query or "Summarize the content"}

Answer:"""

    answer = get_ai_response(prompt)
    return {"answer": answer, "sources": urls, "tool": "web"}
