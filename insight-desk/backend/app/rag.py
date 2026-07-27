import os
import chromadb
import pandas as pd
from pypdf import PdfReader

from langchain_ollama import OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.config import EMBED_MODEL, OLLAMA_HOST

# Chroma ko disk par persist karo (server band hone par data bacha rahe)
chroma_client = chromadb.PersistentClient(path="./chroma_store")

embed_kwargs = {"model": EMBED_MODEL}
if OLLAMA_HOST:
    embed_kwargs["base_url"] = OLLAMA_HOST

embedder = OllamaEmbeddings(**embed_kwargs)


def _read_file(path: str) -> str:
    """PDF, CSV, TXT, ya MD file se saara text nikaalo."""
    if path.lower().endswith(".pdf"):
        reader = PdfReader(path)
        return "\n".join((page.extract_text() or "") for page in reader.pages)
    elif path.lower().endswith(".csv"):
        df = pd.read_csv(path)
        return df.to_string()
    elif path.lower().endswith((".txt", ".md")):
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    raise ValueError("Sirf PDF, CSV, TXT ya MD files allowed hain")


def ingest_document(path: str, session_id: str) -> int:
    """File ko chunk+embed karke us session ke collection mein daalo (Optimized for Fast Speed)."""
    text = _read_file(path)
    if not text.strip():
        raise ValueError("Document se koi text nahi mila (shayad scanned image PDF hai)")

    # 1600 chunk_size reduces chunk count by ~60% while keeping richer context
    splitter = RecursiveCharacterTextSplitter(chunk_size=1600, chunk_overlap=150)
    chunks = splitter.split_text(text)

    # Cap at top 25 chunks for instant indexing & high performance
    if len(chunks) > 25:
        chunks = chunks[:25]

    # Generate embeddings via Ollama in a single fast batch call
    vectors = embedder.embed_documents(chunks)
    collection = chroma_client.get_or_create_collection(name=f"session_{session_id}")
    collection.add(
        ids=[f"{session_id}_{i}" for i in range(len(chunks))],
        documents=chunks,
        embeddings=vectors,
        metadatas=[{"source": os.path.basename(path), "chunk": i} for i in range(len(chunks))],
    )
    return len(chunks)


def retrieve(query: str, session_id: str, k: int = 4):
    """Sawal se sabse milte-julte chunks wapas do (source ke saath)."""
    try:
        collection = chroma_client.get_collection(name=f"session_{session_id}")
    except Exception:
        return []  # is session mein koi document upload nahi hua

    q_vec = embedder.embed_query(query)
    res = collection.query(query_embeddings=[q_vec], n_results=k)
    docs = res.get("documents", [[]])[0]
    metas = res.get("metadatas", [[]])[0]
    return [
        {"text": d, "source": m.get("source"), "chunk": m.get("chunk")}
        for d, m in zip(docs, metas)
    ]
