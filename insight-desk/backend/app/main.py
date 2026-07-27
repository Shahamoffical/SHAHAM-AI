from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
import app.models
from app.routes import auth_routes, research_routes

# Database tables auto-create on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Insight Desk API")

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
    return {"message": "Insight Desk backend chal raha hai!"}
