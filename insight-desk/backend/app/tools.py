from ddgs import DDGS

from app.rag import retrieve


def web_search(query: str, max_results: int = 5):
    """Internet par search karo, results (title, snippet, url) wapas do."""
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=max_results))
            return [
                {
                    "title": r.get("title"),
                    "snippet": r.get("body"),
                    "url": r.get("href"),
                }
                for r in results
            ]
    except Exception as e:
        # Tool failure ko gracefully handle karo — crash mat karo
        return [{"title": "Search failed", "snippet": str(e), "url": ""}]


def document_search(query: str, session_id: str):
    """Uploaded documents (ChromaDB) se relevant chunks nikaalo."""
    chunks = retrieve(query, session_id, k=4)
    return chunks  # already {text, source, chunk} format mein
