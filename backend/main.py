"""
HabitTwin FastAPI Backend Application
Powers future self simulation, habit analytics, ML predictions, and AI letters.
Now persisted via a lightweight, human-readable JSON Database (habittwin_data.json).
"""

import os
from contextlib import asynccontextmanager
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, Query, status, Response, Body
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from .json_db import get_db, json_db, HabitLogRecord, JsonHabitDB, user_db, get_user_db, JsonUserDB, UserRecord
from .auth import hash_password, verify_password, create_access_token, get_current_user_optional, require_current_user
from .certificate_service import generate_certificate_pdf, send_certificate_email
from .schemas import (
    HabitLogCreate,
    HabitLogUpdate,
    HabitLogResponse,
    BehavioralAnalysisResponse,
    PredictionRequest,
    PredictionResponse,
    LetterRequest,
    LetterResponse,
    WhatIfInputs,
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
    AuthResponse,
    SendCertificateRequest,
    CertificateStatusResponse,
    StreakFreezeRequest,
    StreakRestoreRequest,
    StreakReplenishRequest,
    StreakStatusResponse,
    TinyFishStatusResponse,
    TinyFishRunRequest,
    TinyFishResearchRequest,
    TinyFishResponse,
)
from .analysis import analyze_behaviors, calculate_streaks
from .predictive_engine import run_predictive_simulation
from .llm_service import generate_future_self_letter
from .seed_data import seed_database_records
from .tinyfish_service import (
    is_tinyfish_configured,
    run_web_agent,
    research_habit_topic,
    TINYFISH_API_BASE,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup and shutdown lifecycle handler.
    Initializes JSON database on launch.
    """
    json_db._ensure_file()
    user_db._ensure_file()
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
    db: JsonHabitDB = Depends(get_db),
    current_user: Optional[UserRecord] = Depends(get_current_user_optional),
    user_db: JsonUserDB = Depends(get_user_db),
):
    """
    Creates a new daily habit log in JSON storage.
    If an entry for this date already exists, updates it cleanly (upsert).
    If authenticated, automatically detects 6-month (180-day) streak and dispatches certificate email.
    """
    target = db.upsert(payload.model_dump())

    # Check streak and trigger 6-month certificate email if eligible
    if current_user:
        try:
            all_logs = db.get_all(limit=365)
            freezes_used = getattr(current_user, "streak_freezes_used", []) or []
            freezes_avail = getattr(current_user, "streak_freezes_available", 2)
            streaks = calculate_streaks(all_logs, freeze_dates=freezes_used, freezes_available=freezes_avail)
            c_streak = streaks.logging_streak_days
            b_streak = max(current_user.best_streak, c_streak)
            updates = {"current_streak": c_streak, "best_streak": b_streak}

            # Award +1 Streak Freeze on 15-day streak milestones (capped at 3)
            if c_streak > 0 and c_streak % 15 == 0 and freezes_avail < 3:
                updates["streak_freezes_available"] = min(3, freezes_avail + 1)

            if b_streak >= 180 and not current_user.cert_6m_sent:
                mail_res = send_certificate_email(current_user.email, current_user.name, streak_days=b_streak)
                updates["cert_6m_sent"] = True
                updates["cert_6m_sent_at"] = datetime.utcnow().isoformat()
                updates["cert_sent_to_email"] = current_user.email
                print(f"[Auto-Certificate] Emailed 6-month certificate to {current_user.email}: {mail_res.get('status')}")

            user_db.update_user(current_user.id, updates)
        except Exception as e:
            print(f"[Auto-Streak Audit Note] {e}")

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
    Generates a deeply personalized first-person letter from your future self,
    calculated directly from the user's actual habits, consistency streak, and focus area.
    """
    logs = db.get_all()

    # 1. Compute user's real baseline habits from logs or payload
    if payload.current_habits:
        baseline_habits = {
            "sleep_hours": float(payload.current_habits.get("sleep_hours", 7.0)),
            "screen_time_hours": float(payload.current_habits.get("screen_time_hours", 4.5)),
            "physical_activity_minutes": float(payload.current_habits.get("physical_activity_minutes", 30.0)),
            "study_hours": float(payload.current_habits.get("study_hours", 3.5)),
            "daily_spending": float(payload.current_habits.get("daily_spending", payload.current_habits.get("total_spending", 120.0))),
        }
    elif logs:
        sleeps = [float(l.sleep_hours or 7.0) for l in logs]
        screens = [float(l.screen_time_hours or 4.5) for l in logs]
        exercises = [float(l.physical_activity_minutes or 30.0) for l in logs]
        studies = [float(l.study_hours or 3.5) for l in logs]
        spends = [float(l.total_spending or 120.0) for l in logs]
        baseline_habits = {
            "sleep_hours": round(sum(sleeps) / len(sleeps), 1),
            "screen_time_hours": round(sum(screens) / len(screens), 1),
            "physical_activity_minutes": round(sum(exercises) / len(exercises), 1),
            "study_hours": round(sum(studies) / len(studies), 1),
            "daily_spending": round(sum(spends) / len(spends), 2),
        }
    else:
        baseline_habits = {
            "sleep_hours": 6.2,
            "screen_time_hours": 6.5,
            "physical_activity_minutes": 20.0,
            "study_hours": 2.2,
            "daily_spending": 380.0,
        }

    # 2. Determine target habits for this letter based on scenario
    if payload.target_habits:
        target_habits = {
            "sleep_hours": float(payload.target_habits.get("sleep_hours", 7.8)),
            "screen_time_hours": float(payload.target_habits.get("screen_time_hours", 4.0)),
            "physical_activity_minutes": float(payload.target_habits.get("physical_activity_minutes", 45.0)),
            "study_hours": float(payload.target_habits.get("study_hours", 4.5)),
            "daily_spending": float(payload.target_habits.get("daily_spending", payload.target_habits.get("total_spending", 100.0))),
        }
    elif payload.scenario == "improved":
        target_habits = {
            "sleep_hours": round(min(8.2, max(7.5, baseline_habits["sleep_hours"] + 1.0)), 1),
            "screen_time_hours": round(max(3.0, min(5.0, baseline_habits["screen_time_hours"] - 1.8)), 1),
            "physical_activity_minutes": round(min(60.0, max(40.0, baseline_habits["physical_activity_minutes"] + 20.0)), 1),
            "study_hours": round(min(6.5, max(4.0, baseline_habits["study_hours"] + 1.5)), 1),
            "daily_spending": round(max(80.0, min(250.0, baseline_habits["daily_spending"] * 0.65)), 2),
        }
    else:
        target_habits = baseline_habits.copy()

    # 3. Run predictive simulation
    what_if_model = WhatIfInputs(
        sleep_hours=target_habits["sleep_hours"],
        screen_time_hours=target_habits["screen_time_hours"],
        physical_activity_minutes=target_habits["physical_activity_minutes"],
        study_hours=target_habits["study_hours"],
        daily_spending=target_habits["daily_spending"],
        monthly_income=15000.0,
    )
    sim = run_predictive_simulation(
        logs=logs,
        horizon=payload.horizon,
        what_if=what_if_model,
        monthly_income=15000.0,
    )

    if payload.scenario == "improved":
        metrics = (sim.scenario_custom or sim.scenario_b_improved).metrics.model_dump()
    else:
        metrics = sim.scenario_a_current.metrics.model_dump()

    streak = payload.streak_days or len(logs)
    latest_note = payload.latest_notes or (logs[0].notes if logs and logs[0].notes else "")

    letter_data = generate_future_self_letter(
        user_name=payload.user_name or "Explorer",
        scenario=payload.scenario,
        horizon=payload.horizon,
        tone=payload.tone,
        habits=target_habits,
        metrics=metrics,
        baseline_habits=baseline_habits,
        user_focus=payload.user_focus or "balanced",
        streak_days=streak,
        latest_notes=latest_note,
    )

    habit_snapshot = {
        "baseline": baseline_habits,
        "target": target_habits,
        "streak_days": streak,
        "user_focus": payload.user_focus or "balanced",
    }

    return LetterResponse(
        scenario=payload.scenario,
        horizon=payload.horizon,
        tone=payload.tone,
        title=letter_data["title"],
        letter_content=letter_data["letter_content"],
        suggestions=letter_data["suggestions"],
        generated_by=letter_data.get("generated_by", "simulation_engine"),
        theme_badge=letter_data.get("theme_badge"),
        key_quote=letter_data.get("key_quote"),
        horizon_label=letter_data.get("horizon_label"),
        superpower=letter_data.get("superpower"),
        vulnerability=letter_data.get("vulnerability"),
        habit_snapshot=habit_snapshot,
        user_focus=payload.user_focus or "balanced",
    )


# =====================================================================
# 6. User Authentication Endpoints
# =====================================================================

@app.post("/api/auth/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED, tags=["Auth"])
def register_user(payload: UserRegisterRequest, db: JsonUserDB = Depends(get_user_db)):
    """Registers a new user account with hashed password and returns signed JWT token."""
    existing = db.get_by_email(payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    hashed = hash_password(payload.password)
    user = db.create_user(name=payload.name, email=payload.email, password_hash=hashed)
    token = create_access_token(user.id, user.email, user.name)
    return AuthResponse(token=token, user=UserResponse(**user.to_dict()))


@app.post("/api/auth/login", response_model=AuthResponse, tags=["Auth"])
def login_user(payload: UserLoginRequest, db: JsonUserDB = Depends(get_user_db)):
    """Authenticates user with email and password and returns signed JWT token."""
    user = db.get_by_email(payload.email)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token(user.id, user.email, user.name)
    return AuthResponse(token=token, user=UserResponse(**user.to_dict()))


@app.get("/api/auth/me", response_model=UserResponse, tags=["Auth"])
def get_current_user_profile(
    user: UserRecord = Depends(require_current_user),
    habit_db: JsonHabitDB = Depends(get_db),
    user_db: JsonUserDB = Depends(get_user_db),
):
    """Returns profile for authenticated user, synchronizing current streak status."""
    logs = habit_db.get_all(limit=365)
    streaks = calculate_streaks(logs)
    c_streak = streaks.logging_streak_days
    b_streak = max(user.best_streak, c_streak)
    if c_streak != user.current_streak or b_streak != user.best_streak:
        updated = user_db.update_user(user.id, {"current_streak": c_streak, "best_streak": b_streak})
        if updated:
            user = updated

    return UserResponse(**user.to_dict())


@app.post("/api/auth/update-name", response_model=UserResponse, tags=["Auth"])
def update_user_name(
    name: str = Body(..., embed=True),
    user: UserRecord = Depends(require_current_user),
    user_db: JsonUserDB = Depends(get_user_db),
):
    """Updates the user's display name."""
    clean_name = name.strip()
    if not clean_name:
        raise HTTPException(status_code=400, detail="Name cannot be empty.")
    updated = user_db.update_user(user.id, {"name": clean_name})
    return UserResponse(**updated.to_dict())


# =====================================================================
# 7. Automated 6-Month Certificate & Email Endpoints
# =====================================================================

@app.get("/api/certificate/status", response_model=CertificateStatusResponse, tags=["Certificate"])
def get_certificate_status(
    current_user: Optional[UserRecord] = Depends(get_current_user_optional),
    habit_db: JsonHabitDB = Depends(get_db),
):
    """Returns current streak, eligibility, and 6-month certificate email delivery status."""
    logs = habit_db.get_all(limit=365)
    streaks = calculate_streaks(logs)
    c_streak = streaks.logging_streak_days
    b_streak = max(c_streak, current_user.best_streak if current_user else 0)

    cert_sent = current_user.cert_6m_sent if current_user else False
    cert_sent_at = current_user.cert_6m_sent_at if current_user else None
    cert_email = current_user.cert_sent_to_email if current_user else None

    return CertificateStatusResponse(
        cert_6m_sent=cert_sent,
        cert_6m_sent_at=cert_sent_at,
        cert_sent_to_email=cert_email,
        current_streak=c_streak,
        best_streak=b_streak,
        eligible=b_streak >= 180,
    )


@app.post("/api/certificate/send-email", tags=["Certificate"])
def trigger_certificate_email(
    payload: Optional[SendCertificateRequest] = None,
    current_user: Optional[UserRecord] = Depends(get_current_user_optional),
    habit_db: JsonHabitDB = Depends(get_db),
    user_db: JsonUserDB = Depends(get_user_db),
):
    """
    Delivers the official 6-Month Streak Certificate PDF to the user's email address.
    Can be called manually for verification or test sending.
    """
    recipient_email = payload.email if (payload and payload.email) else (current_user.email if current_user else None)
    if not recipient_email:
        raise HTTPException(status_code=400, detail="Recipient email address is required.")

    user_name = (payload.name if payload and payload.name else None) or (current_user.name if current_user else "Campus Achiever")

    logs = habit_db.get_all(limit=365)
    streaks = calculate_streaks(logs)
    streak_days = max(streaks.logging_streak_days, current_user.best_streak if current_user else 0)
    if streak_days < 180 and not (payload and payload.force_test):
        streak_days = 180

    res = send_certificate_email(
        user_email=recipient_email,
        user_name=user_name,
        streak_days=streak_days,
        is_test=payload.force_test if payload else False,
    )

    if current_user:
        user_db.update_user(current_user.id, {
            "cert_6m_sent": True,
            "cert_6m_sent_at": datetime.utcnow().isoformat(),
            "cert_sent_to_email": recipient_email,
        })

    return res


@app.get("/api/certificate/download", tags=["Certificate"])
def download_certificate_pdf_endpoint(
    name: Optional[str] = Query(None),
    current_user: Optional[UserRecord] = Depends(get_current_user_optional),
    habit_db: JsonHabitDB = Depends(get_db),
):
    """Generates and downloads the official Certificate of Genuine Appreciation as a PDF file."""
    user_name = name or (current_user.name if current_user else "Campus Achiever")
    logs = habit_db.get_all(limit=365)
    streaks = calculate_streaks(logs)
    streak_days = max(streaks.logging_streak_days, current_user.best_streak if current_user else 0, 180)

    pdf_bytes = generate_certificate_pdf(user_name=user_name, streak_days=streak_days)
    clean_filename = f"HabitTwin_Certificate_{user_name.replace(' ', '_')}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{clean_filename}"'},
    )


# =====================================================================
# 8. Streak Freeze & Streak Restore Endpoints
# =====================================================================

@app.get("/api/streak/status", response_model=StreakStatusResponse, tags=["Streak Freeze"])
def get_streak_status(
    current_user: Optional[UserRecord] = Depends(get_current_user_optional),
    habit_db: JsonHabitDB = Depends(get_db),
):
    """Returns real-time streak continuity, available freezes, and broken streak status."""
    logs = habit_db.get_all(limit=365)
    freezes_used = list(getattr(current_user, "streak_freezes_used", []) or [])
    freezes_avail = getattr(current_user, "streak_freezes_available", 2)
    streaks = calculate_streaks(logs, freeze_dates=freezes_used, freezes_available=freezes_avail)

    c_streak = streaks.logging_streak_days
    b_streak = max(c_streak, current_user.best_streak if current_user else 0)
    can_restore = streaks.is_streak_broken and freezes_avail > 0

    msg = "Streak active and healthy 🔥"
    if streaks.is_protected_today:
        msg = "🛡️ Streak protected by active freeze"
    elif streaks.is_streak_broken:
        msg = f"⚠️ Missed {streaks.broken_date or 'yesterday'}! Use a streak freeze to restore."

    return StreakStatusResponse(
        current_streak=c_streak,
        best_streak=b_streak,
        freezes_available=freezes_avail,
        freezes_used=freezes_used,
        is_streak_broken=streaks.is_streak_broken,
        broken_date=streaks.broken_date,
        is_protected_today=streaks.is_protected_today,
        can_restore=can_restore,
        message=msg,
    )


@app.post("/api/streak/freeze", response_model=StreakStatusResponse, tags=["Streak Freeze"])
def apply_streak_freeze(
    payload: Optional[StreakFreezeRequest] = None,
    current_user: Optional[UserRecord] = Depends(get_current_user_optional),
    habit_db: JsonHabitDB = Depends(get_db),
    user_db: JsonUserDB = Depends(get_user_db),
):
    """
    Applies a streak freeze to shield a missed day and protect unbroken streak momentum.
    """
    today = datetime.utcnow().date()
    yesterday = (today - timedelta(days=1)).isoformat()
    target_date = (payload.date if payload and payload.date else yesterday).strip()

    freezes_used = list(getattr(current_user, "streak_freezes_used", []) or [])
    freezes_avail = getattr(current_user, "streak_freezes_available", 2)

    if target_date in freezes_used:
        logs = habit_db.get_all(limit=365)
        streaks = calculate_streaks(logs, freeze_dates=freezes_used, freezes_available=freezes_avail)
        return StreakStatusResponse(
            current_streak=streaks.logging_streak_days,
            best_streak=max(streaks.logging_streak_days, current_user.best_streak if current_user else 0),
            freezes_available=freezes_avail,
            freezes_used=freezes_used,
            is_streak_broken=streaks.is_streak_broken,
            broken_date=streaks.broken_date,
            is_protected_today=streaks.is_protected_today,
            can_restore=False,
            message=f"Date {target_date} is already shielded by a streak freeze.",
        )

    if freezes_avail <= 0:
        raise HTTPException(
            status_code=400,
            detail="No streak freezes remaining. Earn one with a 15-day streak or claim an emergency student freeze."
        )

    freezes_used.append(target_date)
    freezes_avail = max(0, freezes_avail - 1)

    logs = habit_db.get_all(limit=365)
    streaks = calculate_streaks(logs, freeze_dates=freezes_used, freezes_available=freezes_avail)
    c_streak = streaks.logging_streak_days
    b_streak = max(c_streak, current_user.best_streak if current_user else 0)

    if current_user:
        user_db.update_user(current_user.id, {
            "streak_freezes_available": freezes_avail,
            "streak_freezes_used": freezes_used,
            "current_streak": c_streak,
            "best_streak": b_streak,
        })

    return StreakStatusResponse(
        current_streak=c_streak,
        best_streak=b_streak,
        freezes_available=freezes_avail,
        freezes_used=freezes_used,
        is_streak_broken=streaks.is_streak_broken,
        broken_date=streaks.broken_date,
        is_protected_today=streaks.is_protected_today,
        can_restore=streaks.is_streak_broken and freezes_avail > 0,
        message=f"🧊 Streak freeze activated for {target_date}! Your {c_streak}-day streak is protected.",
    )


@app.post("/api/streak/restore", response_model=StreakStatusResponse, tags=["Streak Freeze"])
def restore_broken_streak(
    payload: Optional[StreakRestoreRequest] = None,
    current_user: Optional[UserRecord] = Depends(get_current_user_optional),
    habit_db: JsonHabitDB = Depends(get_db),
    user_db: JsonUserDB = Depends(get_user_db),
):
    """
    Restores a broken streak by bridging the missed day using an available freeze.
    """
    today = datetime.utcnow().date()
    yesterday = (today - timedelta(days=1)).isoformat()
    target_date = (payload.date if payload and payload.date else yesterday).strip()

    freezes_used = list(getattr(current_user, "streak_freezes_used", []) or [])
    freezes_avail = getattr(current_user, "streak_freezes_available", 2)

    if target_date not in freezes_used:
        if freezes_avail <= 0:
            raise HTTPException(
                status_code=400,
                detail="No streak freezes remaining. Claim an emergency student freeze to restore."
            )
        freezes_used.append(target_date)
        freezes_avail = max(0, freezes_avail - 1)

    logs = habit_db.get_all(limit=365)
    streaks = calculate_streaks(logs, freeze_dates=freezes_used, freezes_available=freezes_avail)
    c_streak = streaks.logging_streak_days
    b_streak = max(c_streak, current_user.best_streak if current_user else 0)

    if current_user:
        user_db.update_user(current_user.id, {
            "streak_freezes_available": freezes_avail,
            "streak_freezes_used": freezes_used,
            "current_streak": c_streak,
            "best_streak": b_streak,
        })

    return StreakStatusResponse(
        current_streak=c_streak,
        best_streak=b_streak,
        freezes_available=freezes_avail,
        freezes_used=freezes_used,
        is_streak_broken=False,
        broken_date=None,
        is_protected_today=True,
        can_restore=False,
        message=f"🎉 Streak successfully restored! Your {c_streak}-day streak is back in action.",
    )


@app.post("/api/streak/replenish", response_model=StreakStatusResponse, tags=["Streak Freeze"])
def replenish_streak_freeze(
    payload: Optional[StreakReplenishRequest] = None,
    current_user: Optional[UserRecord] = Depends(get_current_user_optional),
    habit_db: JsonHabitDB = Depends(get_db),
    user_db: JsonUserDB = Depends(get_user_db),
):
    """
    Replenishes a streak freeze (e.g. earned via discipline milestone or student recovery grant, max 3).
    """
    amount = payload.amount if payload else 1
    freezes_used = list(getattr(current_user, "streak_freezes_used", []) or [])
    current_freezes = getattr(current_user, "streak_freezes_available", 2)
    new_freezes = min(3, current_freezes + amount)

    logs = habit_db.get_all(limit=365)
    streaks = calculate_streaks(logs, freeze_dates=freezes_used, freezes_available=new_freezes)
    c_streak = streaks.logging_streak_days
    b_streak = max(c_streak, current_user.best_streak if current_user else 0)

    if current_user:
        user_db.update_user(current_user.id, {
            "streak_freezes_available": new_freezes,
        })

    return StreakStatusResponse(
        current_streak=c_streak,
        best_streak=b_streak,
        freezes_available=new_freezes,
        freezes_used=freezes_used,
        is_streak_broken=streaks.is_streak_broken,
        broken_date=streaks.broken_date,
        is_protected_today=streaks.is_protected_today,
        can_restore=streaks.is_streak_broken and new_freezes > 0,
        message=f"⚡ +{amount} Streak Freeze granted! You now have {new_freezes} active freezes.",
    )


# =====================================================================
# 7. TinyFish Web Agent & Research Endpoints
# =====================================================================

@app.get("/api/tinyfish/status", response_model=TinyFishStatusResponse, tags=["TinyFish"])
def get_tinyfish_status():
    """
    Returns the operational status of the TinyFish Web Agent integration.
    """
    configured = is_tinyfish_configured()
    return TinyFishStatusResponse(
        configured=configured,
        api_base=TINYFISH_API_BASE,
        status="ACTIVE" if configured else "UNCONFIGURED",
        supported_features=[
            "autonomous_web_agent",
            "goal_driven_browser_navigation",
            "habit_science_research",
            "web_resource_extraction",
        ],
    )


@app.post("/api/tinyfish/automate", response_model=TinyFishResponse, tags=["TinyFish"])
def run_tinyfish_automation(payload: TinyFishRunRequest):
    """
    Executes a goal-driven browser automation task on a target URL using TinyFish.
    """
    if not is_tinyfish_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="TinyFish integration is not configured. Set TINYFISH_API_KEY in backend/.env.",
        )
    res = run_web_agent(url=payload.url, goal=payload.goal, timeout=payload.timeout or 45)
    return TinyFishResponse(**res)


@app.post("/api/tinyfish/research", response_model=TinyFishResponse, tags=["TinyFish"])
def run_tinyfish_research(payload: TinyFishResearchRequest):
    """
    Performs autonomous agent web research on habit science, sleep hygiene, or study methods.
    """
    if not is_tinyfish_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="TinyFish integration is not configured. Set TINYFISH_API_KEY in backend/.env.",
        )
    res = research_habit_topic(
        topic=payload.topic,
        target_url=payload.target_url,
        timeout=payload.timeout or 45,
    )
    return TinyFishResponse(**res)

