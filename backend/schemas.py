"""
HabitTwin Pydantic Schemas
Defines request and response data contracts with strict validation and self-documenting types.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator
from datetime import date


# ==========================================
# 1. Daily Habit Log Schemas
# ==========================================

class HabitLogBase(BaseModel):
    """Base schema for logging daily habits with sensible data constraints."""
    date: str = Field(
        ...,
        description="Date of the log in YYYY-MM-DD format",
        example="2026-11-09"
    )
    sleep_hours: float = Field(
        ..., ge=0.0, le=24.0,
        description="Total sleep duration in hours (0.0 to 24.0)",
        example=7.5
    )
    screen_time_hours: float = Field(
        ..., ge=0.0, le=24.0,
        description="Total screen time in hours (0.0 to 24.0) including study laptops and leisure screens",
        example=6.5
    )
    physical_activity_minutes: float = Field(
        ..., ge=0.0, le=720.0,
        description="Physical exercise or active movement in minutes (0 to 720)",
        example=45.0
    )
    study_hours: float = Field(
        ..., ge=0.0, le=24.0,
        description="Focused deep-work or academic study hours (0.0 to 24.0)",
        example=3.5
    )
    spending_food: float = Field(
        0.0, ge=0.0,
        description="Spending on meals, groceries, and dining (₹)",
        example=180.00
    )
    spending_entertainment: float = Field(
        0.0, ge=0.0,
        description="Spending on movies, games, subscriptions, outings (₹)",
        example=80.00
    )
    spending_study: float = Field(
        0.0, ge=0.0,
        description="Spending on books, software tools, courses, supplies (₹)",
        example=50.00
    )
    spending_shopping: float = Field(
        0.0, ge=0.0,
        description="Spending on apparel, gadgets, lifestyle impulse buys (₹)",
        example=0.00
    )
    spending_misc: float = Field(
        0.0, ge=0.0,
        description="Any other miscellaneous discretionary spend (₹)",
        example=35.00
    )
    study_mode: Optional[str] = Field(
        "regular",
        description="Study phase: 'regular' (flexible semester) or 'exam_crunch' (pre-exam cramming sprint)"
    )
    mental_mood: Optional[str] = Field(
        "balanced",
        description="Mental state & mood: 'sharp' | 'balanced' | 'fatigued' | 'anxious'"
    )
    notes: Optional[str] = Field(
        "",
        description="Optional personal reflection or context for the day"
    )

    @field_validator("date")
    @classmethod
    def validate_date_format(cls, v: str) -> str:
        try:
            date.fromisoformat(v)
            return v
        except ValueError:
            raise ValueError("Date must be in ISO format: YYYY-MM-DD")


class HabitLogCreate(HabitLogBase):
    """Schema for creating a new daily habit entry."""
    pass


class HabitLogUpdate(BaseModel):
    """Schema for partially updating an existing habit entry."""
    sleep_hours: Optional[float] = Field(None, ge=0.0, le=24.0)
    screen_time_hours: Optional[float] = Field(None, ge=0.0, le=24.0)
    physical_activity_minutes: Optional[float] = Field(None, ge=0.0, le=720.0)
    study_hours: Optional[float] = Field(None, ge=0.0, le=24.0)
    spending_food: Optional[float] = Field(None, ge=0.0)
    spending_entertainment: Optional[float] = Field(None, ge=0.0)
    spending_study: Optional[float] = Field(None, ge=0.0)
    spending_shopping: Optional[float] = Field(None, ge=0.0)
    spending_misc: Optional[float] = Field(None, ge=0.0)
    notes: Optional[str] = None


class HabitLogResponse(HabitLogBase):
    """Schema returned by API including database ID and computed totals."""
    id: int
    total_spending: float

    class Config:
        from_attributes = True


# ==========================================
# 2. Behavioral Analytics Schemas
# ==========================================

class CorrelationPair(BaseModel):
    """Pearson correlation coefficient between two behavioral dimensions."""
    pair_name: str
    feature_x: str
    feature_y: str
    coefficient: float
    strength: str
    interpretation: str


class StreakMetrics(BaseModel):
    """Behavioral momentum tracking consecutive adherence."""
    logging_streak_days: int
    optimal_sleep_streak_days: int
    active_exercise_streak_days: int
    study_consistency_streak_days: int


class BehavioralSummary(BaseModel):
    """Aggregate statistics summarizing the user's logged dataset."""
    total_days_logged: int
    avg_sleep_hours: float
    avg_screen_time_hours: float
    avg_physical_activity_minutes: float
    avg_study_hours: float
    avg_daily_spending: float
    spending_breakdown: Dict[str, float]
    consistency_score: float  # 0 to 100 based on variability and adherence


class BehavioralAnalysisResponse(BaseModel):
    """Full analytical suite calculated over the user's logged history."""
    summary: BehavioralSummary
    streaks: StreakMetrics
    correlations: List[CorrelationPair]
    insights: List[str]


# ==========================================
# 3. Simulation & Future Prediction Schemas
# ==========================================

class WhatIfInputs(BaseModel):
    """Real-time slider adjustments for the what-if simulation."""
    sleep_hours: float = Field(7.5, ge=3.0, le=12.0)
    screen_time_hours: float = Field(5.5, ge=0.0, le=20.0, description="Total daily screen time including study hours")
    physical_activity_minutes: float = Field(45.0, ge=0.0, le=180.0)
    study_hours: float = Field(4.0, ge=0.0, le=14.0)
    daily_spending: float = Field(350.0, ge=0.0, le=5000.0)
    monthly_income: float = Field(15000.0, ge=0.0, le=200000.0)
    study_mode: Optional[str] = Field("regular", description="'regular' | 'exam_crunch'")
    mental_mood: Optional[str] = Field("balanced", description="'sharp' | 'balanced' | 'fatigued' | 'anxious'")


class DimensionScores(BaseModel):
    """Predicted outcome metrics across the core student dimensions."""
    # 1. Academic Performance & Cognitive Capability
    academic_gpa: float = Field(..., description="Projected CGPA (0.00 to 10.00)")
    academic_percentile: float = Field(..., description="Estimated cohort percentile (0-100)")
    mental_grasp_score: float = Field(75.0, description="Cognitive grasping power & memory retention rate (0-100)")
    exam_recall_rate: float = Field(75.0, description="Exam hall recall and writing fluency under exam conditions (0-100)")
    exam_blankout_risk: float = Field(25.0, description="Risk of freezing or blanking out during exam questions (0-100)")
    
    # 2. Health & Vitality
    health_index: float = Field(..., description="Composite health index (0 to 100)")
    fitness_score: float = Field(..., description="Aerobic & physical endurance score (0-100)")
    energy_score: float = Field(..., description="Daily cognitive & physical vitality (0-100)")
    burnout_risk: float = Field(..., description="Risk of chronic fatigue & burnout (0-100)")
    
    # 3. Financial Trajectory
    projected_savings: float = Field(..., description="Cumulative savings at the horizon (₹)")
    monthly_net_cashflow: float = Field(..., description="Net monthly delta between income and spend (₹)")
    savings_rate_pct: float = Field(..., description="Percentage of income saved")
    financial_health_score: float = Field(..., description="Financial stability & wealth score (0-100)")
    
    # 4. Lifestyle Composite
    overall_lifestyle_score: float = Field(..., description="Synthesized digital twin score (0 to 100)")


class AvatarVisualState(BaseModel):
    """Dynamic SVG visual attributes characterizing the future-self avatar."""
    posture: str = Field(..., description="'slouched' | 'neutral' | 'upright_confident'")
    expression: str = Field(..., description="'exhausted' | 'stressed' | 'neutral' | 'smiling' | 'radiant'")
    aura_color: str = Field(..., description="CSS hex code for aura glow")
    aura_intensity: float = Field(..., description="Aura blur/opacity multiplier 0.2 to 1.0")
    energy_level: int = Field(..., description="Energy rating 0-100")
    accessories: List[str] = Field(..., description="List of visual accessories: 'caffeine_mug', 'smartwatch', etc.")
    environment_theme: str = Field(..., description="'cluttered_dark_room' | 'balanced_workspace' | 'sunlit_loft'")
    badge_title: str = Field(..., description="Honorary twin title e.g. 'Burnout Zone' or 'High Performer'")


class TrajectoryPoint(BaseModel):
    """Data point along the projected timeline for charting."""
    period_label: str
    period_index: int
    academic_gpa: float
    health_index: float
    projected_savings: float
    lifestyle_score: float


class ScenarioDetails(BaseModel):
    """Comprehensive snapshot of a predicted future scenario."""
    id: str
    name: str
    description: str
    horizon: str
    assumed_habits: Dict[str, Any]
    metrics: DimensionScores
    avatar: AvatarVisualState
    trajectory: List[TrajectoryPoint]


class PredictionRequest(BaseModel):
    """Request payload for running predictive simulation."""
    horizon: str = Field("6_months", description="'6_months' or '5_years'")
    what_if: Optional[WhatIfInputs] = None
    monthly_income: float = Field(15000.0, ge=1000.0, le=500000.0)


class PredictionResponse(BaseModel):
    """Complete prediction payload comparing Scenario A, Scenario B, and What-If."""
    horizon: str
    baseline_habits: Dict[str, float]
    scenario_a_current: ScenarioDetails
    scenario_b_improved: ScenarioDetails
    scenario_custom: Optional[ScenarioDetails] = None
    delta_summary: Dict[str, float]
    disclaimer: str = (
        "Illustrative Simulation Disclaimer: HabitTwin predictions are algorithmic models "
        "designed for personal reflection and self-awareness. They do not constitute certified medical, "
        "academic, or financial advisory advice."
    )


# ==========================================
# 4. LLM Future-Self Letter Schemas
# ==========================================

class LetterRequest(BaseModel):
    """Payload to generate a personalized letter from your digital future self."""
    scenario: str = Field("improved", description="'current' | 'improved' | 'custom'")
    horizon: str = Field("5_years", description="'6_months' | '5_years'")
    tone: str = Field("motivational", description="'motivational' | 'honest' | 'gentle'")
    user_name: Optional[str] = Field("Explorer", description="Preferred name of the user")


class LetterResponse(BaseModel):
    """Response containing the emotionally resonant letter and targeted recommendations."""
    scenario: str
    horizon: str
    tone: str
    title: str
    letter_content: str
    suggestions: List[str]
    generated_by: str  # 'anthropic_claude' or 'simulation_engine'
