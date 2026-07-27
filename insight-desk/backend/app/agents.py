import json
from concurrent.futures import ThreadPoolExecutor
from langchain_ollama import ChatOllama
from app.config import OLLAMA_HOST, OLLAMA_MODEL
from app.tools import document_search, web_search

llm_kwargs = {"model": OLLAMA_MODEL, "temperature": 0}
if OLLAMA_HOST:
    llm_kwargs["base_url"] = OLLAMA_HOST

llm = ChatOllama(**llm_kwargs)


# ---------- 1) PLANNER AGENT ----------
def planner_agent(query: str) -> list:
    """Deconstructs the user query into focused sub-tasks based on query complexity."""
    words = query.strip().split()
    
    # Fast path for simple questions (< 8 words)
    if len(words) <= 8:
        return [{"task": query, "source": "web"}]

    prompt = f"""You are an autonomous research Planner. Break the user's question into 1 to 2 focused subtasks.
You MUST write all task descriptions strictly in clear, professional English.
For each task, decide the best source: "web" (for web info) or "document" (for uploaded PDF/CSV files).
Return ONLY a valid JSON list, no extra markdown or explanations. Example:
[{{\"task\": \"...\", \"source\": \"web\"}}]

User question: {query}"""

    try:
        resp = llm.invoke(prompt).content
        start = resp.index("[")
        end = resp.rindex("]") + 1
        plan = json.loads(resp[start:end])
        return plan if len(plan) > 0 else [{"task": query, "source": "web"}]
    except Exception:
        return [{"task": query, "source": "web"}]


# ---------- 2) RESEARCH AGENT (Parallel Execution) ----------
def _execute_subtask(step: dict, session_id: str) -> list:
    task = step.get("task", "")
    source = step.get("source", "web")
    sub_findings = []
    
    # Always check document search first for the subtask if session_id is available
    if session_id:
        doc_hits = document_search(task, session_id)
        for h in doc_hits:
            sub_findings.append({
                "type": "document",
                "task": task,
                "source": f"Uploaded Document ({h.get('source', 'PDF')})",
                "text": h["text"],
            })

    # Execute web search
    hits = web_search(task, max_results=3)
    for h in hits:
        if h.get("snippet"):
            sub_findings.append({
                "type": "web",
                "task": task,
                "source": h["url"],
                "text": h["snippet"],
                "title": h.get("title", ""),
            })
    return sub_findings


def research_agent(plan: list, session_id: str) -> list:
    """Executes search operations concurrently using ThreadPoolExecutor for speed."""
    findings = []

    # Direct document query for the entire user request if session_id is valid
    if session_id and plan:
        main_task = plan[0].get("task", "")
        if main_task:
            doc_hits = document_search(main_task, session_id)
            for h in doc_hits:
                findings.append({
                    "type": "document",
                    "task": main_task,
                    "source": f"Uploaded Document ({h.get('source', 'PDF')})",
                    "text": h["text"],
                })

    with ThreadPoolExecutor(max_workers=len(plan) or 1) as executor:
        futures = [executor.submit(_execute_subtask, step, session_id) for step in plan]
        for future in futures:
            try:
                res = future.result()
                for item in res:
                    # Prevent duplicate text snippets
                    if not any(f.get("text") == item.get("text") for f in findings):
                        findings.append(item)
            except Exception:
                pass
    return findings


# ---------- 3) WRITER AGENT ----------
def writer_agent(query: str, findings: list) -> str:
    """Synthesizes research findings into a concise, well-structured markdown report."""
    # Separate uploaded document findings from web findings
    doc_findings = [f for f in findings if f.get("type") == "document"]
    web_findings = [f for f in findings if f.get("type") != "document"]

    # Combine document findings FIRST, followed by web findings
    ordered_findings = doc_findings[:4] + web_findings[:4]

    context_lines = []
    for i, f in enumerate(ordered_findings[:8], 1):
        label = f.get("source") or "web"
        context_lines.append(f"[{i}] {label}\n{f['text']}")

    context = "\n\n".join(context_lines)

    prompt = f"""You are an expert research Writer.
CRITICAL MANDATE: You MUST write the ENTIRE response strictly in clear, concise English.

Answer the user's question directly using the provided context findings.
IF UPLOADED DOCUMENT FINDINGS ARE PRESENT IN THE CONTEXT, YOU MUST PRIMARILY BASE YOUR ANSWER ON THE UPLOADED DOCUMENT AND CITE IT.
Use clean Markdown formatting with clear headings, bullet points, and inline citations like [1], [2].

QUESTION: {query}

CONTEXT FINDINGS:
{context}
"""
    return llm.invoke(prompt).content
