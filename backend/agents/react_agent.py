import logging
from services.llm_service import get_ai_response
from services.retrieval_service import retrieve
from agents.web_agent import run as web_run
from agents.data_agent import run as data_run
from agents.ocr_agent import run as ocr_run

logger = logging.getLogger("react_agent")

MAX_ITERATIONS = 4

TOOLS = {
    "rag":  "Search uploaded documents for relevant information",
    "web":  "Scrape a URL and extract information from it",
    "data": "Analyze a CSV or Excel dataset",
    "ocr":  "Extract text from an image",
    "chat": "Answer using general knowledge"
}

def think(query: str, memory_context: str, observations: list) -> dict:
    obs_text = "\n".join([f"- {o}" for o in observations]) if observations else "None yet"
    tools_desc = "\n".join([f"  {k}: {v}" for k, v in TOOLS.items()])

    prompt = f"""You are a reasoning agent. Decide what to do next.

Available tools:
{tools_desc}

User query: {query}

Memory context:
{memory_context or "No previous context"}

Observations so far:
{obs_text}

Respond in this exact format:
THOUGHT: <your reasoning about what to do>
ACTION: <tool name from: rag, web, data, chat>
INPUT: <what to pass to the tool, or the query itself>
DONE: <yes if you have enough to answer, no if you need more>"""

    response = get_ai_response(prompt)
    logger.info(f"ReAct think response:\n{response}")

    result = {"thought": "", "action": "chat", "input": query, "done": False}
    for line in response.splitlines():
        if line.startswith("THOUGHT:"):
            result["thought"] = line.replace("THOUGHT:", "").strip()
        elif line.startswith("ACTION:"):
            action = line.replace("ACTION:", "").strip().lower()
            result["action"] = action if action in TOOLS else "chat"
        elif line.startswith("INPUT:"):
            result["input"] = line.replace("INPUT:", "").strip()
        elif line.startswith("DONE:"):
            result["done"] = "yes" in line.lower()
    return result

def act(action: str, input_text: str, user_id: str, file_path: str = None) -> str:
    logger.info(f"ReAct act: {action} | input: {input_text[:80]}")
    try:
        if action == "rag":
            context, sources = retrieve(input_text, user_id=user_id)
            return context if context.strip() else "No relevant documents found."
        elif action == "web":
            result = web_run(input_text)
            return result.get("answer", "")
        elif action == "data" and file_path:
            result = data_run(file_path, input_text)
            return result.get("answer", "")
        elif action == "ocr" and file_path:
            result = ocr_run(file_path, input_text)
            return result.get("answer", "")
        else:
            return get_ai_response(input_text)
    except Exception as e:
        logger.error(f"Act error: {e}")
        return f"Tool error: {str(e)}"

def synthesize(query: str, observations: list, memory_context: str) -> str:
    obs_text = "\n\n".join([f"Observation {i+1}: {o}" for i, o in enumerate(observations)])
    prompt = f"""You are NeuroSphere AI. Synthesize a final answer using the observations below.

Memory context:
{memory_context or "None"}

Observations gathered:
{obs_text}

User question: {query}

Provide a clear, complete final answer:"""
    return get_ai_response(prompt)

def run(query: str, user_id: str = "default", file_path: str = None, memory_context: str = "") -> dict:
    logger.info(f"ReAct agent starting for: {query} | user: {user_id}")

    observations = []
    thoughts = []
    tools_used = []

    for i in range(MAX_ITERATIONS):
        logger.info(f"ReAct iteration {i+1}")

        decision = think(query, memory_context, observations)
        thoughts.append(decision["thought"])
        tools_used.append(decision["action"])

        observation = act(decision["action"], decision["input"], user_id, file_path)
        observations.append(observation)

        logger.info(f"Iteration {i+1} done={decision['done']} action={decision['action']}")

        if decision["done"]:
            break

    final_answer = synthesize(query, observations, memory_context)

    return {
        "answer": final_answer,
        "thoughts": thoughts,
        "tools_used": list(dict.fromkeys(tools_used)),
        "tool": tools_used[-1] if tools_used else "chat",
        "sources": [],
        "iterations": len(observations)
    }
