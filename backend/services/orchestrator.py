import logging
from agents.react_agent import run as react_run
from services.memory_service import build_memory_context, save_memory
from services.response_formatter import format_response
from models.user_preference import get_preference

logger = logging.getLogger("orchestrator")

def run(query: str, file_path: str = None, user_id: str = "default") -> dict:
    logger.info(f"Orchestrator starting for user: {user_id}")

    # load user preference and memory
    pref = get_preference(user_id)
    style = pref.get("response_style", "default")
    memory_context = build_memory_context(user_id)

    # run ReAct agent loop
    result = react_run(
        query=query,
        user_id=user_id,
        file_path=file_path,
        memory_context=memory_context
    )

    # format response based on user preference
    result["answer"] = format_response(result["answer"], style)

    # save to memory
    save_memory(user_id, query, result["answer"], result.get("tool", "chat"))

    return result
