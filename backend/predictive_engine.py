"""
HabitTwin Predictive Simulation Engine
Combines transparent empirical rule-based models with scikit-learn regression
to simulate future trajectories across Academic, Health, Finance, and Lifestyle dimensions.
"""

from typing import List, Dict, Tuple, Optional
import math
import numpy as np

from .models import HabitLog
from .schemas import (
    WhatIfInputs,
    DimensionScores,
    AvatarVisualState,
    TrajectoryPoint,
    ScenarioDetails,
    PredictionResponse,
)


def _fit_and_predict_ridge(
    X: np.ndarray, y: np.ndarray, x_input: np.ndarray, alpha: float = 1.0
) -> float:
    """
    Fits Ridge L2-regularized linear regression and predicts for x_input.
    Uses scikit-learn Ridge when available, and seamlessly falls back to the
    exact closed-form NumPy normal equation (X_c^T X_c + alpha*I)^(-1) X_c^T y_c
    if Windows Application Control restricts multiprocessing extensions.
    """
    try:
        from sklearn.linear_model import Ridge

        ridge = Ridge(alpha=alpha)
        ridge.fit(X, y)
        return float(ridge.predict(x_input)[0])
    except Exception:
        X_mean = np.mean(X, axis=0)
        y_mean = float(np.mean(y))
        X_centered = X - X_mean
        y_centered = y - y_mean
        n_features = X.shape[1]
        coef = np.linalg.solve(
            X_centered.T @ X_centered + alpha * np.eye(n_features),
            X_centered.T @ y_centered,
        )
        intercept = y_mean - float(X_mean @ coef)
        return float((x_input @ coef)[0] + intercept)


# =====================================================================
# 1. Mathematical Simulation Models
# =====================================================================

def compute_exercise_academic_delta(activity_min: float) -> float:
    """
    Computes academic CGPA impact from daily physical movement & exercise:
    - Less than 1 hour (< 60 mins): increases a little with a slow rate (0.00 to +0.08 CGPA).
    - 1 to 2 hours (60 to 120 mins) up to 2.3 hours (138 mins): stable plateau at +0.08 CGPA.
    - More than 2.3 hours (> 138 mins): reducing a little due to physical exhaustion/fatigue.
    """
    mins = max(0.0, float(activity_min))
    if mins < 60.0:
        # Less than 1 hour: increases a little with a slow rate
        return 0.08 * (mins / 60.0)
    elif mins <= 138.0:
        # 1 to 2.3 hours (60 to 138 mins): stable plateau
        return 0.08
    else:
        # More than 2.3 hours: reducing a little
        excess_hours = (mins - 138.0) / 60.0
        return 0.08 - (0.08 * excess_hours)


def compute_cognitive_grasp_and_exam_performance(
    sleep: float,
    screen_time: float,
    activity_min: float,
    study_hours: float,
    study_mode: str = "regular",
    mental_mood: str = "balanced",
) -> Tuple[float, float, float]:
    """
    Simulates cognitive grasping power, exam hall recall, and blank-out risk
    tailored specifically for college students:
    - Flexible daily study hours vs pre-exam cramming sprints
    - Memory consolidation through slow-wave and REM sleep
    - Mood state (in-the-zone vs brain fog vs exam anxiety)
    """
    # 1. Sleep & Memory Consolidation (Hippocampus retention)
    if sleep >= 8.5:
        sleep_grasp = 28.0
    elif sleep >= 7.5:
        sleep_grasp = 32.0  # Peak REM & deep memory consolidation
    elif sleep >= 6.5:
        sleep_grasp = 22.0
    elif sleep >= 5.0:
        sleep_grasp = 8.0   # Noticeable memory decay / brain fog
    else:
        sleep_grasp = -16.0  # Acute sleep debt / high prefrontal deficit

    # 2. Mood & Mental Capability Factor
    mood_offsets = {
        "sharp": +14.0,     # In the zone, high motivation & quick grasp
        "balanced": +4.0,   # Normal calm focus
        "fatigued": -10.0,  # Afternoon slump, slow processing
        "anxious": -18.0,   # High exam stress, racing mind, panic
    }
    mood_boost = mood_offsets.get(mental_mood, 4.0)

    # 3. Aerobic Movement (Reduced correlation with academic performance)
    # Increases a little under 1h, stable between 1 to 2.3h, reduces slightly beyond 2.3h
    mins = max(0.0, float(activity_min))
    if mins < 60.0:
        exercise_boost = 3.5 * (mins / 60.0)
    elif mins <= 138.0:
        exercise_boost = 3.5
    else:
        excess_hours = (mins - 138.0) / 60.0
        exercise_boost = 3.5 - (2.5 * excess_hours)

    # 4. Leisure Screen Distraction & Attention Residue
    leisure_screen = max(0.0, screen_time - study_hours)
    screen_fog = 3.5 * max(0.0, leisure_screen - 1.5)

    # 5. Pre-Exam Sprint Cramming Fatigue Dynamics
    # When studying whole while before exams (> 6 hours in a single day):
    cram_penalty = 0.0
    if study_hours > 6.0:
        excess_study = study_hours - 6.0
        # If sleep is protected (>6.5h), the brain can absorb the sprint;
        # if sleep-deprived (<5.5h), cramming causes catastrophic brain saturation
        sleep_buffer = max(0.0, sleep - 5.5) / 2.5
        cram_penalty = math.pow(excess_study, 1.2) * (4.2 - 2.8 * sleep_buffer)

    raw_grasp = 52.0 + sleep_grasp + mood_boost + exercise_boost - screen_fog - cram_penalty
    mental_grasp_score = float(np.clip(raw_grasp, 15.0, 99.0))

    # Exam Blank-Out Risk (Freezing or blanking out on exam questions)
    raw_blankout = (
        (100.0 - mental_grasp_score) * 0.65
        + (18.0 if sleep < 5.5 else 0.0)
        + (14.0 if mental_mood == "anxious" else 0.0)
        + (8.0 if study_mode == "exam_crunch" and sleep < 6.0 else 0.0)
    )
    exam_blankout_risk = float(np.clip(raw_blankout, 5.0, 95.0))

    # Exam Hall Recall & Writing Fluidity
    raw_recall = mental_grasp_score * (1.0 - (exam_blankout_risk / 220.0))
    exam_recall_rate = float(np.clip(raw_recall, 10.0, 99.0))

    return round(mental_grasp_score, 1), round(exam_recall_rate, 1), round(exam_blankout_risk, 1)


def simulate_academic_performance(
    sleep: float,
    screen_time: float,
    activity_min: float,
    study_hours: float,
    horizon_months: int,
    user_features: Optional[np.ndarray] = None,
    study_mode: str = "regular",
    mental_mood: str = "balanced",
) -> Tuple[float, float, float, float, float]:
    """
    Predicts academic CGPA (0.00 to 10.00), cohort percentile (0-100%),
    mental grasping score, exam recall rate, and exam blank-out risk.
    """
    mental_grasp, exam_recall, exam_blankout = compute_cognitive_grasp_and_exam_performance(
        sleep, screen_time, activity_min, study_hours, study_mode, mental_mood
    )

    # 1. Domain prior rule-based calculation
    base_gpa = 7.50

    # Sleep impact
    if sleep < 7.0:
        sleep_delta = -0.48 * math.pow(max(0.0, 7.0 - sleep), 1.15)
    elif 7.5 <= sleep <= 8.5:
        sleep_delta = 0.38
    elif sleep > 9.5:
        sleep_delta = -0.15 * (sleep - 9.5)
    else:
        sleep_delta = 0.12

    # Effective study adjusted by cognitive grasping capacity
    grasp_factor = math.pow(mental_grasp / 100.0, 0.82)
    effective_study = max(0.0, study_hours) * grasp_factor
    study_delta = 1.25 * math.log(1.0 + 0.88 * effective_study) - 0.92

    # Screen Distraction Penalty: Screen time includes study hours,
    # so recreational leisure screen time = max(0.0, screen_time - study_hours).
    leisure_screen = max(0.0, screen_time - study_hours)
    excess_leisure = max(0.0, leisure_screen - 1.5)
    screen_delta = -0.25 * math.pow(excess_leisure, 1.1)

    # Mild physical eye strain / optical fatigue penalty if extreme total screen time (> 9.0 hrs)
    if screen_time > 9.0:
        screen_delta -= 0.08 * (screen_time - 9.0)

    # Physical activity impact on CGPA (reduced correlation):
    # - < 1 hr: increases a little with a slow rate (0.00 to +0.08)
    # - 1 to 2.3 hrs: stable plateau (+0.08)
    # - > 2.3 hrs: reduces slightly from physical exhaustion
    exercise_delta = compute_exercise_academic_delta(activity_min)

    # Exam hall performance execution factor
    exam_execution_delta = (exam_recall - 70.0) * 0.015

    target_gpa = base_gpa + sleep_delta + study_delta + screen_delta + exercise_delta + exam_execution_delta

    # Academic evolution across time (cumulative progression over months & semesters)
    deviation = target_gpa - base_gpa
    if horizon_months <= 6:
        # Over a 6-month semester, CGPA steadily accumulates from base toward full semester performance
        progression_ratio = 0.35 + 0.65 * (max(1.0, float(horizon_months)) / 6.0)
        rule_gpa = base_gpa + (deviation * progression_ratio)
    else:
        # Over multi-year horizons (Months 6 to 60), consistent study habits compound
        compounding_ratio = 1.00 + 0.35 * ((float(horizon_months) - 6.0) / 54.0)
        rule_gpa = base_gpa + (deviation * compounding_ratio)

    # 2. Ridge regression personal model (if >= 7 historical logs exist)
    predicted_gpa = rule_gpa
    if user_features is not None and len(user_features) >= 7:
        try:
            X = user_features
            exercise_component = np.array([compute_exercise_academic_delta(a) for a in X[:, 2]])
            y = 7.0 + 0.30 * X[:, 3] + 0.15 * X[:, 0] - 0.12 * X[:, 1] + exercise_component
            x_input = np.array([[sleep, screen_time, activity_min, study_hours]])
            ml_pred = _fit_and_predict_ridge(X, y, x_input, alpha=1.0)
            predicted_gpa = 0.70 * rule_gpa + 0.30 * ml_pred
        except Exception:
            predicted_gpa = rule_gpa

    final_gpa = round(float(np.clip(predicted_gpa, 3.00, 10.00)), 2)

    # Estimated academic cohort percentile (using Gaussian CDF approximation around mean 7.5, std 1.25)
    z = (final_gpa - 7.50) / 1.25
    percentile = round(float(np.clip(100.0 / (1.0 + math.exp(-1.7 * z)), 5.0, 99.0)), 1)

    return final_gpa, percentile, mental_grasp, exam_recall, exam_blankout


def simulate_health_and_vitality(
    sleep: float,
    screen_time: float,
    activity_min: float,
    study_hours: float,
    horizon_months: int,
) -> Tuple[float, float, float, float]:
    """
    Simulates Health Index, Fitness Score, Energy Score, and Burnout Risk (0 - 100).

    Formulas:
    1. Fitness Score:
       Driven by physical activity minutes, penalized by sedentary screen time.
       Fitness = clamp(25.0 + 1.25 * activity_min - 2.2 * max(0, screen_time - 3.5), 10, 99)
    2. Daily Energy Score:
       Sleep quality factor: S_q = max(0, 100 - 28 * |7.8 - sleep|)
       Energy = clamp(0.55 * S_q + 0.30 * min(100, 2 * activity_min) - 0.20 * (8 * max(0, screen_time - 3)), 10, 99)
    3. Burnout / Stress Risk:
       StressLoad = (study_hours * 11) + (screen_time * 9) - (sleep * 7.5) - (activity_min * 0.45)
       BurnoutRisk = clamp(40 + StressLoad, 5, 95)
    4. Composite Health Index:
       Health = 0.40 * Fitness + 0.40 * Energy + 0.20 * (100 - BurnoutRisk)
    """
    # Screen time includes study hours; leisure screen is recreational exposure
    leisure_screen = max(0.0, screen_time - study_hours)

    # 1. Fitness Score: active exercise boosts endurance, sedentary leisure screens penalize it
    excess_sedentary = max(0.0, leisure_screen - 2.0)
    raw_fitness = 25.0 + (1.25 * activity_min) - (2.0 * excess_sedentary)
    fitness_score = float(np.clip(raw_fitness, 10.0, 99.0))

    # 2. Energy Score
    sleep_optimality = max(0.0, 100.0 - 28.0 * abs(7.8 - sleep))
    exercise_energy = min(100.0, 2.2 * activity_min)
    screen_fatigue = (4.0 * max(0.0, screen_time - 4.0)) + (5.0 * max(0.0, leisure_screen - 2.0))
    raw_energy = (0.55 * sleep_optimality) + (0.30 * exercise_energy) - (0.18 * screen_fatigue)
    energy_score = float(np.clip(raw_energy, 10.0, 99.0))

    # 3. Burnout Risk:
    # Screen time includes study hours; isolate deep-study load from recreational fatigue
    stress_load = (study_hours * 7.5) + (leisure_screen * 7.0) + (screen_time * 1.5) - (sleep * 7.5) - (activity_min * 0.45)
    raw_burnout = 40.0 + stress_load

    # Over time, chronic stress or healthy habits compound
    if horizon_months <= 6:
        adapt_ratio = 0.60 + 0.40 * (max(1.0, float(horizon_months)) / 6.0)
        fitness_score = float(np.clip(50.0 + (fitness_score - 50.0) * adapt_ratio, 10.0, 99.0))
        energy_score = float(np.clip(50.0 + (energy_score - 50.0) * adapt_ratio, 10.0, 99.0))
    elif horizon_months >= 60:
        if raw_burnout > 65.0:
            raw_burnout += 15.0  # Chronic exhaustion
        elif raw_burnout < 35.0:
            raw_burnout -= 10.0  # Robust stress resilience

    burnout_risk = float(np.clip(raw_burnout, 5.0, 95.0))

    # 4. Composite Health Index
    raw_health = (0.40 * fitness_score) + (0.40 * energy_score) + (0.20 * (100.0 - burnout_risk))
    health_index = float(np.clip(raw_health, 10.0, 99.0))

    return (
        round(health_index, 1),
        round(fitness_score, 1),
        round(energy_score, 1),
        round(burnout_risk, 1),
    )


def simulate_financial_trajectory(
    daily_spend: float,
    monthly_income: float,
    horizon_months: int,
) -> Tuple[float, float, float, float]:
    """
    Simulates cumulative savings and financial stability score.

    Formulas:
    1. Monthly Discretionary Spending = daily_spend * 30.416
    2. Monthly Net Cashflow = monthly_income - monthly_spend
    3. Compound Wealth Accumulation:
       Assumes 5.0% annual investment return (index fund / high-yield savings) on positive balances:
       r = 0.05 / 12 monthly interest.
       FV = sum_{k=1}^T (NetCashflow * (1 + r)^(T - k))
    4. Financial Health Score (0 - 100):
       Based on savings rate = NetCashflow / Income.
       - Savings rate >= 35% -> Score ~ 95
       - Savings rate 15-30% -> Score ~ 75-90
       - Savings rate 0-15%  -> Score ~ 50-70
       - Negative savings (debt) -> Score drops to 10-35
    """
    days_per_month = 30.416
    monthly_spend = daily_spend * days_per_month
    monthly_net = monthly_income - monthly_spend

    # Compound growth rate (5% p.a. -> 0.05 / 12 per month)
    monthly_rate = 0.05 / 12.0

    # Cumulative future value after horizon_months
    cumulative_savings = 0.0
    for k in range(1, horizon_months + 1):
        # Compound each month's contribution
        cumulative_savings += monthly_net * math.pow(1.0 + monthly_rate, horizon_months - k)

    # Savings rate percentage
    savings_rate_pct = (monthly_net / monthly_income) * 100.0 if monthly_income > 0 else 0.0

    # Financial health score calculation
    if monthly_net >= 0:
        rate_ratio = min(1.0, (monthly_net / monthly_income) / 0.40)
        fin_score = 50.0 + (50.0 * rate_ratio)
    else:
        debt_ratio = min(1.0, abs(monthly_net) / (monthly_income * 0.50))
        fin_score = 50.0 - (40.0 * debt_ratio)

    fin_score = float(np.clip(fin_score, 5.0, 99.0))

    return (
        round(cumulative_savings, 2),
        round(monthly_net, 2),
        round(savings_rate_pct, 1),
        round(fin_score, 1),
    )


def compute_lifestyle_composite(
    gpa: float,
    health_index: float,
    financial_health_score: float,
    consistency_score: float = 75.0,
) -> float:
    """
    Computes unified digital twin lifestyle score (0 - 100).
    Weights:
    - 30% Academic CGPA (normalized to 100% using max 10.0 scale)
    - 35% Health & Vitality Index
    - 25% Financial Stability Score
    - 10% Behavioral Consistency
    """
    norm_gpa = (gpa / 10.0) * 100.0
    composite = (
        0.30 * norm_gpa
        + 0.35 * health_index
        + 0.25 * financial_health_score
        + 0.10 * consistency_score
    )
    return round(float(np.clip(composite, 10.0, 99.0)), 1)


# =====================================================================
# 2. Dynamic Avatar Visual State Engine
# =====================================================================

def determine_avatar_visual_state(
    metrics: DimensionScores,
    habits: Dict[str, float],
    scenario_id: str,
) -> AvatarVisualState:
    """
    Derives animated SVG avatar attributes reflecting the digital future self.
    Directly reflects posture, expression, aura color, energy, and surroundings.
    """
    energy = int(metrics.energy_score)
    burnout = metrics.burnout_risk
    lifestyle = metrics.overall_lifestyle_score
    sleep = habits.get("sleep_hours", 7.0)
    screen = habits.get("screen_time_hours", 4.0)
    exercise = habits.get("physical_activity_minutes", 30.0)
    gpa = metrics.academic_gpa

    # 1. Posture
    if energy < 42 or burnout > 70:
        posture = "slouched"
    elif energy >= 68 and exercise >= 35:
        posture = "upright_confident"
    else:
        posture = "neutral"

    # 2. Facial Expression
    if energy < 35 and burnout > 65:
        expression = "exhausted"
    elif burnout > 68:
        expression = "stressed"
    elif lifestyle >= 82:
        expression = "radiant"
    elif lifestyle >= 65:
        expression = "smiling"
    elif lifestyle >= 50:
        expression = "thoughtful"
    else:
        expression = "neutral"

    # 3. Aura Color & Intensity
    if burnout >= 70:
        aura_color = "#EF4444"  # High Stress Crimson
        aura_intensity = 0.85
    elif energy < 45:
        aura_color = "#F59E0B"  # Fatigue Amber
        aura_intensity = 0.50
    elif lifestyle >= 85:
        aura_color = "#8B5CF6"  # Elite Mastery Cosmic Violet
        aura_intensity = 0.95
    elif lifestyle >= 70:
        aura_color = "#10B981"  # Vibrant Emerald Vitality
        aura_intensity = 0.80
    else:
        aura_color = "#3B82F6"  # Balanced Sapphire Blue
        aura_intensity = 0.65

    # 4. Contextual Accessories
    accessories: List[str] = []
    if sleep < 6.5:
        accessories.append("dark_circles")
        accessories.append("caffeine_mug")
    leisure_screen = max(0.0, screen - habits.get("study_hours", 3.0))
    if leisure_screen > 3.0 or screen > 8.5:
        accessories.append("smartphone_glow")
    if exercise >= 35.0:
        accessories.append("smartwatch")
    if gpa >= 8.80:
        accessories.append("graduation_cap")
    if metrics.projected_savings > 50000:
        accessories.append("investment_badge")
    if lifestyle >= 85:
        accessories.append("golden_sparkles")

    # 5. Environment Setting
    if lifestyle < 48 or burnout > 72:
        environment_theme = "cluttered_dark_room"
        badge_title = "Chronic Fatigue Trajectory"
    elif lifestyle >= 78:
        environment_theme = "sunlit_loft"
        badge_title = "Thriving High Performer"
    else:
        environment_theme = "balanced_workspace"
        badge_title = "Steady Progress Track"

    return AvatarVisualState(
        posture=posture,
        expression=expression,
        aura_color=aura_color,
        aura_intensity=aura_intensity,
        energy_level=energy,
        accessories=accessories,
        environment_theme=environment_theme,
        badge_title=badge_title,
    )


# =====================================================================
# 3. Trajectory Time-Series Generator
# =====================================================================

def generate_trajectory_timeline(
    habits: Dict[str, float],
    horizon_months: int,
    monthly_income: float,
    user_features: Optional[np.ndarray] = None,
) -> List[TrajectoryPoint]:
    """
    Generates step-by-step timeline points for interactive charts.
    - 6-month horizon: 6 monthly intervals (Month 1 to Month 6).
    - 5-year horizon: 6 milestone intervals (Month 6 to Year 5).
    """
    points: List[TrajectoryPoint] = []

    if horizon_months <= 6:
        steps = [1, 2, 3, 4, 5, 6]
        labels = [f"Month {m}" for m in steps]
    else:
        steps = [6, 12, 24, 36, 48, 60]
        labels = ["Month 6", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"]

    sleep = habits["sleep_hours"]
    screen = habits["screen_time_hours"]
    activity = habits["physical_activity_minutes"]
    study = habits["study_hours"]
    spend = habits["daily_spending"]

    for idx, (month_step, label) in enumerate(zip(steps, labels)):
        gpa, _, _, _, _ = simulate_academic_performance(sleep, screen, activity, study, month_step, user_features)
        health_idx, _, _, _ = simulate_health_and_vitality(sleep, screen, activity, study, month_step)
        savings, _, _, fin_score = simulate_financial_trajectory(spend, monthly_income, month_step)
        lifestyle = compute_lifestyle_composite(gpa, health_idx, fin_score)

        points.append(
            TrajectoryPoint(
                period_label=label,
                period_index=idx,
                academic_gpa=gpa,
                health_index=health_idx,
                projected_savings=savings,
                lifestyle_score=lifestyle,
            )
        )

    return points


def _build_scenario_details(
    scenario_id: str,
    name: str,
    description: str,
    horizon: str,
    horizon_months: int,
    habits: Dict[str, float],
    monthly_income: float,
    user_features: Optional[np.ndarray],
    avatar_key: str,
) -> ScenarioDetails:
    """Shared helper that computes metrics, avatar state, and timeline for any scenario."""
    study_mode = str(habits.get("study_mode", "regular"))
    mental_mood = str(habits.get("mental_mood", "balanced"))
    gpa, pct, grasp, recall, blankout = simulate_academic_performance(
        habits["sleep_hours"], habits["screen_time_hours"],
        habits["physical_activity_minutes"], habits["study_hours"],
        horizon_months, user_features,
        study_mode=study_mode, mental_mood=mental_mood
    )
    health, fit, ene, burn = simulate_health_and_vitality(
        habits["sleep_hours"], habits["screen_time_hours"],
        habits["physical_activity_minutes"], habits["study_hours"],
        horizon_months
    )
    sav, cashflow, sav_rate, fin_score = simulate_financial_trajectory(
        habits["daily_spending"], monthly_income, horizon_months
    )
    lifestyle = compute_lifestyle_composite(gpa, health, fin_score)

    scores = DimensionScores(
        academic_gpa=gpa,
        academic_percentile=pct,
        mental_grasp_score=grasp,
        exam_recall_rate=recall,
        exam_blankout_risk=blankout,
        health_index=health,
        fitness_score=fit,
        energy_score=ene,
        burnout_risk=burn,
        projected_savings=sav,
        monthly_net_cashflow=cashflow,
        savings_rate_pct=sav_rate,
        financial_health_score=fin_score,
        overall_lifestyle_score=lifestyle,
    )
    avatar = determine_avatar_visual_state(scores, habits, avatar_key)
    traj = generate_trajectory_timeline(habits, horizon_months, monthly_income, user_features)

    return ScenarioDetails(
        id=scenario_id,
        name=name,
        description=description,
        horizon=horizon,
        assumed_habits=habits,
        metrics=scores,
        avatar=avatar,
        trajectory=traj,
    )


# =====================================================================
# 4. Master Predictive Simulator
# =====================================================================

def run_predictive_simulation(
    logs: List[HabitLog],
    horizon: str = "6_months",
    what_if: Optional[WhatIfInputs] = None,
    monthly_income: float = 15000.0,
) -> PredictionResponse:
    """
    Executes the dual-scenario simulation:
    - Scenario A ('Current Path'): extrapolates historical averages.
    - Scenario B ('Improved Path'): simulates the optimized health/study regimen.
    - Custom Scenario: simulates what-if slider inputs if supplied.
    """
    horizon_months = 60 if horizon == "5_years" else 6

    if logs:
        user_features = np.array([
            [
                float(log.sleep_hours or 0.0),
                float(log.screen_time_hours or 0.0),
                float(log.physical_activity_minutes or 0.0),
                float(log.study_hours or 0.0),
            ]
            for log in logs
        ])
        spending_arr = np.array([float(log.total_spending or 0.0) for log in logs])

        baseline_habits = {
            "sleep_hours": round(float(np.mean(user_features[:, 0])), 1),
            "screen_time_hours": round(float(np.mean(user_features[:, 1])), 1),
            "physical_activity_minutes": round(float(np.mean(user_features[:, 2])), 1),
            "study_hours": round(float(np.mean(user_features[:, 3])), 1),
            "daily_spending": round(float(np.mean(spending_arr)), 2),
        }
    else:
        user_features = None
        baseline_habits = {
            "sleep_hours": 6.2,
            "screen_time_hours": 6.5,
            "physical_activity_minutes": 20.0,
            "study_hours": 2.2,
            "daily_spending": 380.0,
        }

    # Scenario A: Current Path
    scenario_a = _build_scenario_details(
        scenario_id="scenario_a_current",
        name="Current Path",
        description="Projects your existing everyday habit averages forward in time.",
        horizon=horizon,
        horizon_months=horizon_months,
        habits=baseline_habits.copy(),
        monthly_income=monthly_income,
        user_features=user_features,
        avatar_key="current",
    )

    # Scenario B: Improved Path (Screen time includes study hours: 4.2h study + 1.3h light leisure = 5.5h total)
    habits_b = {
        "sleep_hours": 7.8,
        "screen_time_hours": 5.5,
        "physical_activity_minutes": 50.0,
        "study_hours": 4.2,
        "daily_spending": round(min(baseline_habits["daily_spending"] * 0.65, 250.0), 2),
        "study_mode": "regular",
        "mental_mood": "sharp",
    }
    scenario_b = _build_scenario_details(
        scenario_id="scenario_b_improved",
        name="Improved Path",
        description="Projects a disciplined, revitalized lifestyle routine (optimal sleep, exercise & budgeting).",
        horizon=horizon,
        horizon_months=horizon_months,
        habits=habits_b,
        monthly_income=monthly_income,
        user_features=user_features,
        avatar_key="improved",
    )

    # Custom Scenario (What-If Sliders, if provided)
    scenario_custom = None
    if what_if is not None:
        habits_c = {
            "sleep_hours": what_if.sleep_hours,
            "screen_time_hours": what_if.screen_time_hours,
            "physical_activity_minutes": what_if.physical_activity_minutes,
            "study_hours": what_if.study_hours,
            "daily_spending": what_if.daily_spending,
            "study_mode": what_if.study_mode or "regular",
            "mental_mood": what_if.mental_mood or "balanced",
        }
        income_c = what_if.monthly_income or monthly_income
        scenario_custom = _build_scenario_details(
            scenario_id="scenario_custom",
            name="What-If Custom Simulator",
            description="Real-time interactive projection based on your custom slider adjustments.",
            horizon=horizon,
            horizon_months=horizon_months,
            habits=habits_c,
            monthly_income=income_c,
            user_features=user_features,
            avatar_key="custom",
        )

    scores_a = scenario_a.metrics
    scores_b = scenario_b.metrics
    delta_summary = {
        "gpa_gain": round(scores_b.academic_gpa - scores_a.academic_gpa, 2),
        "health_gain": round(scores_b.health_index - scores_a.health_index, 1),
        "energy_gain": round(scores_b.energy_score - scores_a.energy_score, 1),
        "burnout_reduction": round(scores_a.burnout_risk - scores_b.burnout_risk, 1),
        "savings_differential": round(scores_b.projected_savings - scores_a.projected_savings, 2),
        "lifestyle_gain": round(scores_b.overall_lifestyle_score - scores_a.overall_lifestyle_score, 1),
        "grasp_gain": round(scores_b.mental_grasp_score - scores_a.mental_grasp_score, 1),
        "recall_gain": round(scores_b.exam_recall_rate - scores_a.exam_recall_rate, 1),
        "blankout_reduction": round(scores_a.exam_blankout_risk - scores_b.exam_blankout_risk, 1),
    }

    return PredictionResponse(
        horizon=horizon,
        baseline_habits=baseline_habits,
        scenario_a_current=scenario_a,
        scenario_b_improved=scenario_b,
        scenario_custom=scenario_custom,
        delta_summary=delta_summary,
    )
