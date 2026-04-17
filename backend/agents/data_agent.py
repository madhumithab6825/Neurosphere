import logging
import pandas as pd
from services.llm_service import get_ai_response

logger = logging.getLogger("data_agent")


def load_data(file_path: str) -> pd.DataFrame:
    ext = file_path.rsplit(".", 1)[-1].lower()
    if ext == "csv":
        return pd.read_csv(file_path)
    elif ext in ["xlsx", "xls"]:
        return pd.read_excel(file_path)
    raise ValueError(f"Unsupported file type: {ext}")


def summarize_df(df: pd.DataFrame) -> str:
    summary = []
    summary.append(f"Shape: {df.shape[0]} rows x {df.shape[1]} columns")
    summary.append(f"Columns: {', '.join(df.columns.tolist())}")
    summary.append(f"\nData Types:\n{df.dtypes.to_string()}")
    summary.append(f"\nStatistical Summary:\n{df.describe(include='all').to_string()}")
    summary.append(f"\nFirst 5 rows:\n{df.head().to_string()}")
    null_counts = df.isnull().sum()
    if null_counts.any():
        summary.append(f"\nMissing Values:\n{null_counts[null_counts > 0].to_string()}")
    return "\n".join(summary)


def run(file_path: str, query: str) -> dict:
    logger.info(f"Data agent running for: {file_path}")
    try:
        df = load_data(file_path)
        summary = summarize_df(df)
        logger.info(f"Loaded dataframe: {df.shape}")
    except Exception as e:
        logger.error(f"Data loading failed: {e}")
        return {"answer": f"Failed to load data: {e}", "sources": [file_path], "tool": "data"}

    prompt = f"""You are NeuroSphere AI, a data analysis expert.
Analyze the dataset below and answer the question.

Dataset Summary:
{summary}

Question: {query}

Provide a clear, structured answer with insights:"""

    answer = get_ai_response(prompt)
    return {
        "answer": answer,
        "sources": [file_path],
        "tool": "data",
        "data_info": {
            "rows": df.shape[0],
            "columns": df.shape[1],
            "column_names": df.columns.tolist()
        }
    }
