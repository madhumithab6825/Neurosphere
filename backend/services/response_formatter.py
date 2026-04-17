import logging
from services.llm_service import get_ai_response

logger = logging.getLogger("response_formatter")

STYLE_PROMPTS = {
    "brief":     "Respond in 1-2 sentences only. Be very concise.",
    "bullets":   "Respond using bullet points only. Each point should be clear and short.",
    "paragraph": "Respond in well-structured paragraphs. Be clear and readable.",
    "detailed":  "Respond with a thorough, detailed explanation covering all aspects.",
    "default":   "Respond clearly and helpfully."
}

def format_response(answer: str, style: str = "default") -> str:
    if style == "default" or style not in STYLE_PROMPTS:
        return answer

    style_instruction = STYLE_PROMPTS[style]
    prompt = f"""{style_instruction}

Original answer:
{answer}

Reformatted answer:"""

    try:
        formatted = get_ai_response(prompt)
        logger.info(f"Response formatted as: {style}")
        return formatted
    except Exception as e:
        logger.error(f"Formatting failed: {e}")
        return answer
