"""
HabitTwin LLM Future-Self Narrative Service
Integrates with Anthropic Claude API and Google Gemini API to generate emotionally resonant,
first-person letters from the user's future self.
Includes a deeply personalized local narrative engine that dynamically constructs
unique prose based on the user's actual logged habits, baseline vs target deltas,
consistency streaks, and life focus area.
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("habittwin.llm")

# Claude & Gemini Prompt Template with deep habit contrast instructions
FUTURE_SELF_PROMPT_TEMPLATE = """You are the digital future self of {user_name}, writing a personal first-person letter back in time from {horizon_text} into the future.

TIME HORIZON CONTEXT & STRUCTURAL REQUIREMENTS:
{horizon_instructions}

USER'S REAL BASELINE HABITS (What they actually do today based on their logs):
- Sleep: {baseline_sleep:.1f} hours/day
- Screen Time: {baseline_screen:.1f} hours/day
- Physical Activity: {baseline_exercise:.0f} minutes/day
- Focused Study: {baseline_study:.1f} hours/day
- Daily Spending: ₹{baseline_spend:.2f}/day
- Consistency Streak: {streak_days} days logged
- Primary Life Focus: {user_focus}
{notes_line}

PROJECTED ROUTINE & OUTCOMES FOR THIS LETTER ({scenario_name}):
- Projected Sleep: {sleep_hours:.1f} hours/day
- Projected Screen Time: {screen_time_hours:.1f} hours/day
- Projected Activity: {activity_min:.0f} minutes/day
- Projected Study: {study_hours:.1f} hours/day
- Projected Spending: ₹{daily_spending:.2f}/day
- Academic CGPA: {projected_gpa:.2f} / 10.0 scale
- Health & Vitality Index: {health_index:.0f}/100 (Energy: {energy_score:.0f}/100)
- Burnout Risk: {burnout_risk:.0f}/100
- Projected Savings: ₹{projected_savings:,.2f}

CHOSEN TONE: {tone}
Tone Nuances:
- motivational: High-energy, inspiring, celebrating resilience, vivid sensory victory.
- honest: Candid reality check, tough-love, direct cause-and-effect without sugarcoating.
- gentle: Warm, compassionate, validating struggles, encouraging tiny micro-steps.

CRITICAL INSTRUCTIONS FOR PERSONALISATION:
1. You MUST contrast their real baseline habits ({baseline_sleep:.1f}h sleep, {baseline_screen:.1f}h screen, {baseline_study:.1f}h study, ₹{baseline_spend:.0f} spend) against where they end up.
2. Directly reference their {streak_days}-day streak and their primary focus on '{user_focus}'.
3. Write in the first person ("I am you, writing from {horizon_text} ahead...").
4. End with 3 highly concrete, personalized micro-action suggestions.

FORMAT SPECIFICATION:
Return valid JSON with this exact schema:
{{
  "title": "A captivating, evocative title for the letter",
  "theme_badge": "{theme_badge}",
  "key_quote": "A single punchy, unforgettable sentence summing up the letter's core wisdom",
  "letter_content": "The full multi-paragraph letter text...",
  "suggestions": [
    "1. ...",
    "2. ...",
    "3. ..."
  ]
}}
Do NOT output markdown backticks; output valid raw JSON only.
"""


def _diagnose_habit_profile(
    current: Dict[str, float],
    target: Dict[str, float]
) -> Dict[str, str]:
    """Diagnoses primary superpower, friction points, and focus narrative."""
    c_sleep = current.get("sleep_hours", 7.0)
    c_screen = current.get("screen_time_hours", 4.5)
    c_exercise = current.get("physical_activity_minutes", 30.0)
    c_study = current.get("study_hours", 3.5)
    c_spend = current.get("daily_spending", current.get("total_spending", 120.0))

    # Superpower: what is the user's best current habit?
    superpowers = []
    if c_sleep >= 7.5:
        superpowers.append(f"restorative sleep foundation ({c_sleep:.1f}h/night)")
    if c_study >= 4.0:
        superpowers.append(f"deep study endurance ({c_study:.1f}h/day)")
    if c_exercise >= 40:
        superpowers.append(f"consistent physical workouts ({c_exercise:.0f}m/day)")
    if c_spend <= 100:
        superpowers.append(f"conscious student budgeting (₹{c_spend:.0f}/day)")
    if c_screen <= 3.5:
        superpowers.append(f"disciplined screen management ({c_screen:.1f}h/day)")

    superpower = superpowers[0] if superpowers else "commitment to tracking daily routines"

    # Vulnerability: what is the user's primary leak?
    vulnerabilities = []
    if c_screen >= 5.5:
        vulnerabilities.append(f"late-night screen doomscrolling ({c_screen:.1f}h/day)")
    if c_sleep < 6.5:
        vulnerabilities.append(f"chronic sleep debt ({c_sleep:.1f}h/night)")
    if c_study < 2.5:
        vulnerabilities.append(f"irregular study blocks ({c_study:.1f}h/day)")
    if c_spend >= 250:
        vulnerabilities.append(f"unmonitored daily spending leaks (₹{c_spend:.0f}/day)")
    if c_exercise < 15:
        vulnerabilities.append("sedentary physical routine (<15m movement)")

    vulnerability = vulnerabilities[0] if vulnerabilities else "mid-semester habit friction"

    return {"superpower": superpower, "vulnerability": vulnerability}


def generate_local_fallback_letter(
    user_name: str,
    scenario: str,
    horizon: str,
    tone: str,
    habits: Dict[str, float],
    metrics: Dict[str, Any],
    baseline_habits: Optional[Dict[str, float]] = None,
    user_focus: Optional[str] = "balanced",
    streak_days: Optional[int] = 0,
    latest_notes: Optional[str] = "",
) -> Dict[str, Any]:
    """
    Expert rule-based narrative engine that dynamically constructs
    deeply personalized letters tailored to the user's exact baseline numbers,
    target projections, streak, and chosen life focus.
    """
    name = user_name.strip() or "Explorer"
    is_five_years = horizon == "5_years"
    is_improved = scenario == "improved" or metrics.get("overall_lifestyle_score", 70) >= 75

    # Target/Projected habits
    sleep = habits.get("sleep_hours", 7.5)
    screen = habits.get("screen_time_hours", 4.0)
    exercise = habits.get("physical_activity_minutes", 35.0)
    study = habits.get("study_hours", 4.0)
    spend = habits.get("daily_spending", habits.get("total_spending", 120.0))

    # Baseline/Actual habits
    b = baseline_habits or {
        "sleep_hours": 6.2,
        "screen_time_hours": 6.5,
        "physical_activity_minutes": 20.0,
        "study_hours": 2.2,
        "daily_spending": 380.0,
    }
    b_sleep = b.get("sleep_hours", 6.2)
    b_screen = b.get("screen_time_hours", 6.5)
    b_exercise = b.get("physical_activity_minutes", 20.0)
    b_study = b.get("study_hours", 2.2)
    b_spend = b.get("daily_spending", b.get("total_spending", 380.0))

    gpa = metrics.get("academic_gpa", 7.80)
    health = metrics.get("health_index", 70.0)
    energy = metrics.get("energy_score", 65.0)
    burnout = metrics.get("burnout_risk", 35.0)
    savings = metrics.get("projected_savings", 2500.0)
    recall = metrics.get("exam_recall_rate", 78.0)
    blankout = metrics.get("exam_blankout_risk", 14.0)

    streak = int(streak_days or 0)
    focus = user_focus or "balanced"
    profile = _diagnose_habit_profile(b, habits)

    # Contextual streak phrase
    if streak >= 15:
        streak_phrase = f"your relentless {streak}-day tracking streak proved that you are someone who keeps promises to yourself"
    elif streak >= 5:
        streak_phrase = f"hitting a {streak}-day consistency streak broke the friction that used to derail your weeks"
    elif streak > 0:
        streak_phrase = f"starting your tracking journey with {streak} logged days was the spark that ignited this shift"
    else:
        streak_phrase = "deciding to stop running on autopilot and confront your daily numbers changed our trajectory"

    notes_callout = (
        f"\n\nI was looking back at that honest journal note you logged: \"{latest_notes}\". "
        f"You were running on fumes that day, but acknowledging that friction was the exact catalyst that turned things around."
        if latest_notes else ""
    )

    # =========================================================================
    # HORIZON A: 6-MONTH SEMESTER DISPATCH
    # Visceral, immediate, grounded in campus life, lectures, midterms & finals
    # =========================================================================
    if not is_five_years:
        theme_badge = "📅 Semester Field Dispatch // +180 Days Out"

        if focus == "academics":
            focus_6m_imp = (
                f"Because you prioritized academic mastery—expanding study from {b_study:.1f}h to {study:.1f}h daily—"
                f"our CGPA soared to a commanding {gpa:.2f}/10.0. In seminars and lab presentations, professors took notice. "
                f"While classmates crammed in panic before finals, our exam recall held at an effortless {recall:.0f}% with blank-out risk at just {blankout:.0f}%."
            )
            focus_6m_cur = (
                f"Right now, averaging only {b_study:.1f} hours of study while losing {b_screen:.1f} hours to your phone leaves us "
                f"skating on thin ice with a {gpa:.2f} CGPA. Our exam blank-out risk is spiked at {blankout:.0f}%, and last-minute cramming will not save our semester grades."
            )
        elif focus == "health":
            focus_6m_imp = (
                f"Prioritizing your biology—expanding sleep from {b_sleep:.1f}h to {sleep:.1f}h and committing {exercise:.0f}m to daily movement—"
                f"healed our nervous system. Our health index reached {health:.0f}/100 and energy held rock-solid at {energy:.0f}/100. "
                f"The 3 PM lecture brain fog and midnight caffeine tremors you accepted as normal completely vanished."
            )
            focus_6m_cur = (
                f"Running our body on only {b_sleep:.1f} hours of sleep while screen exposure tops {b_screen:.1f} hours is running our engine dry. "
                f"Our burnout risk is spiked at {burnout:.0f}%, and you can already feel that constant morning exhaustion making 8:30 AM lectures torture."
            )
        elif focus == "wealth":
            focus_6m_imp = (
                f"Taking control of your student wallet—slashing daily spending from ₹{b_spend:.0f} down to ₹{spend:.0f}—worked miracles. "
                f"We built an end-of-semester emergency reserve of ₹{savings:,.0f}. Having that financial cushion while our peers were stressed "
                f"about canteen bills, project materials, and weekend outings gave us unprecedented peace of mind."
            )
            focus_6m_cur = (
                f"Letting ₹{b_spend:.0f}/day slip away into food delivery fees, midnight snacks, and impulse shopping is bleeding our student wallet dry. "
                f"At this rate, we enter the next term with barely ₹{savings:,.0f} in savings, one unexpected book or lab fee away from panic."
            )
        else:  # balanced
            focus_6m_imp = (
                f"You brought complete balance to our campus life: harmonizing {study:.1f}h of study with {sleep:.1f}h of deep sleep and ₹{spend:.0f}/day budgeting. "
                f"Our CGPA reached {gpa:.2f}/10.0, our vitality hit {health:.0f}/100, and our savings grew to ₹{savings:,.0f}."
            )
            focus_6m_cur = (
                f"Your current daily averages—{b_sleep:.1f}h sleep, {b_screen:.1f}h screen, and ₹{b_spend:.0f}/day spending—are pulling our semester in opposite directions. "
                f"Projected CGPA sits at {gpa:.2f} while burnout hovers at a dangerous {burnout:.0f}%."
            )

        scorecard_6m = (
            f"┌────────────────────────────────────────────────────────┐\n"
            f"│ 📊 SEMESTER SCORECARD & COGNITIVE VITALS (+180 DAYS)   │\n"
            f"├────────────────────────────────────────────────────────┤\n"
            f"│ • Expected Semester CGPA : {gpa:.2f} / 10.0\n"
            f"│ • Exam Memory Recall     : {recall:.0f}% (Recall under pressure)\n"
            f"│ • Exam Blank-Out Risk    : {blankout:.0f}% ({'Critical Risk' if blankout >= 25 else 'Controlled'})\n"
            f"│ • Daily Energy Level     : {energy:.0f} / 100 ({'Sharp' if energy >= 70 else 'Fatigued'})\n"
            f"│ • Semester Burnout Risk  : {burnout:.0f}% ({'High Warning' if burnout >= 45 else 'Protected'})\n"
            f"│ • Semester Cash Reserve  : ₹{savings:,.0f}\n"
            f"└────────────────────────────────────────────────────────┘"
        )

        if is_improved:
            header_6m = (
                f"[ CAMPUS FIELD DISPATCH // SEMESTER FINALS REPORT ]\n"
                f"TIMELINE  : +180 Days Out (Finals Week Complete)\n"
                f"LOCATION  : Central Campus Library • 2nd Floor Focus Pod\n"
                f"RECIPIENT : Present-Day {name} (Beginning of Semester)\n"
                f"STATUS    : Trajectory Overhaul Verified"
            )

            if tone == "motivational":
                title = f"Dispatch From Finals Week: How Your 180-Day Pivot Saved Our Semester"
                key_quote = f"You took our daily routine from {b_sleep:.1f}h sleep and {b_screen:.1f}h screens to a commanding {gpa:.2f} CGPA."
                salutation = f"Dear Present-Day {name},"
                opening = (
                    f"I am writing this from the campus library right as our final semester exams wrap up, exactly 180 days ahead. "
                    f"I pulled out my journal because I needed to say thank you. Six months ago, when you logged that routine averaging "
                    f"{b_sleep:.1f} hours of sleep, {b_screen:.1f} hours of screen time, and ₹{b_spend:.0f} in daily spending, you were "
                    f"exhausted and wondering if small habit adjustments would really make a difference. Well, {streak_phrase}."
                )
                body = (
                    f"Look at the contrast: by shifting sleep to {sleep:.1f} hours and curbing screen time to {screen:.1f} hours, "
                    f"our cognitive edge returned. While others around us were chugging third energy drinks at 3 AM in exam week, "
                    f"we walked in rested and alert. {focus_6m_imp}\n\n"
                    f"Our biggest past vulnerability—{profile['vulnerability']}—is no longer running our life. You built a working system "
                    f"that proved small daily habits compound into our dream semester.{notes_callout}\n\n"
                    f"{scorecard_6m}"
                )
                closing = (
                    f"Keep walking this line through the upcoming weeks. What felt like difficult discipline back then is the exact "
                    f"reason I am smiling at the semester finish line today.\n\n"
                    f"— Your Future Self, celebrating your consistency"
                )
            elif tone == "honest":
                title = f"The 6-Month Reality Check: How Cutting The Excuses Paid Off"
                key_quote = f"You stopped tolerating {b_screen:.1f}h screen time and ₹{b_spend:.0f} spending, and the math did the rest."
                salutation = f"{name}, let's look at the numbers:"
                opening = (
                    f"I am writing this 180 days out, right after grades were posted. Let's be completely candid: six months ago, "
                    f"averaging {b_sleep:.1f} hours of fragmented sleep and losing {b_screen:.1f} hours every day to your phone was "
                    f"keeping our energy at a crawl. But {streak_phrase}."
                )
                body = (
                    f"You locked in {study:.1f} hours of study and capped daily expenses at ₹{spend:.0f}. {focus_6m_imp}\n\n"
                    f"Burnout dropped to {burnout:.0f}/100 because you stopped treating sleep as negotiable. "
                    f"Having ₹{savings:,.0f} in our student emergency reserve right now gave us breathing room that money can't directly buy.{notes_callout}\n\n"
                    f"{scorecard_6m}"
                )
                closing = (
                    f"Do not let complacency creep back in. Momentum is earned daily. Keep executing.\n\n"
                    f"— You, exactly 6 months stronger"
                )
            else:  # gentle
                title = f"A Gentle Letter From Next Semester: The Boundaries Are Working"
                key_quote = f"Gentle kindness took you from {b_sleep:.1f}h exhaustion to a flourishing {health:.0f}/100 vitality."
                salutation = f"Dearest {name},"
                opening = (
                    f"Take a slow breath and relax your shoulders. I know how heavy the semester feels right now with your current "
                    f"{b_sleep:.1f} hours of rest and constant screen stimulation. I am writing from 6 months ahead to reassure you: "
                    f"the gentle boundaries you are beginning to set are working."
                )
                body = (
                    f"By granting yourself {sleep:.1f} hours of sleep and allowing {exercise:.0f} minutes of joyful movement, "
                    f"our health index has blossomed to {health:.0f}/100. {focus_6m_imp}\n\n"
                    f"You treated yourself with patience rather than punishment, quietly saving ₹{savings:,.0f}. {streak_phrase}.{notes_callout}\n\n"
                    f"{scorecard_6m}"
                )
                closing = (
                    f"Trust this process. You are doing so much better than you give yourself credit for.\n\n"
                    f"— With warm love, your 6-month future self"
                )

            suggestions = [
                f"1. Sleep Shield: Shift bedtime 45 minutes earlier to move from your baseline of {b_sleep:.1f}h toward your target of {sleep:.1f}h.",
                f"2. Focus Sprint: Complete a daily {study:.1f}h deep study block to secure your {gpa:.2f} CGPA trajectory.",
                f"3. Daily Budget Rule: Keep daily out-of-pocket spending under ₹{spend:.0f} to protect your ₹{savings:,.0f} semester cushion.",
            ]

        else:
            # Current Path Warning (6 Months)
            header_6m = (
                f"[ URGENT SEMESTER ALERT // FINALS CRITICAL WARNING ]\n"
                f"TIMELINE  : +180 Days Out (Semester Finals Crisis)\n"
                f"LOCATION  : Campus Hostel Room • 3:30 AM\n"
                f"RECIPIENT : Present-Day {name} (Beginning of Semester)\n"
                f"STATUS    : High Burnout & Academic Slippage Detected"
            )
            title = f"Semester Alert: The High Cost of Staying on Autopilot"
            key_quote = f"Continuing at {b_sleep:.1f}h sleep and {b_screen:.1f}h screen time leads directly to a {gpa:.2f} CGPA and {burnout:.0f}% burnout."
            salutation = f"{name}, listen closely:"
            opening = (
                f"I am writing from 6 months in the future, and I need to deliver an urgent wake-up call. "
                f"Right now, your logs show you averaging {b_sleep:.1f} hours of sleep, {b_screen:.1f} hours glued to screens, "
                f"and spending ₹{b_spend:.0f} each day. If you stay on this exact trajectory for the next 180 days, you will walk "
                f"straight into a mid-semester wall."
            )
            body = (
                f"{focus_6m_cur}\n\n"
                f"Our projected CGPA slips toward {gpa:.2f}/10.0, and our burnout risk hits an alarming {burnout:.0f}/100. "
                f"Walking into exams on {b_sleep:.1f}h sleep impairs memory retrieval under pressure. "
                f"Your biggest vulnerability—{profile['vulnerability']}—is costing us our academic momentum and financial peace of mind.{notes_callout}\n\n"
                f"{scorecard_6m}"
            )
            closing = (
                f"You have the power to pivot today. Close the screen tonight, reclaim your sleep, and take back control of your degree.\n\n"
                f"— Your Future Self, urging you to change today"
            )

            suggestions = [
                f"1. Cut Screen Exposure: Shave 1 hour off your {b_screen:.1f}h daily screen time to protect your cognitive energy.",
                f"2. Protect 7+ Hours Sleep: Replace late-night scrolling with rest to lower burnout from {burnout:.0f}%.",
                f"3. Canteen Spending Cap: Cap daily spending at ₹{b_spend * 0.7:.0f} to avoid end-of-semester debt panic.",
            ]

        content = f"{header_6m}\n\n{salutation}\n\n{opening}\n\n{body}\n\n{closing}"

    # =========================================================================
    # HORIZON B: 5-YEAR TIME CAPSULE (2031)
    # Panoramic, strategic adulthood manifesto, career moat & compound interest
    # =========================================================================
    else:
        theme_badge = "⏳ Sealed Time Capsule Manifesto // Dispatched From 2031"
        compound_study_hours = int(study * 365 * 5)
        compound_savings_5y = int(savings * 8)

        if focus == "academics":
            focus_5y_imp = (
                f"Over these five years, pushing daily study from {b_study:.1f}h to {study:.1f}h compounded into over {compound_study_hours:,} hours "
                f"of deep intellectual mastery. That wasn't just about college grades—it built an irreplaceable technical and strategic moat. "
                f"In our mid-twenties, while peers struggled with rapid career shifts and AI disruption, you possessed rare, high-leverage expertise."
            )
            focus_5y_cur = (
                f"Losing {b_screen:.1f} hours daily to shallow phone consumption while studying only {b_study:.1f} hours locked us into a dangerous trap. "
                f"Five years later, we accumulated only a fraction of the deep skill hours needed for top-tier leadership. We are stuck at entry level."
            )
        elif focus == "health":
            focus_5y_imp = (
                f"Protecting {sleep:.1f} hours of sleep and regular physical movement ({exercise:.0f}m/day) built the biological foundation of our entire adult life. "
                f"Our health index stands at {health:.0f}/100. While colleagues in their mid-twenties complain of chronic back pain, metabolic fatigue, and "
                f"weekend exhaustion, you gave me the stamina and vibrant energy of a high-performing athlete."
            )
            focus_5y_cur = (
                f"Living on {b_sleep:.1f} hours of broken sleep and sedentary habits followed us straight from college into adult life. "
                f"By 2031, chronic twenties burnout ({burnout:.0f}%) and morning brain fog have become our permanent normal, sapping our ambition."
            )
        elif focus == "wealth":
            focus_5y_imp = (
                f"Controlling college spending and capping daily expenses at ₹{spend:.0f} triggered the miracle of compound interest. "
                f"We accumulated a financial runway of ₹{compound_savings_5y:,.0f}. Having that investment cushion gave us true autonomy—"
                f"we never had to endure toxic workplaces or accept exploitative offers out of desperation. You bought our freedom."
            )
            focus_5y_cur = (
                f"Letting ₹{b_spend:.0f}/day leak into peer spending and impulse purchases in college established a dangerous cycle of lifestyle inflation. "
                f"After 1,825 days, we have virtually no investment assets, living paycheck to paycheck and constantly dreading rent day."
            )
        else:  # balanced
            focus_5y_imp = (
                f"You designed a sustainable life architecture: balancing {study:.1f}h of focused craft with {sleep:.1f}h of rest and financial discipline. "
                f"In 2031, we have built a ~{compound_study_hours:,} hour skill moat, ₹{compound_savings_5y:,.0f} in autonomous wealth, and {health:.0f}/100 vitality."
            )
            focus_5y_cur = (
                f"Drifting along on {b_sleep:.1f}h sleep, {b_screen:.1f}h screens, and ₹{b_spend:.0f} spending wasn't just a college phase—it became our adult default. "
                f"In 2031, our career momentum is stalled, health is compromised, and financial anxiety is constant."
            )

        ledger_5y = (
            f"┌────────────────────────────────────────────────────────┐\n"
            f"│ 🏛️ FIVE-YEAR COMPOUNDING MULTIPLIER LEDGER (2031)      │\n"
            f"├────────────────────────────────────────────────────────┤\n"
            f"│ • Cumulative Deep Focus Moat : ~{compound_study_hours:,} Hours of Craft Mastery\n"
            f"│ • Autonomous Capital Runway  : ₹{compound_savings_5y:,.0f}\n"
            f"│ • Biological Health Span     : {health:.0f} / 100 Adult Vitality\n"
            f"│ • Twenties Burnout Resilience: {100 - burnout:.0f}% Protection Index\n"
            f"│ • Executive Career Autonomy  : Unshakeable Professional Moat\n"
            f"└────────────────────────────────────────────────────────┘"
        )

        if is_improved:
            header_5y = (
                f"[ 2031 EXECUTIVE RETROSPECTIVE // TIME CAPSULE ]\n"
                f"CHRONICLE : November 2031 (Age +5 Years)\n"
                f"SETTING   : Senior Innovation Studio • Tech Hub\n"
                f"ADDRESSED : Student {name} (Class of 2026)\n"
                f"ARCHIVE   : Five-Year Compounding Manifesto"
            )

            if tone == "motivational":
                title = f"From 2031: How Your Daily Focus Built Our Career and Autonomy"
                key_quote = f"Compounding over 1,825 days turned a {b_study:.1f}h student routine into {compound_study_hours:,} hours of intellectual mastery."
                salutation = f"Dear 2026 {name},"
                opening = (
                    f"I am writing across a five-year divide from the year 2031. College is behind us now, and I am sitting in our own "
                    f"apartment reflecting on where our journey truly began. It didn't start at graduation—it started on the exact day "
                    f"you decided that averaging {b_sleep:.1f}h sleep, {b_screen:.1f}h on screens, and ₹{b_spend:.0f}/day spending wasn't good enough for who you wanted to become."
                )
                body = (
                    f"{focus_5y_imp} {streak_phrase}.\n\n"
                    f"And financially, trimming our daily budget to ₹{spend:.0f}/day allowed compound growth to build an independent "
                    f"foundation of ₹{compound_savings_5y:,.0f}. We have autonomy, freedom of choice, and zero debt stress.{notes_callout}\n\n"
                    f"{ledger_5y}"
                )
                closing = (
                    f"Never underestimate the power of your daily routine. Every hour of sleep you protect and every page you study "
                    f"is building the extraordinary life I am living today.\n\n"
                    f"— Your 2031 Future Self, living the life you built"
                )
            elif tone == "honest":
                title = f"The 2031 Audit: Proof That Leaving {b_screen:.1f}h Screens Behind Was Worth It"
                key_quote = f"In college, you stopped bleeding {b_screen:.1f}h to your phone and built a {compound_study_hours:,} hour career moat."
                salutation = f"{name}, listen across five years:"
                opening = (
                    f"It is 2031. Five years have elapsed since you sat looking at your habit logs. Back then, you were losing "
                    f"{b_screen:.1f} hours every day to your screen and getting only {b_sleep:.1f} hours of sleep. The real world "
                    f"has now audited that decision."
                )
                body = (
                    f"{focus_5y_imp}\n\n"
                    f"That ₹{compound_savings_5y:,.0f} investment cushion? It exists because you refused to let ₹{b_spend:.0f}/day leak "
                    f"into mindless peer spending five years ago. You bought our freedom.{notes_callout}\n\n"
                    f"{ledger_5y}"
                )
                closing = (
                    f"Stay relentless. The person you are building right now is someone I am deeply proud of.\n\n"
                    f"— Your Future Self, standing tall in 2031"
                )
            else:  # gentle
                title = f"A Loving Letter From 2031: You Were Always Worth The Care"
                key_quote = f"You learned that resting your body ({sleep:.1f}h) was the foundation of our entire five-year journey."
                salutation = f"Dearest 2026 {name},"
                opening = (
                    f"I am writing from 2031 with deep warmth. I remember how heavy things felt when you were running on {b_sleep:.1f} hours of sleep, "
                    f"scrolling late into the night, and worrying about whether you had what it takes to build a good life."
                )
                body = (
                    f"I want to reach back and comfort you: you didn't need to be perfect. Choosing small, gentle consistency—protecting "
                    f"{sleep:.1f} hours of rest and {study:.1f} hours of study—nurtured a {health:.0f}/100 vitality and quiet confidence. "
                    f"{focus_5y_imp}\n\n"
                    f"You gave us the gift of a calm nervous system and a comfortable financial future (₹{compound_savings_5y:,.0f}). {streak_phrase}.{notes_callout}\n\n"
                    f"{ledger_5y}"
                )
                closing = (
                    f"Be patient with yourself today. You are building something lasting and beautiful.\n\n"
                    f"— With unconditional love, your 2031 self"
                )

            suggestions = [
                f"1. Compounding Craft Moat: Commit to your {study:.1f}h daily focus routine as the primary career capital building toward 2031.",
                f"2. Biological Sovereignty: Protect your {sleep:.1f}h sleep window to permanently eliminate the risk of mid-twenties burnout.",
                f"3. Capital Autonomy: Save consistently toward your ₹{compound_savings_5y:,.0f} 5-year financial freedom goal.",
            ]

        else:
            # Current Path Warning (5 Years)
            header_5y = (
                f"[ 2031 TIME CAPSULE WARNING // THE COST OF AUTOPILOT ]\n"
                f"CHRONICLE : November 2031 (Age +5 Years)\n"
                f"SETTING   : Exhausted Office Cubicle • Late Evening\n"
                f"ADDRESSED : Student {name} (Class of 2026)\n"
                f"ARCHIVE   : The Five-Year Drift Audit"
            )
            title = f"From 2031 With High Alarm: The Five-Year Trap of Doing Nothing"
            key_quote = f"Habits don't stay in college. Living on {b_sleep:.1f}h sleep and {b_screen:.1f}h screens followed us straight into our career."
            salutation = f"{name}, read this with absolute clarity:"
            opening = (
                f"I am writing from 2031. Five years have passed since you looked at your tracked routine ({b_sleep:.1f}h sleep, {b_screen:.1f}h screen, "
                f"₹{b_spend:.0f} spending) and thought you could fix it 'someday'. I am living in that 'someday', and it is painfully exhausting."
            )
            body = (
                f"{focus_5y_cur}\n\n"
                f"Chronic exhaustion from {b_sleep:.1f}h sleep became our permanent baseline, with burnout locked at {burnout:.0f}%. "
                f"Financially, continuing to bleed ₹{b_spend:.0f} every day left us with an embarrassing ₹{savings * 2:,.0f} after five years. "
                f"We are living paycheck to paycheck because you refused to build a budget in college.{notes_callout}\n\n"
                f"{ledger_5y}"
            )
            closing = (
                f"Break this loop today. You have 1,825 days to rewrite this ending before it becomes permanent.\n\n"
                f"— Your 2031 Self, pleading with you to change"
            )

            suggestions = [
                f"1. The 5-Year Reboot: Swap 45 minutes of screen time for sleep to protect your brain from chronic adult fatigue.",
                f"2. Daily Skill Moat: Carve out 1 uninterrupted study hour before lunch to save our career trajectory.",
                f"3. Strict Spending Cap: Cut daily spending from ₹{b_spend:.0f} down to ₹{b_spend * 0.7:.0f} to start building an emergency fund.",
            ]

        content = f"{header_5y}\n\n{salutation}\n\n{opening}\n\n{body}\n\n{closing}"

    return {
        "title": title,
        "theme_badge": theme_badge,
        "key_quote": key_quote,
        "letter_content": content,
        "suggestions": suggestions,
        "horizon_label": "5-Year Horizon (2031)" if is_five_years else "6-Month Horizon (Semester)",
        "superpower": profile["superpower"],
        "vulnerability": profile["vulnerability"],
        "generated_by": "simulation_engine",
    }


def generate_future_self_letter(
    user_name: str,
    scenario: str,
    horizon: str,
    tone: str,
    habits: Dict[str, float],
    metrics: Dict[str, Any],
    baseline_habits: Optional[Dict[str, float]] = None,
    user_focus: Optional[str] = "balanced",
    streak_days: Optional[int] = 0,
    latest_notes: Optional[str] = "",
) -> Dict[str, Any]:
    """
    Primary letter generation pipeline:
    1. Checks for GEMINI_API_KEY or ANTHROPIC_API_KEY.
    2. If present, calls LLM with comprehensive baseline vs target habit contrast.
    3. If absent or fails, falls back to the intelligent procedural narrative engine.
    """
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    anthropic_key = os.getenv("ANTHROPIC_API_KEY", "").strip()

    has_gemini = bool(gemini_key and "your_gemini" not in gemini_key.lower())
    has_anthropic = bool(anthropic_key and "your_anthropic" not in anthropic_key.lower())

    b = baseline_habits or habits

    if not has_gemini and not has_anthropic:
        logger.info("Using built-in intelligent simulation narrative engine (no AI API keys configured).")
        return generate_local_fallback_letter(
            user_name, scenario, horizon, tone, habits, metrics,
            baseline_habits=b, user_focus=user_focus, streak_days=streak_days, latest_notes=latest_notes
        )

    is_five_years = horizon == "5_years"
    horizon_text = "5 years" if is_five_years else "6 months"
    theme_badge = "⏳ Sealed Time Capsule • Dispatched From 2031" if is_five_years else "📅 Semester Dispatch • +180 Days Out"

    if is_five_years:
        horizon_instructions = (
            "HORIZON: 5 YEARS (Year 2031 / Post-Graduation / Adult Career & Independence).\n"
            "- Perspective: An older, mature, accomplished (or regretful) adult self 5 years in the future.\n"
            "- Focus: Long-term compounding over 1,825 days, transition from student to career professional, "
            "accumulated ~4,000+ deep study hours, long-term health and vitality in mid-twenties, and compound financial independence.\n"
            "- Structure: A sealed time capsule letter reflecting back on college as the pivotal turning point of their life. "
            "End with 3 strategic North Star principles for the 5-year journey."
        )
    else:
        horizon_instructions = (
            "HORIZON: 6 MONTHS (End of Next Semester / Finals Week / Internship Season).\n"
            "- Perspective: The immediate future self at the finish line of the upcoming semester (+180 days).\n"
            "- Focus: Immediate campus and academic reality, midterm/finals survival, sleep debt vs exam recall, "
            "avoiding the mid-semester crash, canteen/impulse spending discipline, and immediate semester CGPA impact.\n"
            "- Structure: A high-priority tactical dispatch / desk memo written right after semester exams. "
            "End with 3 concrete micro-action sprints for this week."
        )

    scenario_name = "Improved Path" if scenario == "improved" else "Current Path"
    notes_line = f"- Recent Journal Note: \"{latest_notes}\"" if latest_notes else ""

    prompt = FUTURE_SELF_PROMPT_TEMPLATE.format(
        user_name=user_name or "Explorer",
        horizon_text=horizon_text,
        horizon_instructions=horizon_instructions,
        theme_badge=theme_badge,
        scenario_name=scenario_name,
        baseline_sleep=float(b.get("sleep_hours", 6.5)),
        baseline_screen=float(b.get("screen_time_hours", 5.0)),
        baseline_exercise=float(b.get("physical_activity_minutes", 25.0)),
        baseline_study=float(b.get("study_hours", 2.5)),
        baseline_spend=float(b.get("daily_spending", b.get("total_spending", 150.0))),
        streak_days=int(streak_days or 0),
        user_focus=user_focus or "balanced",
        notes_line=notes_line,
        sleep_hours=float(habits.get("sleep_hours", 7.5)),
        screen_time_hours=float(habits.get("screen_time_hours", 4.0)),
        activity_min=float(habits.get("physical_activity_minutes", 35.0)),
        study_hours=float(habits.get("study_hours", 4.0)),
        daily_spending=float(habits.get("daily_spending", habits.get("total_spending", 100.0))),
        projected_gpa=float(metrics.get("academic_gpa", 7.80)),
        health_index=float(metrics.get("health_index", 70.0)),
        energy_score=float(metrics.get("energy_score", 65.0)),
        burnout_risk=float(metrics.get("burnout_risk", 35.0)),
        projected_savings=float(metrics.get("projected_savings", 2500.0)),
        tone=tone,
    )

    # 1. Try Gemini if configured
    if has_gemini:
        try:
            from google import genai
            client = genai.Client(api_key=gemini_key)
            response = client.models.generate_content(
                model="gemini-1.5-flash",
                contents=prompt,
            )
            raw_text = response.text.strip()
            if raw_text.startswith("```"):
                lines = raw_text.splitlines()
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].startswith("```"):
                    lines = lines[:-1]
                raw_text = "\n".join(lines).strip()
            parsed = json.loads(raw_text)
            profile = _diagnose_habit_profile(b, habits)
            return {
                "title": parsed.get("title", f"Letter from your Future Self ({horizon_text})"),
                "theme_badge": parsed.get("theme_badge", theme_badge),
                "key_quote": parsed.get("key_quote", "Your small daily habits compound into our dream life."),
                "letter_content": parsed.get("letter_content", raw_text),
                "suggestions": parsed.get("suggestions", [
                    "Protect 7.5+ hours of sleep nightly.",
                    "Dedicate 45 minutes to physical activity.",
                    "Review daily spending before sleeping.",
                ]),
                "horizon_label": "5-Year Horizon (2031)" if is_five_years else "6-Month Horizon (Semester)",
                "superpower": profile["superpower"],
                "vulnerability": profile["vulnerability"],
                "generated_by": "google_gemini",
            }
        except Exception as e:
            logger.warning(f"Gemini API call failed: {e}. Trying Anthropic Claude or local fallback.")

    # 2. Try Anthropic Claude if configured
    if has_anthropic:
        try:
            from anthropic import Anthropic
            client = Anthropic(api_key=anthropic_key)

            response = client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1400,
                temperature=0.7,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            raw_text = response.content[0].text.strip()

            if raw_text.startswith("```"):
                lines = raw_text.splitlines()
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].startswith("```"):
                    lines = lines[:-1]
                raw_text = "\n".join(lines).strip()

            parsed = json.loads(raw_text)
            profile = _diagnose_habit_profile(b, habits)
            return {
                "title": parsed.get("title", f"Letter from your Future Self ({horizon_text})"),
                "theme_badge": parsed.get("theme_badge", theme_badge),
                "key_quote": parsed.get("key_quote", "Your small daily habits compound into our dream life."),
                "letter_content": parsed.get("letter_content", raw_text),
                "suggestions": parsed.get("suggestions", [
                    "Protect 7.5+ hours of sleep nightly.",
                    "Dedicate 45 minutes to physical activity.",
                    "Review daily spending before sleeping.",
                ]),
                "horizon_label": "5-Year Horizon (2031)" if is_five_years else "6-Month Horizon (Semester)",
                "superpower": profile["superpower"],
                "vulnerability": profile["vulnerability"],
                "generated_by": "anthropic_claude",
            }
        except Exception as e:
            logger.warning(f"Anthropic API call failed: {e}. Falling back to simulation narrative engine.")

    # 3. Fallback to expert procedural narrative engine
    fallback = generate_local_fallback_letter(
        user_name, scenario, horizon, tone, habits, metrics,
        baseline_habits=b, user_focus=user_focus, streak_days=streak_days, latest_notes=latest_notes
    )
    fallback["generated_by"] = "simulation_engine_fallback"
    return fallback
