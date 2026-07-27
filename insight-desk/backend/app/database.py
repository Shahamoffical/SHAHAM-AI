from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import DATABASE_URL

# SQLite ko multi-thread ke liye ek special arg chahiye
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,      # Auto-check if connection is alive before use
    pool_recycle=300,         # Recycle connections every 5 minutes
    pool_size=10,             # Keep 10 connections in the pool
    max_overflow=20,          # Allow up to 20 extra connections under load
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Har request ke liye ek DB session dena aur band karna
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
