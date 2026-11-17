"""
HabitTwin Demo Seed Generator
Populates the database with 30 days of realistic, authentic student habit logs.
Features natural day-to-day fluctuations, weekend variance, and realistic correlations.
"""

from datetime import datetime, timedelta
import random
from typing import List
from sqlalchemy.orm import Session
from .models import HabitLog


def generate_sample_habit_data(days: int = 150) -> List[dict]:
    """
    Synthesizes realistic student habit time-series with authentic correlations:
    - Friday & Saturday nights feature late screens, lower sleep, and higher dining spend.
    - Monday to Thursday feature higher study hours.
    - Days with high screen time feature reduced exercise and higher impulse shopping.
    """
    # Deterministic seed for reproducible demo walkthroughs
    rng = random.Random(42)
    today = datetime.now().date()
    start_date = today - timedelta(days=days - 1)

    sample_records = []

    for i in range(days):
        current_date = start_date + timedelta(days=i)
        is_weekend = current_date.weekday() >= 5  # Saturday or Sunday
        date_str = current_date.isoformat()

        if is_weekend:
            # Weekend pattern: light study, higher leisure screen, social spending
            study_hours = round(max(0.5, rng.uniform(0.8, 2.5)), 1)
            leisure_screen = round(rng.uniform(3.5, 5.5), 1)
            screen_time = round(study_hours + leisure_screen, 1)  # Total screen includes study
            sleep_hours = round(max(5.0, 8.6 - 0.28 * leisure_screen + rng.uniform(-0.3, 0.4)), 1)
            exercise_min = round(max(0.0, 45.0 - 5.0 * leisure_screen + rng.uniform(-5, 15)), 0)
            spending_food = round(rng.uniform(220.0, 380.0), 0)
            spending_entertainment = round(rng.uniform(120.0, 260.0), 0)
            spending_study = round(rng.choice([0.0, 0.0, 100.0]), 0)
            spending_shopping = round(rng.choice([0.0, 150.0, 350.0]), 0)
            spending_misc = round(rng.uniform(40.0, 120.0), 0)
            notes = rng.choice([
                "Weekend brunch and relaxing with friends.",
                "Late night movies and gaming session.",
                "Grocery run and impulse online ordering.",
                "Slept in after late screen binge; light review.",
            ])
        else:
            # Weekday pattern: focused study on laptop + moderate phone leisure
            study_hours = round(max(1.5, rng.uniform(2.2, 5.2)), 1)
            leisure_screen = round(rng.uniform(1.5, 3.2), 1)
            screen_time = round(study_hours + leisure_screen, 1)  # Total screen includes study
            sleep_hours = round(max(5.2, 8.4 - 0.32 * leisure_screen + rng.uniform(-0.3, 0.3)), 1)
            exercise_min = round(max(0.0, 50.0 - 5.5 * leisure_screen + rng.uniform(-5, 15)), 0)
            spending_food = round(rng.uniform(150.0, 250.0), 0)
            spending_entertainment = round(rng.choice([0.0, 50.0, 100.0]), 0)
            spending_study = round(rng.choice([0.0, 50.0, 120.0]), 0)
            spending_shopping = round(rng.choice([0.0, 0.0, 180.0]), 0)
            spending_misc = round(rng.uniform(20.0, 80.0), 0)
            notes = rng.choice([
                "Data structures lecture and lab assignment.",
                "Productive study session after decent rest.",
                "Gym workout after classes; felt sharp in evening.",
                "Tired afternoon after late phone scroll; needed coffee.",
                "Algorithm problem set submitted before midnight.",
            ])

        is_exam_week = (i % 35 in [31, 32, 33, 34])
        study_mode = "exam_crunch" if is_exam_week else "regular"
        if is_exam_week:
            mental_mood = "anxious" if sleep_hours < 6.0 else "sharp"
        else:
            mental_mood = "sharp" if sleep_hours >= 7.5 else ("fatigued" if sleep_hours < 5.8 else "balanced")

        sample_records.append({
            "date": date_str,
            "sleep_hours": sleep_hours,
            "screen_time_hours": screen_time,
            "physical_activity_minutes": exercise_min,
            "study_hours": study_hours,
            "spending_food": spending_food,
            "spending_entertainment": spending_entertainment,
            "spending_study": spending_study,
            "spending_shopping": spending_shopping,
            "spending_misc": spending_misc,
            "study_mode": study_mode,
            "mental_mood": mental_mood,
            "notes": notes,
        })

    return sample_records


def seed_database_records(db, overwrite: bool = True) -> int:
    """
    Clears existing habit logs (if overwrite is True) and inserts realistic demo logs.
    Supports both JsonHabitDB and SQLAlchemy Session.
    """
    records = generate_sample_habit_data(days=150)
    if hasattr(db, "seed"):
        return db.seed(records, overwrite=overwrite)

    if overwrite:
        db.query(HabitLog).delete()
        db.commit()

    for rec in records:
        log_entry = HabitLog(**rec)
        db.add(log_entry)

    db.commit()
    return len(records)
