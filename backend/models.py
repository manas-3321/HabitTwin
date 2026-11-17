"""
HabitTwin SQLAlchemy Models
Represents daily habit logs stored in the local SQLite database.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, Text, DateTime
from .database import Base


class HabitLog(Base):
    """
    SQLAlchemy ORM Model for Daily Habit Records.
    Captures the primary behavioral dimensions:
    - Sleep duration (hours)
    - Leisure screen time (hours)
    - Physical exercise / workouts (minutes)
    - Focused study hours (hours)
    - Discretionary spending categorized into 5 buckets ($)
    """
    __tablename__ = "habit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    date = Column(String(10), unique=True, index=True, nullable=False)  # ISO format: YYYY-MM-DD
    
    # Core Lifestyle Habits
    sleep_hours = Column(Float, nullable=False, default=7.0)
    screen_time_hours = Column(Float, nullable=False, default=4.0)
    physical_activity_minutes = Column(Float, nullable=False, default=30.0)
    study_hours = Column(Float, nullable=False, default=3.0)
    
    # Financial Habits - Daily Categorized Spending (₹)
    spending_food = Column(Float, nullable=False, default=150.0)
    spending_entertainment = Column(Float, nullable=False, default=50.0)
    spending_study = Column(Float, nullable=False, default=0.0)
    spending_shopping = Column(Float, nullable=False, default=0.0)
    spending_misc = Column(Float, nullable=False, default=0.0)
    
    # College Student Study & Mood Dimensions
    study_mode = Column(String(30), nullable=True, default="regular")  # 'regular' | 'exam_crunch'
    mental_mood = Column(String(30), nullable=True, default="balanced")  # 'sharp' | 'balanced' | 'fatigued' | 'anxious'

    # Optional qualitative notes
    notes = Column(Text, nullable=True, default="")
    
    # Audit timestamp
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def total_spending(self) -> float:
        """Helper to get aggregate daily spend across all 5 categories."""
        return round(
            (self.spending_food or 0.0)
            + (self.spending_entertainment or 0.0)
            + (self.spending_study or 0.0)
            + (self.spending_shopping or 0.0)
            + (self.spending_misc or 0.0),
            2
        )
