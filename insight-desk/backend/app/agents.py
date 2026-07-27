import json

from langchain_ollama import ChatOllama
from app.config import OLLAMA_HOST, OLLAMA_MODEL
from app.tools import document_search, web_search

llm_kwargs = {"model": OLLAMA_MODEL, "temperature": 0}
if OLLAMA_HOST:
    llm_kwargs["base_url"] = OLLAMA_HOST

llm = ChatOllama(**llm_kwargs)


# ---------- 1) PLANNER AGENT ----------
def planner_agent(query: str) -> list:
    """Deconstructs the user query into 2-4 focused sub-tasks with designated search tools."""
    prompt = f"""You are an autonomous research Planner. Break the user's question into 2-4 focused subtasks.
You MUST write all task descriptions strictly in clear, professional English.
For each task, decide the best source: "web" (for current or general web information) or "document" (for user's uploaded PDF/CSV files).
Return ONLY a valid JSON list, no extra markdown or explanations. Example:
[{{\"task\": \"...\", \"source\": \"web\"}}, {{\text\": \"...\", \"source\": \"document\"}}]

User question: {query}"""

    resp = llm.invoke(prompt).content
    try:
        start = resp.index("[")
        end = resp.rindex("]") + 1
        return json.loads(resp[start:end])
    except Exception:
        # Fallback: single web research task
        return [{"task": query, "source": "web"}]


# ---------- 2) RESEARCH AGENT ----------
def research_agent(plan: list, session_id: str) -> list:
    """Executes search operations for each sub-task and aggregates research findings."""
    findings = []
    for step in plan:
        task = step.get("task", "")
        source = step.get("source", "web")
        if source == "document":
            hits = document_search(task, session_id)
            for h in hits:
                findings.append(
                    {
                        "type": "document",
                        "task": task,
                        "source": h["source"],
                        "text": h["text"],
                    }
                )
        else:
            hits = web_search(task)
            for h in hits:
                findings.append(
                    {
                        "type": "web",
                        "task": task,
                        "source": h["url"],
                        "text": h["snippet"],
                        "title": h["title"],
                    }
                )
    return findings


# ---------- 3) WRITER AGENT ----------
def writer_agent(query: str, findings: list) -> str:
    """Synthesizes research findings into a structured markdown report with inline citations."""
    context_lines, sources = [], []
    for i, f in enumerate(findings, 1):
        label = f.get("source") or "unknown"
        context_lines.append(f"[{i}] ({f['type']}) {label}\n{f['text']}")
        sources.append(f"[{i}] {label}")

    context = "\n\n".join(context_lines)

    prompt = f"""You are an expert technical report Writer.
CRITICAL MANDATE: You MUST write the ENTIRE report strictly in clean, professional, and well-formatted English. Do NOT use Roman Urdu, Hindi, or any non-English language under any circumstances.

Using ONLY the provided sources below, write a comprehensive, well-structured research report answering the user's question.
- Use clear Markdown headings (e.g. # Title, ## Executive Summary, ## Findings).
- Add inline citations like [1], [2] immediately following sentences that cite a source.
- End with a "## Sources" section listing all numbered reference sources.

QUESTION: {query}

SOURCES:
{context}
"""
    report = llm.invoke(prompt).content
    return report
