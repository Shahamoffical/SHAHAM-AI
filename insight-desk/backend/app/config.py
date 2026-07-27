import os
from dotenv import load_dotenv

load_dotenv()  # .env file padho

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./insightdesk.db")
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
EMBED_MODEL = os.getenv("EMBED_MODEL", "nomic-embed-text")
OLLAMA_HOST = os.getenv("OLLAMA_HOST")  # Optional host override for Docker
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # token 1 din valid
