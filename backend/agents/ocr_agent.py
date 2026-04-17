import logging
import easyocr
from services.llm_service import get_ai_response

logger = logging.getLogger("ocr_agent")

reader = None

def get_reader():
    global reader
    if reader is None:
        logger.info("Loading EasyOCR model...")
        reader = easyocr.Reader(["en"], gpu=False)
    return reader


def extract_text(image_path: str) -> str:
    try:
        results = get_reader().readtext(image_path, detail=0)
        text = " ".join(results)
        logger.info(f"OCR extracted {len(text)} chars from {image_path}")
        return text
    except Exception as e:
        logger.error(f"OCR failed: {e}")
        return ""


def run(image_path: str, query: str = "") -> dict:
    logger.info(f"OCR agent running for: {image_path}")
    extracted_text = extract_text(image_path)

    if not extracted_text:
        return {"answer": "Could not extract text from the image.", "sources": [image_path], "tool": "ocr"}

    prompt = f"""You are NeuroSphere AI. The following text was extracted from an image using OCR.

Extracted Text:
{extracted_text}

{"Question: " + query if query else "Summarize or describe what this image contains based on the text."}

Answer:"""

    answer = get_ai_response(prompt)
    return {"answer": answer, "extracted_text": extracted_text, "sources": [image_path], "tool": "ocr"}
