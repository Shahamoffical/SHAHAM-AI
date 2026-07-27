import asyncio
import json
import os
import uuid

from fastapi import APIRouter, Depends, File, UploadFile, WebSocket, WebSocketDisconnect
from jose import jwt
from sqlalchemy.orm import Session

from app import auth, models
from app.config import ALGORITHM, SECRET_KEY
from app.database import SessionLocal, get_db
from app.graph import research_graph
from app.rag import ingest_document

router = APIRouter(tags=["research"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ---------- 1) DOCUMENT UPLOAD ----------
@router.post("/upload")
def upload_document(
    session_id: str,
    file: UploadFile = File(...),
    user: models.User = Depends(auth.get_current_user),
):
    if not file.filename.lower().endswith((".pdf", ".csv")):
        return {"error": "Only PDF or CSV files are allowed"}

    path = os.path.join(UPLOAD_DIR, f"{session_id}_{file.filename}")
    with open(path, "wb") as f:
        f.write(file.file.read())

    try:
        n = ingest_document(path, session_id)
        return {"message": f"{n} chunks stored", "filename": file.filename}
    except Exception as e:
        return {"error": str(e)}


# ---------- 2) WEBSOCKET: live research ----------
@router.websocket("/ws/research")
async def research_ws(websocket: WebSocket):
    await websocket.accept()
    try:
        # frontend bhejta hai: {"token": "...", "query": "...", "session_id": "..."}
        data = await websocket.receive_json()
        token = data.get("token")
        query = data.get("query")
        session_id = data.get("session_id") or str(uuid.uuid4())

        # token verify (manual, kyunki websocket header alag hota hai)
        db = SessionLocal()
        try:
            email = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]).get("sub")
            user = db.query(models.User).filter(models.User.email == email).first()
            if not user:
                await websocket.send_json({"type": "error", "message": "Auth fail"})
                await websocket.close()
                return

            loop = asyncio.get_running_loop()

            # emit: har agent update ko frontend par bhejta hai
            def emit(agent, msg):
                asyncio.run_coroutine_threadsafe(
                    websocket.send_json(
                        {"type": "activity", "agent": agent, "message": msg}
                    ),
                    loop,
                )

            # graph blocking hai, isliye thread mein chalao taake websocket na ruke
            state = {
                "query": query,
                "session_id": session_id,
                "plan": [],
                "findings": [],
                "report": "",
                "emit": emit,
            }
            result = await loop.run_in_executor(None, research_graph.invoke, state)

            # final report bhejo
            await websocket.send_json({"type": "report", "report": result["report"]})

            # session DB mein save karo
            sess = models.ResearchSession(
                user_id=user.id,
                query=query,
                report=result["report"],
                sources=json.dumps(
                    [f.get("source") for f in result.get("findings", [])]
                ),
            )
            db.add(sess)
            db.commit()
            await websocket.send_json({"type": "done", "session_id": sess.id})
        finally:
            db.close()
    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.send_json({"type": "error", "message": str(e)})
        await websocket.close()


# ---------- 3) SESSION HISTORY ENDPOINTS ----------
@router.get("/sessions")
def list_sessions(
    db: Session = Depends(get_db),
    user: models.User = Depends(auth.get_current_user),
):
    rows = (
        db.query(models.ResearchSession)
        .filter(models.ResearchSession.user_id == user.id)
        .order_by(models.ResearchSession.created_at.desc())
        .all()
    )
    return [
        {"id": r.id, "query": r.query, "created_at": str(r.created_at)}
        for r in rows
    ]


@router.get("/sessions/{session_id}")
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(auth.get_current_user),
):
    r = (
        db.query(models.ResearchSession)
        .filter(
            models.ResearchSession.id == session_id,
            models.ResearchSession.user_id == user.id,
        )
        .first()
    )
    if not r:
        return {"error": "Session not found"}
    return {
        "id": r.id,
        "query": r.query,
        "report": r.report,
        "sources": r.sources,
        "created_at": str(r.created_at),
    }
