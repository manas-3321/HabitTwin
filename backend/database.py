"""
HabitTwin Database Module
Configures SQLite database connection using SQLAlchemy.
SQLite is lightweight, serverless, and stores all user habit data locally in a single file.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Database file location in backend directory
DB_FILE = os.path.join(os.path.dirname(__file__), "habittwin.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_FILE}"

# check_same_thread=False is required for SQLite when accessed across multiple FastAPI worker threads
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    FastAPI dependency that yields a SQLAlchemy database session per request
    and guarantees it closes after the response is sent.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Creates all database tables defined in models if they do not exist.
    """
    from . import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
