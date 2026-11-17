"""
HabitTwin Database Module
Delegates persistence to the human-readable JSON Database Engine (habittwin_data.json).
Provides backward-compatible imports for get_db, init_db, and SQLAlchemy Base.
"""

from .json_db import get_db, json_db, HabitLogRecord, JSON_FILE_PATH

DB_FILE = JSON_FILE_PATH


def init_db():
    """Initializes JSON data store if not present."""
    json_db._ensure_file()


# Backward compatibility shims for models and ORM type annotations
try:
    from sqlalchemy.orm import declarative_base
    Base = declarative_base()
except Exception:
    class Base:
        pass
