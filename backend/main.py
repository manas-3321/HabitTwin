"""
HabitTwin FastAPI Application Entry Point
Exposes RESTful endpoints for habit logging, behavioral analytics,
predictive multi-scenario simulations, and LLM-powered future-self letters.
"""

import os
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv()

from .database import get_db, init_db
from .models import HabitLog
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
    Initializes database tables on launch.
    """
    init_db()
    yield


app = FastAPI(
    title="HabitTwin: Your Digital Future Self API",
    description=(
        "An AI-powered behavioral twin that simulates how everyday habits "
        "shape future lifestyle, academic performance, health, and financial well-being."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS for local development with React + Vite
cors_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================================
# 1. Health & Disclaimer Endpoint
# =====================================================================

@app.get("/api/health", tags=["System"])
def health_check():
    """Returns system status, version, and illustrative simulation disclaimer."""
    return {
        "status": "healthy",
        "service": "HabitTwin Core Backend",
        "version": "1.0.0",
        "disclaimer": (
            "Illustrative Simulation Disclaimer: HabitTwin projections are mathematical models "
            "intended for self-reflection and habit design. They do not constitute formal medical, "
            "clinical, academic, or financial advisory advice."
        )
    }


# =====================================================================
# 2. Daily Habit Tracking CRUD Endpoints
# =====================================================================

@app.get("/api/habits", response_model=List[HabitLogResponse], tags=["Habits"])
def get_habit_logs(
    limit: int = Query(365, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Retrieves habit logs sorted by date descending."""
    logs = db.query(HabitLog).order_by(HabitLog.date.desc()).limit(limit).all()
    # Format response including computed total_spending
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
    db: Session = Depends(get_db)
):
    """
    Creates a new daily habit log.
    If an entry for this date already exists, updates it cleanly (upsert).
    """
    existing = db.query(HabitLog).filter(HabitLog.date == payload.date).first()

    if existing:
        # Update existing record
        for key, val in payload.model_dump().items():
            setattr(existing, key, val)
        db.commit()
        db.refresh(existing)
        target = existing
    else:
        # Insert fresh log
        new_log = HabitLog(**payload.model_dump())
        db.add(new_log)
        db.commit()
        db.refresh(new_log)
        target = new_log

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
    db: Session = Depends(get_db)
):
    """Updates specific fields of an existing habit log."""
    log = db.query(HabitLog).filter(HabitLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Habit log not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, val in update_data.items():
        setattr(log, key, val)

    db.commit()
    db.refresh(log)

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
def clear_all_habits(db: Session = Depends(get_db)):
    """Deletes all habit records to allow a fresh start."""
    count = db.query(HabitLog).delete()
    db.commit()
    return {"message": f"Cleared {count} habit logs"}


@app.delete("/api/habits/{log_id}", status_code=status.HTTP_200_OK, tags=["Habits"])
def delete_habit_log(log_id: int, db: Session = Depends(get_db)):
    """Deletes an individual habit log entry."""
    log = db.query(HabitLog).filter(HabitLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Habit log not found")

    db.delete(log)
    db.commit()
    return {"message": f"Habit log {log_id} deleted successfully"}


@app.post("/api/habits/seed", tags=["Habits"])
def seed_demo_data(db: Session = Depends(get_db)):
    """Populates 30 days of realistic, nuanced demo student habit logs."""
    count = seed_database_records(db, overwrite=True)
    return {"message": f"Successfully loaded {count} days of sample habit data for demo"}


# =====================================================================
# 3. Behavioral Analysis Endpoint
# =====================================================================

@app.get("/api/analysis", response_model=BehavioralAnalysisResponse, tags=["Analytics"])
def get_behavioral_analysis(db: Session = Depends(get_db)):
    """
    Computes statistical trends, habit averages, streaks, consistency score,
    Pearson correlation matrix, and personalized behavioral insights.
    """
    logs = db.query(HabitLog).all()
    analysis = analyze_behaviors(logs)
    return analysis


# =====================================================================
# 4. Predictive Modeling & Simulation Endpoint
# =====================================================================

@app.post("/api/predict", response_model=PredictionResponse, tags=["Simulation"])
def predict_future_trajectories(
    payload: PredictionRequest,
    db: Session = Depends(get_db)
):
    """
    Runs future-self predictive simulation:
    - Horizon: '6_months' or '5_years'
    - Generates Scenario A ('Current Path') vs Scenario B ('Improved Path')
    - Generates Custom Scenario if What-If sliders are adjusted
    - Predicts Academic (GPA), Health (vitality & burnout), Finance, and Lifestyle
    - Derives dynamic visual avatar states and time-series trajectories
    """
    logs = db.query(HabitLog).all()
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
    db: Session = Depends(get_db)
):
    """
    Generates an emotionally resonant first-person letter from your future self.
    Integrates with Anthropic Claude (via ANTHROPIC_API_KEY) with automatic fallback
    to the built-in intelligent narrative engine if key is absent or offline.
    """
    logs = db.query(HabitLog).all()
    # Run prediction to feed exact contextual numbers to the LLM prompt
    sim = run_predictive_simulation(
        logs=logs,
        horizon=payload.horizon,
        what_if=None,
        monthly_income=15000.0,
    )

    # Select target scenario metrics
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
