"""
HabitTwin JSON Database Engine
Stores, queries, and updates all daily habit logs in a transparent, human-readable JSON file.
Replaces binary SQLite with lightweight, local JSON persistence.
"""

import json
import os
import threading
from datetime import datetime
from typing import List, Optional, Dict, Any

JSON_FILE_PATH = os.path.join(os.path.dirname(__file__), "habittwin_data.json")
_lock = threading.Lock()


class HabitLogRecord:
    """Represents a single habit log entry with property access matching ORM models."""
    def __init__(self, **kwargs):
        self.id = int(kwargs.get("id", 0))
        self.date = str(kwargs.get("date", ""))
        self.sleep_hours = float(kwargs.get("sleep_hours", 7.0))
        self.screen_time_hours = float(kwargs.get("screen_time_hours", 4.0))
        self.physical_activity_minutes = float(kwargs.get("physical_activity_minutes", 30.0))
        self.study_hours = float(kwargs.get("study_hours", 3.0))
        self.spending_food = float(kwargs.get("spending_food", 150.0))
        self.spending_entertainment = float(kwargs.get("spending_entertainment", 50.0))
        self.spending_study = float(kwargs.get("spending_study", 0.0))
        self.spending_shopping = float(kwargs.get("spending_shopping", 0.0))
        self.spending_misc = float(kwargs.get("spending_misc", 0.0))
        self.study_mode = str(kwargs.get("study_mode", "regular") or "regular")
        self.mental_mood = str(kwargs.get("mental_mood", "balanced") or "balanced")
        self.notes = str(kwargs.get("notes", "") or "")
        self.created_at = kwargs.get("created_at") or datetime.utcnow().isoformat()
        self.updated_at = kwargs.get("updated_at") or datetime.utcnow().isoformat()

    @property
    def total_spending(self) -> float:
        """Computes sum of all spending categories."""
        return round(
            (self.spending_food or 0.0)
            + (self.spending_entertainment or 0.0)
            + (self.spending_study or 0.0)
            + (self.spending_shopping or 0.0)
            + (self.spending_misc or 0.0),
            2
        )

    def to_dict(self) -> Dict[str, Any]:
        """Serializes record to plain dictionary."""
        return {
            "id": self.id,
            "date": self.date,
            "sleep_hours": self.sleep_hours,
            "screen_time_hours": self.screen_time_hours,
            "physical_activity_minutes": self.physical_activity_minutes,
            "study_hours": self.study_hours,
            "spending_food": self.spending_food,
            "spending_entertainment": self.spending_entertainment,
            "spending_study": self.spending_study,
            "spending_shopping": self.spending_shopping,
            "spending_misc": self.spending_misc,
            "study_mode": self.study_mode,
            "mental_mood": self.mental_mood,
            "notes": self.notes,
            "total_spending": self.total_spending,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }


class JsonHabitDB:
    """Thread-safe JSON document store for HabitTwin."""

    def __init__(self, filepath: str = JSON_FILE_PATH):
        self.filepath = filepath
        self._ensure_file()

    def _ensure_file(self):
        with _lock:
            if not os.path.exists(self.filepath):
                migrated = self._migrate_from_sqlite_if_available()
                if not migrated:
                    with open(self.filepath, "w", encoding="utf-8") as f:
                        json.dump([], f, indent=2)

    def _migrate_from_sqlite_if_available(self) -> bool:
        db_path = os.path.join(os.path.dirname(self.filepath), "habittwin.db")
        if not os.path.exists(db_path):
            return False
        try:
            import sqlite3
            conn = sqlite3.connect(db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='habit_logs'")
            if not cursor.fetchone():
                conn.close()
                return False
            cursor.execute("SELECT * FROM habit_logs ORDER BY date ASC")
            rows = cursor.fetchall()
            if not rows:
                conn.close()
                return False
            records = []
            for r in rows:
                row_dict = dict(r)
                records.append(HabitLogRecord(**row_dict).to_dict())
            conn.close()
            with open(self.filepath, "w", encoding="utf-8") as f:
                json.dump(records, f, indent=2)
            print(f"[JSON DB] Successfully migrated {len(records)} records from SQLite to {self.filepath}")
            return True
        except Exception as e:
            print(f"[JSON DB] Migration note: {e}")
            return False

    def _read_data(self) -> List[dict]:
        with _lock:
            if not os.path.exists(self.filepath):
                return []
            try:
                with open(self.filepath, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return []

    def _write_data(self, data: List[dict]):
        with _lock:
            temp_path = f"{self.filepath}.tmp"
            with open(temp_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            os.replace(temp_path, self.filepath)

    def get_all(self, limit: Optional[int] = None) -> List[HabitLogRecord]:
        raw_list = self._read_data()
        records = [HabitLogRecord(**item) for item in raw_list]
        records.sort(key=lambda x: x.date, reverse=True)
        if limit:
            return records[:limit]
        return records

    def get_by_id(self, log_id: int) -> Optional[HabitLogRecord]:
        raw_list = self._read_data()
        for item in raw_list:
            if item.get("id") == log_id:
                return HabitLogRecord(**item)
        return None

    def get_by_date(self, date_str: str) -> Optional[HabitLogRecord]:
        raw_list = self._read_data()
        for item in raw_list:
            if item.get("date") == date_str:
                return HabitLogRecord(**item)
        return None

    def upsert(self, data: dict) -> HabitLogRecord:
        raw_list = self._read_data()
        target_date = str(data.get("date", "")).split("T")[0]
        data["date"] = target_date
        now_str = datetime.utcnow().isoformat()

        # Anti-spam constraint: strictly enforce at most 1 log per calendar date
        existing_item = None
        max_id = 0
        cleaned_list = []
        for item in raw_list:
            item_id = item.get("id", 0)
            if item_id > max_id:
                max_id = item_id
            if item.get("date") == target_date:
                if existing_item is None:
                    existing_item = dict(item)
                # Any existing duplicate entries for this date are purged here
            else:
                cleaned_list.append(item)

        if existing_item is not None:
            # Overwrite existing record for this date cleanly
            for k, v in data.items():
                if v is not None:
                    existing_item[k] = v
            existing_item["updated_at"] = now_str
            record = HabitLogRecord(**existing_item)
            cleaned_list.append(record.to_dict())
        else:
            new_id = max_id + 1
            payload = dict(data)
            payload["id"] = new_id
            payload["created_at"] = now_str
            payload["updated_at"] = now_str
            record = HabitLogRecord(**payload)
            cleaned_list.append(record.to_dict())

        # Keep chronological order
        cleaned_list.sort(key=lambda x: x.get("date", ""))
        self._write_data(cleaned_list)
        return record

    def update(self, log_id: int, updates: dict) -> Optional[HabitLogRecord]:
        raw_list = self._read_data()
        now_str = datetime.utcnow().isoformat()
        for idx, item in enumerate(raw_list):
            if item.get("id") == log_id:
                for k, v in updates.items():
                    if v is not None:
                        item[k] = v
                item["updated_at"] = now_str
                record = HabitLogRecord(**item)
                raw_list[idx] = record.to_dict()
                self._write_data(raw_list)
                return record
        return None

    def delete(self, log_id: int) -> bool:
        raw_list = self._read_data()
        initial_len = len(raw_list)
        raw_list = [item for item in raw_list if item.get("id") != log_id]
        if len(raw_list) < initial_len:
            self._write_data(raw_list)
            return True
        return False

    def clear(self) -> int:
        raw_list = self._read_data()
        count = len(raw_list)
        self._write_data([])
        return count

    def seed(self, sample_records: List[dict], overwrite: bool = True) -> int:
        if overwrite:
            raw_list = []
        else:
            raw_list = self._read_data()

        existing_dates = {item["date"] for item in raw_list if "date" in item}
        max_id = max([item.get("id", 0) for item in raw_list], default=0)
        now_str = datetime.utcnow().isoformat()

        for rec in sample_records:
            d = rec.get("date")
            if d not in existing_dates:
                max_id += 1
                rec_copy = dict(rec)
                rec_copy["id"] = max_id
                rec_copy["created_at"] = now_str
                rec_copy["updated_at"] = now_str
                raw_list.append(HabitLogRecord(**rec_copy).to_dict())
                existing_dates.add(d)

        self._write_data(raw_list)
        return len(sample_records)


# Global singleton instance
json_db = JsonHabitDB()


def get_db() -> JsonHabitDB:
    """Dependency provider for FastAPI route endpoints."""
    return json_db


# =====================================================================
# 2. User Accounts Document Store
# =====================================================================

USER_FILE_PATH = os.path.join(os.path.dirname(__file__), "habittwin_users.json")
_user_lock = threading.Lock()


class UserRecord:
    """Represents a registered user account."""
    def __init__(self, **kwargs):
        self.id = int(kwargs.get("id", 0))
        self.email = str(kwargs.get("email", "")).strip().lower()
        self.name = str(kwargs.get("name", "Student")).strip()
        self.password_hash = str(kwargs.get("password_hash", ""))
        self.current_streak = int(kwargs.get("current_streak", 0))
        self.best_streak = int(kwargs.get("best_streak", 0))
        self.streak_freezes_available = int(kwargs.get("streak_freezes_available", 2))
        self.streak_freezes_used = list(kwargs.get("streak_freezes_used", []))
        self.cert_6m_sent = bool(kwargs.get("cert_6m_sent", False))
        self.cert_6m_sent_at = kwargs.get("cert_6m_sent_at")
        self.cert_sent_to_email = kwargs.get("cert_sent_to_email")
        self.claimed_rewards = list(kwargs.get("claimed_rewards", []))
        self.created_at = kwargs.get("created_at") or datetime.utcnow().isoformat()
        self.updated_at = kwargs.get("updated_at") or datetime.utcnow().isoformat()

    def to_dict(self, include_sensitive: bool = False) -> Dict[str, Any]:
        data = {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "current_streak": self.current_streak,
            "best_streak": self.best_streak,
            "streak_freezes_available": self.streak_freezes_available,
            "streak_freezes_used": self.streak_freezes_used,
            "cert_6m_sent": self.cert_6m_sent,
            "cert_6m_sent_at": self.cert_6m_sent_at,
            "cert_sent_to_email": self.cert_sent_to_email,
            "claimed_rewards": self.claimed_rewards,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }
        if include_sensitive:
            data["password_hash"] = self.password_hash
        return data


class JsonUserDB:
    """Thread-safe JSON document store for registered users."""
    def __init__(self, filepath: str = USER_FILE_PATH):
        self.filepath = filepath
        self._ensure_file()

    def _ensure_file(self):
        with _user_lock:
            if not os.path.exists(self.filepath):
                with open(self.filepath, "w", encoding="utf-8") as f:
                    json.dump([], f, indent=2)

    def _read_data(self) -> List[dict]:
        with _user_lock:
            if not os.path.exists(self.filepath):
                return []
            try:
                with open(self.filepath, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return []

    def _write_data(self, data: List[dict]):
        with _user_lock:
            temp_path = f"{self.filepath}.tmp"
            with open(temp_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            os.replace(temp_path, self.filepath)

    def get_by_email(self, email: str) -> Optional[UserRecord]:
        clean = str(email).strip().lower()
        for item in self._read_data():
            if item.get("email", "").strip().lower() == clean:
                return UserRecord(**item)
        return None

    def get_by_id(self, user_id: int) -> Optional[UserRecord]:
        for item in self._read_data():
            if item.get("id") == user_id:
                return UserRecord(**item)
        return None

    def create_user(self, name: str, email: str, password_hash: str) -> UserRecord:
        clean_email = str(email).strip().lower()
        clean_name = str(name).strip() or "Student"
        users = self._read_data()
        for item in users:
            if item.get("email", "").strip().lower() == clean_email:
                raise ValueError("An account with this email already exists.")
        new_id = max([item.get("id", 0) for item in users], default=0) + 1
        now_str = datetime.utcnow().isoformat()
        user_dict = {
            "id": new_id,
            "name": clean_name,
            "email": clean_email,
            "password_hash": password_hash,
            "current_streak": 0,
            "best_streak": 0,
            "cert_6m_sent": False,
            "cert_6m_sent_at": None,
            "cert_sent_to_email": None,
            "claimed_rewards": [],
            "created_at": now_str,
            "updated_at": now_str,
        }
        users.append(user_dict)
        self._write_data(users)
        return UserRecord(**user_dict)

    def update_user(self, user_id: int, updates: dict) -> Optional[UserRecord]:
        users = self._read_data()
        for i, item in enumerate(users):
            if item.get("id") == user_id:
                for k, v in updates.items():
                    item[k] = v
                item["updated_at"] = datetime.utcnow().isoformat()
                users[i] = item
                self._write_data(users)
                return UserRecord(**item)
        return None


user_db = JsonUserDB()


def get_user_db() -> JsonUserDB:
    return user_db
