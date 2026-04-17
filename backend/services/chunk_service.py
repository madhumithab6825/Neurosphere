import os
import re
import logging
from pypdf import PdfReader
from docx import Document
import nltk
from nltk.tokenize import sent_tokenize

nltk.download("punkt", quiet=True)
nltk.download("punkt_tab", quiet=True)

logger = logging.getLogger("chunk_service")

MAX_CHUNK_TOKENS = 400      # max words per chunk
OVERLAP_SENTENCES = 2       # sentences to carry over for context continuity
MIN_CHUNK_WORDS = 30        # discard tiny meaningless chunks


def load_file(file_path: str) -> list[dict]:
    """Load file and return list of {text, page} dicts preserving page structure"""
    ext = os.path.splitext(file_path)[1].lower()
    pages = []

    if ext == ".pdf":
        reader = PdfReader(file_path)
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text and text.strip():
                pages.append({"text": text.strip(), "page": i + 1})

    elif ext == ".docx":
        doc = Document(file_path)
        full_text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
        pages.append({"text": full_text, "page": 1})

    elif ext == ".txt":
        with open(file_path, "r", encoding="utf-8") as f:
            pages.append({"text": f.read().strip(), "page": 1})

    else:
        raise ValueError(f"Unsupported file type: {ext}")

    logger.info(f"Loaded {len(pages)} pages from {file_path}")
    return pages


def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\.{3,}", ".", text)
    return text.strip()


def semantic_chunk(pages: list[dict], source: str) -> list[dict]:
    """
    Semantic chunking:
    - Split by sentences (not chars)
    - Group sentences until MAX_CHUNK_TOKENS reached
    - Carry OVERLAP_SENTENCES from previous chunk for context continuity
    - Store rich metadata: source, page, chunk_index, word_count
    """
    chunks = []
    chunk_index = 0

    for page_data in pages:
        page_num = page_data["page"]
        text = clean_text(page_data["text"])
        sentences = sent_tokenize(text)

        current_sentences = []
        current_word_count = 0
        overlap_carry = []

        for sentence in sentences:
            word_count = len(sentence.split())

            # if adding this sentence exceeds limit, flush current chunk
            if current_word_count + word_count > MAX_CHUNK_TOKENS and current_sentences:
                chunk_text = " ".join(current_sentences)

                if len(chunk_text.split()) >= MIN_CHUNK_WORDS:
                    chunks.append({
                        "text": chunk_text,
                        "metadata": {
                            "source": source,
                            "page": page_num,
                            "chunk_index": chunk_index,
                            "word_count": current_word_count
                        }
                    })
                    chunk_index += 1

                # carry last N sentences as overlap into next chunk
                overlap_carry = current_sentences[-OVERLAP_SENTENCES:]
                current_sentences = overlap_carry.copy()
                current_word_count = sum(len(s.split()) for s in current_sentences)

            current_sentences.append(sentence)
            current_word_count += word_count

        # flush remaining sentences
        if current_sentences:
            chunk_text = " ".join(current_sentences)
            if len(chunk_text.split()) >= MIN_CHUNK_WORDS:
                chunks.append({
                    "text": chunk_text,
                    "metadata": {
                        "source": source,
                        "page": page_num,
                        "chunk_index": chunk_index,
                        "word_count": current_word_count
                    }
                })
                chunk_index += 1

    logger.info(f"Created {len(chunks)} semantic chunks from {source}")
    return chunks


def load_and_chunk(file_path: str) -> list[dict]:
    pages = load_file(file_path)
    source = os.path.basename(file_path)
    return semantic_chunk(pages, source)
