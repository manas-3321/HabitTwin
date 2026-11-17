"""
HabitTwin FastAPI Backend Application
Powers future self simulation, habit analytics, ML predictions, and AI letters.
Now persisted via a lightweight, human-readable JSON Database (habittwin_data.json).
"""

import os
from contextlib import asynccontextmanager
from typing import List
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from .json_db import get_db, json_db, HabitLogRecord, JsonHabitDB
from .schemas import (
    HabitLogCreate,
    HabitLogUpdate,
    HabitLogResponse,
    BehavioralAnalysisResponse,
    PredictionRequest,
    PredictionResponse,
    LetterRequest,
    LetterResponse,
)
from .analysis import analyze_behaviors
from .predictive_engine import run_predictive_simulation
from .llm_service import generate_future_self_letter
from .seed_data import seed_database_records


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup and shutdown lifecycle handler.
    Initializes JSON database on launch.
    """
    json_db._ensure_file()
    yield


app = FastAPI(
    title="HabitTwin API",
    description="Your Digital Future Self: Predictive behavioral engine, habit analytics, and future self letters.",
    version="2.0.0",
    lifespan=lifespan,
)

# Enable CORS for local Vite development frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================================
# 1. Health & Status Endpoints
# =====================================================================

@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint to verify backend service and JSON storage status."""
    return {
        "status": "online",
        "service": "HabitTwin Predictive Core",
        "version": "2.0.0",
        "storage": "JSON Document Store (habittwin_data.json)",
        "disclaimer": (
            "Illustrative Simulation Disclaimer: HabitTwin projections are mathematical models "
            "intended for self-reflection and habit design. They do not constitute formal medical, "
            "clinical, academic, or financial advisory advice."
        )
    }


# =====================================================================
# 2. Daily Habit Tracking CRUD Endpoints (JSON File Backed)
# =====================================================================

@app.get("/api/habits", response_model=List[HabitLogResponse], tags=["Habits"])
def get_habit_logs(
    limit: int = Query(365, ge=1, le=365),
    db: JsonHabitDB = Depends(get_db)
):
    """Retrieves habit logs from the JSON database sorted by date descending."""
    logs = db.get_all(limit=limit)
    return [
        HabitLogResponse(
            id=log.id,
            date=log.date,
            sleep_hours=log.sleep_hours,
            screen_time_hours=log.screen_time_hours,
            physical_activity_minutes=log.physical_activity_minutes,
            study_hours=log.study_hours,
            spending_food=log.spending_food,
            spending_entertainment=log.spending_entertainment,
            spending_study=log.spending_study,
            spending_shopping=log.spending_shopping,
            spending_misc=log.spending_misc,
            study_mode=getattr(log, "study_mode", "regular") or "regular",
            mental_mood=getattr(log, "mental_mood", "balanced") or "balanced",
            notes=log.notes or "",
            total_spending=log.total_spending,
        )
        for log in logs
    ]


@app.post("/api/habits", response_model=HabitLogResponse, status_code=status.HTTP_201_CREATED, tags=["Habits"])
def create_or_upsert_habit_log(
    payload: HabitLogCreate,
    db: JsonHabitDB = Depends(get_db)
):
    """
    Creates a new daily habit log in JSON storage.
    If an entry for this date already exists, updates it cleanly (upsert).
    """
    target = db.upsert(payload.model_dump())
    return HabitLogResponse(
        id=target.id,
        date=target.date,
        sleep_hours=target.sleep_hours,
        screen_time_hours=target.screen_time_hours,
        physical_activity_minutes=target.physical_activity_minutes,
        study_hours=target.study_hours,
        spending_food=target.spending_food,
        spending_entertainment=target.spending_entertainment,
        spending_study=target.spending_study,
        spending_shopping=target.spending_shopping,
        spending_misc=target.spending_misc,
        study_mode=getattr(target, "study_mode", "regular") or "regular",
        mental_mood=getattr(target, "mental_mood", "balanced") or "balanced",
        notes=target.notes or "",
        total_spending=target.total_spending,
    )


@app.put("/api/habits/{log_id}", response_model=HabitLogResponse, tags=["Habits"])
def update_habit_log(
    log_id: int,
    payload: HabitLogUpdate,
    db: JsonHabitDB = Depends(get_db)
):
    """Updates specific fields of an existing habit log in JSON storage."""
    log = db.update(log_id, payload.model_dump(exclude_unset=True))
    if not log:
        raise HTTPException(status_code=404, detail="Habit log not found")

    return HabitLogResponse(
        id=log.id,
        date=log.date,
        sleep_hours=log.sleep_hours,
        screen_time_hours=log.screen_time_hours,
        physical_activity_minutes=log.physical_activity_minutes,
        study_hours=log.study_hours,
        spending_food=log.spending_food,
        spending_entertainment=log.spending_entertainment,
        spending_study=log.spending_study,
        spending_shopping=log.spending_shopping,
        spending_misc=log.spending_misc,
        study_mode=getattr(log, "study_mode", "regular") or "regular",
        mental_mood=getattr(log, "mental_mood", "balanced") or "balanced",
        notes=log.notes or "",
        total_spending=log.total_spending,
    )


@app.delete("/api/habits/clear", tags=["Habits"])
def clear_all_habits(db: JsonHabitDB = Depends(get_db)):
    """Deletes all habit records from JSON storage to allow a fresh start."""
    count = db.clear()
    return {"message": f"Cleared {count} habit logs"}


@app.delete("/api/habits/{log_id}", status_code=status.HTTP_200_OK, tags=["Habits"])
def delete_habit_log(log_id: int, db: JsonHabitDB = Depends(get_db)):
    """Deletes an individual habit log entry from JSON storage."""
    deleted = db.delete(log_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Habit log not found")

    return {"message": f"Habit log {log_id} deleted successfully"}


@app.post("/api/habits/seed", tags=["Habits"])
def seed_demo_data(db: JsonHabitDB = Depends(get_db)):
    """Populates 150 days of realistic, nuanced demo student habit logs in JSON file."""
    count = seed_database_records(db, overwrite=True)
    return {"message": f"Successfully loaded {count} days of sample habit data for demo into JSON database"}


# =====================================================================
# 3. Behavioral Analysis Endpoint
# =====================================================================

@app.get("/api/analysis", response_model=BehavioralAnalysisResponse, tags=["Analytics"])
def get_behavioral_analysis(db: JsonHabitDB = Depends(get_db)):
    """
    Computes statistical trends, habit averages, streaks, consistency score,
    Pearson correlation matrix, and personalized behavioral insights from JSON logs.
    """
    logs = db.get_all()
    analysis = analyze_behaviors(logs)
    return analysis


# =====================================================================
# 4. Predictive Modeling & Simulation Endpoint
# =====================================================================

@app.post("/api/predict", response_model=PredictionResponse, tags=["Simulation"])
def predict_future_trajectories(
    payload: PredictionRequest,
    db: JsonHabitDB = Depends(get_db)
):
    """
    Runs future-self predictive simulation:
    - Horizon: '6_months' or '5_years'
    - Generates Scenario A ('Current Path') vs Scenario B ('Improved Path')
    - Generates Custom Scenario if What-If sliders are adjusted
    - Predicts Academic (GPA), Health (vitality & burnout), Finance, and Lifestyle
    - Derives dynamic visual avatar states and time-series trajectories
    """
    logs = db.get_all()
    predictions = run_predictive_simulation(
        logs=logs,
        horizon=payload.horizon,
        what_if=payload.what_if,
        monthly_income=payload.monthly_income,
    )
    return predictions


# =====================================================================
# 5. LLM Future-Self Letter Endpoint
# =====================================================================

@app.post("/api/future-letter", response_model=LetterResponse, tags=["AI Letter"])
def generate_future_letter(
    payload: LetterRequest,
    db: JsonHabitDB = Depends(get_db)
):
    """
    Generates an emotionally resonant first-person letter from your future self.
    Integrates with Anthropic Claude (via ANTHROPIC_API_KEY) with automatic fallback
    to the built-in intelligent narrative engine if key is absent or offline.
    """
    logs = db.get_all()
    sim = run_predictive_simulation(
        logs=logs,
        horizon=payload.horizon,
        what_if=None,
        monthly_income=15000.0,
    )

    target_scenario = sim.scenario_b_improved if payload.scenario == "improved" else sim.scenario_a_current
    habits = target_scenario.assumed_habits
    metrics = target_scenario.metrics.model_dump()

    letter_data = generate_future_self_letter(
        user_name=payload.user_name or "Explorer",
        scenario=payload.scenario,
        horizon=payload.horizon,
        tone=payload.tone,
        habits=habits,
        metrics=metrics,
    )

    return LetterResponse(
        scenario=payload.scenario,
        horizon=payload.horizon,
        tone=payload.tone,
        title=letter_data["title"],
        letter_content=letter_data["letter_content"],
        suggestions=letter_data["suggestions"],
        generated_by=letter_data.get("generated_by", "simulation_engine"),
    )
