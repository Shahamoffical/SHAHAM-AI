import time
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

from app.database import Base, engine
import app.models
from app.routes import auth_routes, research_routes

# Database tables auto-create on startup with recovery retry
for attempt in range(5):
    try:
        Base.metadata.create_all(bind=engine)
        break
    except Exception:
        time.sleep(1)

app = FastAPI(title="SHAHAM AI Research API")

@app.exception_handler(OperationalError)
async def db_operational_exception_handler(request: Request, exc: OperationalError):
    return JSONResponse(
        status_code=503,
        content={"detail": "Database is temporarily recovering or reconnecting. Please retry in a moment."},
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(research_routes.router)


@app.get("/")
def home():
    return {"message": "SHAHAM AI Backend is active!"}
