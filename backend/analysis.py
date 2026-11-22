"""
HabitTwin Behavioral Analytics Engine
Computes streaks, statistical distributions, consistency scores,
and Pearson correlation coefficients between tracked lifestyle habits using NumPy.
"""

from typing import List, Dict, Optional
import numpy as np
from datetime import datetime, timedelta

from .models import HabitLog
from .schemas import (
    BehavioralSummary,
    StreakMetrics,
    CorrelationPair,
    BehavioralAnalysisResponse,
)


def calculate_streaks(
    logs: List[HabitLog],
    freeze_dates: Optional[List[str]] = None,
    freezes_available: int = 2,
) -> StreakMetrics:
    """
    Computes active behavioral streaks working backwards from the latest log date.
    A streak counts consecutive days meeting specific health/productivity thresholds.
    Supports Streak Freezes: frozen days bridge gaps without breaking consecutive momentum.
    """
    if not logs:
        return StreakMetrics(
            logging_streak_days=0,
            optimal_sleep_streak_days=0,
            active_exercise_streak_days=0,
            study_consistency_streak_days=0,
            freezes_available=freezes_available,
            freezes_used=freeze_dates or [],
            is_streak_broken=False,
            broken_date=None,
            is_protected_today=False,
        )

    frozen_set = set()
    if freeze_dates:
        for fd in freeze_dates:
            try:
                frozen_set.add(datetime.strptime(fd, "%Y-%m-%d").date())
            except Exception:
                pass

    sorted_logs = sorted(logs, key=lambda x: x.date)
    log_map = {datetime.strptime(log.date, "%Y-%m-%d").date(): log for log in sorted_logs}
    all_dates = set(log_map.keys()) | frozen_set
    latest_date = max(all_dates) if all_dates else max(log_map.keys())

    today = datetime.utcnow().date()
    yesterday = today - timedelta(days=1)

    # Streak broken check: if latest recorded activity is older than yesterday
    is_streak_broken = False
    broken_date = None
    if latest_date < yesterday:
        is_streak_broken = True
        broken_date = yesterday.isoformat()

    is_protected_today = (yesterday in frozen_set) or (today in frozen_set)

    def get_consecutive_streak(predicate) -> int:
        streak = 0
        current_day = latest_date
        while True:
            if current_day in log_map:
                if predicate(log_map[current_day]):
                    streak += 1
                    current_day -= timedelta(days=1)
                else:
                    break
            elif current_day in frozen_set:
                # Protected freeze day bridges the streak unbroken
                streak += 1
                current_day -= timedelta(days=1)
            else:
                break
        return streak

    return StreakMetrics(
        logging_streak_days=get_consecutive_streak(lambda _: True),
        optimal_sleep_streak_days=get_consecutive_streak(
            lambda log: 7.0 <= (log.sleep_hours or 0.0) <= 9.0
        ),
        active_exercise_streak_days=get_consecutive_streak(
            lambda log: (log.physical_activity_minutes or 0.0) >= 30.0
        ),
        study_consistency_streak_days=get_consecutive_streak(
            lambda log: (log.study_hours or 0.0) >= 2.5
        ),
        freezes_available=freezes_available,
        freezes_used=freeze_dates or [],
        is_streak_broken=is_streak_broken,
        broken_date=broken_date,
        is_protected_today=is_protected_today,
    )


def compute_consistency_score(series: Dict[str, np.ndarray]) -> float:
    """
    Calculates a Consistency Score (0 - 100) based on the Coefficient of Variation (CV).
    CV = sample_standard_deviation / mean.
    Low CV indicates predictable routines; high CV indicates erratic swings.
    """
    n = len(series.get("sleep_hours", []))
    if n < 3:
        return 50.0

    cv_scores = []
    monitored_cols = [
        "sleep_hours",
        "screen_time_hours",
        "physical_activity_minutes",
        "study_hours",
    ]

    for col in monitored_cols:
        arr = series[col]
        mean_val = float(np.mean(arr))
        std_val = float(np.std(arr, ddof=1))
        if mean_val > 0.001:
            cv_scores.append(std_val / mean_val)

    if not cv_scores:
        return 60.0

    avg_cv = float(np.mean(cv_scores))
    normalized_score = 100.0 * (1.0 - float(np.clip(avg_cv / 1.2, 0.0, 0.85)))
    return round(float(np.clip(normalized_score, 10.0, 99.0)), 1)


def compute_pearson_correlations(series: Dict[str, np.ndarray]) -> List[CorrelationPair]:
    """
    Computes Pearson Correlation Matrix between key lifestyle variables:
    r = Cov(X, Y) / (sigma_X * sigma_Y)
    """
    pairs_to_evaluate = [
        ("sleep_hours", "study_hours", "Sleep vs Study"),
        ("screen_time_hours", "physical_activity_minutes", "Screen Time vs Physical Activity"),
        ("sleep_hours", "screen_time_hours", "Sleep vs Screen Time"),
        ("screen_time_hours", "total_spending", "Screen Time vs Spending"),
        ("physical_activity_minutes", "study_hours", "Exercise vs Study Focus"),
        ("sleep_hours", "total_spending", "Sleep vs Impulse Spending"),
    ]

    results: List[CorrelationPair] = []
    n = len(series.get("sleep_hours", []))

    if n < 3:
        for feat_x, feat_y, label in pairs_to_evaluate:
            results.append(
                CorrelationPair(
                    pair_name=label,
                    feature_x=feat_x,
                    feature_y=feat_y,
                    coefficient=0.0,
                    strength="insufficient_data",
                    interpretation="Need at least 3 days of logs to compute empirical correlation.",
                )
            )
        return results

    for feat_x, feat_y, label in pairs_to_evaluate:
        if feat_x not in series or feat_y not in series:
            continue

        x = series[feat_x]
        y = series[feat_y]
        std_x = float(np.std(x, ddof=1))
        std_y = float(np.std(y, ddof=1))

        if std_x < 1e-6 or std_y < 1e-6:
            r = 0.0
        else:
            r = float(np.corrcoef(x, y)[0, 1])
            if np.isnan(r):
                r = 0.0

        r_rounded = round(r, 2)

        if r >= 0.5:
            strength = "strong_positive"
        elif r >= 0.2:
            strength = "moderate_positive"
        elif r <= -0.5:
            strength = "strong_negative"
        elif r <= -0.2:
            strength = "moderate_negative"
        else:
            strength = "neutral"

        interpretation = generate_correlation_insight(feat_x, feat_y, r_rounded)

        results.append(
            CorrelationPair(
                pair_name=label,
                feature_x=feat_x,
                feature_y=feat_y,
                coefficient=r_rounded,
                strength=strength,
                interpretation=interpretation,
            )
        )

    return results


def generate_correlation_insight(feat_x: str, feat_y: str, r: float) -> str:
    """Provides plain-language behavioral interpretation of correlation values."""
    if abs(r) < 0.2:
        return f"Little to no linear dependency observed (r={r}). Habits appear relatively decoupled."

    if feat_x == "sleep_hours" and feat_y == "study_hours":
        if r > 0:
            return f"Positive link (r={r}): Well-rested days correspond with more productive, sustained study sessions."
        else:
            return f"Negative link (r={r}): You may be sacrificing sleep to cram for study, or feeling too sluggish to study."

    if feat_x == "screen_time_hours" and feat_y == "physical_activity_minutes":
        if r < 0:
            return f"Displacement effect (r={r}): Extended recreational screen time directly eats into exercise and workout time."
        else:
            return f"Co-occurring (r={r}): Screen time and workouts are co-occurring (e.g. streaming videos on treadmill)."

    if feat_x == "sleep_hours" and feat_y == "screen_time_hours":
        if r < 0:
            return f"Late-night doomscrolling link (r={r}): High screen time late at night cuts into your sleep window."
        else:
            return f"Slight positive correlation (r={r}): Sedentary recovery days feature both high sleep and media consumption."

    if feat_x == "screen_time_hours" and feat_y == "total_spending":
        if r > 0:
            return f"Impulse buy connection (r={r}): Higher screen time correlates with increased online shopping and food delivery."
        else:
            return f"Mild negative correlation (r={r}): Low spending during screen-heavy indoor days."

    if feat_x == "physical_activity_minutes" and feat_y == "study_hours":
        if r > 0:
            return f"Neurogenic boost (r={r}): Physical activity sharpens cognitive endurance and improves study focus."
        else:
            return f"Time competition (r={r}): Heavy workout sessions might be taking up available study windows."

    return f"Observed correlation r = {r} between {feat_x} and {feat_y}."


def generate_dynamic_insights(series: Dict[str, np.ndarray], streaks: StreakMetrics) -> List[str]:
    """Generates 3-5 personalized behavioral bullet points based on the data."""
    insights: List[str] = []
    n = len(series.get("sleep_hours", []))

    if n == 0:
        return [
            "Log your daily habits or click 'Load Demo Data' to activate deep behavioral analytics.",
            "Tracking consistently for just 7 days unlocks statistical pattern detection.",
        ]

    avg_sleep = float(np.mean(series["sleep_hours"]))
    avg_screen = float(np.mean(series["screen_time_hours"]))
    avg_exercise = float(np.mean(series["physical_activity_minutes"]))
    avg_study = float(np.mean(series["study_hours"]))
    avg_spend = float(np.mean(series["total_spending"]))

    if avg_sleep < 6.5:
        insights.append(
            f"Chronic sleep debt detected (avg {avg_sleep:.1f} hrs/night). "
            "Sleeping under 7 hours reduces cognitive recall by up to 25%."
        )
    elif 7.0 <= avg_sleep <= 8.5:
        insights.append(
            f"Optimal sleep baseline ({avg_sleep:.1f} hrs/night). "
            "Your circadian rhythm provides strong cognitive stamina."
        )
    else:
        insights.append(
            f"Sleep duration averages {avg_sleep:.1f} hrs/night. "
            "Aim for a consistent bedtime to stabilize circadian memory consolidation."
        )

    if avg_screen > 5.0 and avg_exercise < 30.0:
        insights.append(
            f"High sedentary screen time ({avg_screen:.1f} hrs) paired with low exercise "
            f"({avg_exercise:.0f} mins) is your primary driver of afternoon energy dips."
        )
    elif avg_exercise >= 40.0:
        insights.append(
            f"Strong physical activity ({avg_exercise:.0f} mins/day). "
            "Regular aerobic exercise actively elevates BDNF (brain-derived neurotrophic factor)."
        )

    if streaks.study_consistency_streak_days >= 3:
        insights.append(
            f"Outstanding momentum: {streaks.study_consistency_streak_days}-day study streak! "
            "Spaced repetition beats irregular weekend marathon cramming."
        )
    elif avg_study < 2.0:
        insights.append(
            f"Study hours average {avg_study:.1f} hrs/day. "
            "Adding one 45-minute Pomodoro block could boost semester CGPA significantly."
        )

    if avg_spend > 400.0:
        insights.append(
            f"Discretionary spending averages ₹{avg_spend:.0f}/day (₹{avg_spend * 30.4:.0f}/month). "
            "Reducing impulse food & entertainment could redirect over ₹3,500/mo into emergency savings."
        )

    return insights


def analyze_behaviors(logs: List[HabitLog]) -> BehavioralAnalysisResponse:
    """
    Main behavioral analysis pipeline:
    1. Converts logs into NumPy arrays
    2. Computes descriptive statistics and streaks
    3. Calculates consistency index (CV)
    4. Computes Pearson correlations
    5. Returns unified analytical model
    """
    if not logs:
        return BehavioralAnalysisResponse(
            summary=BehavioralSummary(
                total_days_logged=0,
                avg_sleep_hours=0.0,
                avg_screen_time_hours=0.0,
                avg_physical_activity_minutes=0.0,
                avg_study_hours=0.0,
                avg_daily_spending=0.0,
                spending_breakdown={
                    "food": 0.0, "entertainment": 0.0, "study": 0.0,
                    "shopping": 0.0, "misc": 0.0,
                },
                consistency_score=50.0,
            ),
            streaks=StreakMetrics(
                logging_streak_days=0,
                optimal_sleep_streak_days=0,
                active_exercise_streak_days=0,
                study_consistency_streak_days=0,
            ),
            correlations=compute_pearson_correlations({}),
            insights=["No logs recorded yet. Add your first day or click 'Load Demo Data'."],
        )

    series = {
        "sleep_hours": np.array([float(log.sleep_hours or 0.0) for log in logs]),
        "screen_time_hours": np.array([float(log.screen_time_hours or 0.0) for log in logs]),
        "physical_activity_minutes": np.array([float(log.physical_activity_minutes or 0.0) for log in logs]),
        "study_hours": np.array([float(log.study_hours or 0.0) for log in logs]),
        "spending_food": np.array([float(log.spending_food or 0.0) for log in logs]),
        "spending_entertainment": np.array([float(log.spending_entertainment or 0.0) for log in logs]),
        "spending_study": np.array([float(log.spending_study or 0.0) for log in logs]),
        "spending_shopping": np.array([float(log.spending_shopping or 0.0) for log in logs]),
        "spending_misc": np.array([float(log.spending_misc or 0.0) for log in logs]),
        "total_spending": np.array([float(log.total_spending or 0.0) for log in logs]),
    }

    total_days = len(logs)
    avg_sleep = round(float(np.mean(series["sleep_hours"])), 1)
    avg_screen = round(float(np.mean(series["screen_time_hours"])), 1)
    avg_activity = round(float(np.mean(series["physical_activity_minutes"])), 1)
    avg_study = round(float(np.mean(series["study_hours"])), 1)
    avg_spending = round(float(np.mean(series["total_spending"])), 2)

    spending_breakdown = {
        "food": round(float(np.mean(series["spending_food"])), 2),
        "entertainment": round(float(np.mean(series["spending_entertainment"])), 2),
        "study": round(float(np.mean(series["spending_study"])), 2),
        "shopping": round(float(np.mean(series["spending_shopping"])), 2),
        "misc": round(float(np.mean(series["spending_misc"])), 2),
    }

    streaks = calculate_streaks(logs)
    consistency_score = compute_consistency_score(series)
    correlations = compute_pearson_correlations(series)
    insights = generate_dynamic_insights(series, streaks)

    summary = BehavioralSummary(
        total_days_logged=total_days,
        avg_sleep_hours=avg_sleep,
        avg_screen_time_hours=avg_screen,
        avg_physical_activity_minutes=avg_activity,
        avg_study_hours=avg_study,
        avg_daily_spending=avg_spending,
        spending_breakdown=spending_breakdown,
        consistency_score=consistency_score,
    )

    return BehavioralAnalysisResponse(
        summary=summary,
        streaks=streaks,
        correlations=correlations,
        insights=insights,
    )
