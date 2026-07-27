from app.graph import research_graph


def emit(agent, msg):  # abhi sirf print, baad mein websocket
    print(f"[{agent}] {msg}")


result = research_graph.invoke({
    "query": "What are the main benefits of the RAG technique in AI?",
    "session_id": "test123",
    "plan": [],
    "findings": [],
    "report": "",
    "emit": emit,
})

print("\n===== FINAL REPORT =====\n")
print(result["report"])
