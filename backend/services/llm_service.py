import requests
import os
from dotenv import load_dotenv
from services.log_service import get_logger

load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '.env'))

logger = get_logger("llm_service")
API_KEY = os.getenv("GROQ_API_KEY")

def get_ai_response(user_input):
    logger.info(f"Sending request to Groq LLM")
    url = "https://api.groq.com/openai/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": "You are NeuroSphere AI."},
            {"role": "user", "content": user_input}
        ]
    }

    response = requests.post(url, headers=headers, json=data)
    result = response.json()

    if "error" in result:
        logger.error(f"Groq API error: {result['error']['message']}")
        raise Exception(f"Groq Error: {result['error']['message']}")

    logger.info("LLM response received successfully")
    return result["choices"][0]["message"]["content"]
