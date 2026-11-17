"""
HabitTwin LLM Future-Self Narrative Service
Integrates with Anthropic Claude API to generate emotionally resonant,
first-person letters from the user's future self.
Includes an intelligent local fallback narrative engine when no API key is provided.
"""

import os
import json
import logging
from typing import Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("habittwin.llm")

# The exact prompt template used for Anthropic Claude
FUTURE_SELF_PROMPT_TEMPLATE = """You are the digital future self of {user_name}, writing a personal letter back in time from {horizon_text} into the future.

The simulation has projected {user_name}'s trajectory based on their real daily habits:
- Scenario: {scenario_name} ({scenario_description})
- Sleep Duration: {sleep_hours:.1f} hours/day
- Total Screen Time: {screen_time_hours:.1f} hours/day (including study hours)
- Physical Activity: {activity_min:.0f} minutes/day
- Study Hours: {study_hours:.1f} hours/day
- Daily Spending: ₹{daily_spending:.2f}/day

Projected Outcomes at {horizon_text}:
- Academic Performance: {projected_gpa:.2f} CGPA (Scale: 0.0 - 10.0, Cohort Percentile: {academic_percentile:.0f}%)
- Composite Health Index: {health_index:.0f}/100 (Energy: {energy_score:.0f}/100, Fitness: {fitness_score:.0f}/100)
- Burnout & Stress Risk: {burnout_risk:.0f}/100
- Projected Savings: ₹{projected_savings:,.2f} (Savings Rate: {savings_rate:.1f}%)
- Overall Lifestyle Score: {lifestyle_score:.0f}/100

Chosen Tone: {tone}
Tone Guidelines:
- If 'motivational': Inspiring, passionate, celebrating resilience, painting a vivid picture of hard-earned victory.
- If 'honest': Candid, unfiltered reality check, tough-love, direct cause-and-effect without sugarcoating.
- If 'gentle': Warm, compassionate, validating struggles, encouraging self-forgiveness and gentle tiny steps.

Instructions:
1. Write in the first person ("I am you, writing from {horizon_text} ahead...").
2. Reference their actual numbers (sleep, screen time, savings, CGPA on a 10.0 scale) naturally in the prose.
3. Describe the day-to-day physical feeling, mental clarity, and environment of this future self.
4. If this is the "Current Path" with negative habits, honestly warn them of the exhaustion or financial pinch, but offer hope. If this is the "Improved Path", thank them for deciding to change today.
5. End with exactly 3 concrete, achievable, highly specific micro-action improvements they can start this week.

Return your response in pure JSON format with this exact structure:
{{
  "title": "A captivating, evocative title for the letter",
  "letter_content": "The full multi-paragraph letter text...",
  "suggestions": [
    "1. Micro-action suggestion with clear target...",
    "2. Micro-action suggestion...",
    "3. Micro-action suggestion..."
  ]
}}
Do NOT include markdown backticks around the JSON; output valid raw JSON only.
"""


def generate_local_fallback_letter(
    user_name: str,
    scenario: str,
    horizon: str,
    tone: str,
    habits: Dict[str, float],
    metrics: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Expert rule-based narrative engine that generates highly personalized,
    emotionally resonant future-self letters even without an Anthropic API key.
    """
    horizon_text = "5 years" if horizon == "5_years" else "6 months"
    sleep = habits.get("sleep_hours", 7.0)
    screen = habits.get("screen_time_hours", 4.0)
    exercise = habits.get("physical_activity_minutes", 30.0)
    study = habits.get("study_hours", 3.0)
    spend = habits.get("daily_spending", 25.0)

    gpa = metrics.get("academic_gpa", 7.80)
    health = metrics.get("health_index", 70.0)
    energy = metrics.get("energy_score", 65.0)
    burnout = metrics.get("burnout_risk", 35.0)
    savings = metrics.get("projected_savings", 2500.0)
    lifestyle = metrics.get("overall_lifestyle_score", 72.0)

    # Tailor title and tone
    if scenario == "improved" or lifestyle >= 75:
        if tone == "motivational":
            title = f"The View From Here: How Your Quiet Consistency Rewrote Our Story"
            salutation = f"Dear Present {user_name},"
            opening = (
                f"I'm writing to you from {horizon_text} in the future, and I need to start with something "
                f"you probably don't hear often enough: thank you. Thank you for the mornings you chose discipline over hesitation, "
                f"and for the evenings you put the phone down to let your mind actually recharge."
            )
            body1 = (
                f"Because you decided to maintain {sleep:.1f} hours of restorative sleep and carved out {exercise:.0f} minutes "
                f"for daily exercise, our physical body right now feels completely transformed. We wake up with an energy score of "
                f"{energy:.0f}/100—no midday fog, no anxious palpitations from triple espresso shots. Our CGPA climbed to a stellar "
                f"{gpa:.2f}/10, unlocking opportunities we used to only whisper about in our dorm room."
            )
            body2 = (
                f"Financially, keeping our daily spending around ₹{spend:.2f}/day allowed compound growth to work its quiet magic. "
                f"We are sitting on ₹{savings:,.2f} in our emergency and investment fund. The peace of mind that brings is something "
                f"money can't directly buy, but conscious habit building definitely did."
            )
            closing = "Keep walking this line. We are living proof that your small daily habits compound into our dream life."
        elif tone == "honest":
            title = f"Proof of Principle: What Happens When You Stop Making Excuses"
            salutation = f"Hey {user_name},"
            opening = (
                f"Let's be straight with each other: you were skeptical about whether capping screen time at {screen:.1f} hours "
                f"and pushing for {study:.1f} hours of deep study would actually make a difference. Here at {horizon_text} out, the math speaks for itself."
            )
            body1 = (
                f"Our CGPA reached {gpa:.2f}/10, not through miraculous late-night cram sessions, but because you respected the biological "
                f"truth of sleep ({sleep:.1f} hrs) and gave your brain time to synthesize knowledge. Burnout dropped all the way to {burnout:.0f}/100. "
                f"You finally stopped treating rest as a reward and started treating it as a prerequisite."
            )
            body2 = (
                f"That ₹{savings:,.2f} in the bank? It happened because you cut out mindless micro-transactions and food delivery fees. "
                f"It was annoying at first, but having zero debt panic today made every single one of those decisions worth it."
            )
            closing = "Don't let complacency creep back in. Momentum is fragile, but you've earned every bit of this."
        else:  # gentle
            title = f"A Gentle Letter of Gratitude From Who You Are Becoming"
            salutation = f"Dearest {user_name},"
            opening = (
                f"Take a deep breath and relax your shoulders. I know how heavy things feel right now in the thick of the semester. "
                f"I'm writing to you from {horizon_text} ahead to reassure you: the gentle boundaries you are setting are working."
            )
            body1 = (
                f"By granting yourself {sleep:.1f} hours of sleep and allowing yourself {exercise:.0f} minutes of joyful movement, "
                f"our health index has flourished to {health:.0f}/100. You learned that being kind to yourself isn't laziness—it was the exact fuel "
                f"that propelled our academic performance to a {gpa:.2f} CGPA."
            )
            body2 = (
                f"You also learned to be mindful with money, gradually saving ₹{savings:,.2f} without depriving yourself of joy. "
                f"You gave us breathing room, and for that, I am endlessly grateful."
            )
            closing = "Trust the process. You are doing so much better than you give yourself credit for."

        suggestions = [
            f"1. Establish a strict 'digital sundown': Put your phone out of arm's reach 45 minutes before sleep to protect your {sleep:.1f}-hour sleep buffer.",
            f"2. Use 50/10 Pomodoro blocks for studying to sustain {study:.1f} hours of deep focus without mental fatigue.",
            f"3. Set an automated weekly transfer of ₹{(spend * 3.5):.2f} into a dedicated high-yield savings vault.",
        ]

    else:
        # Current path with warnings
        if tone == "honest":
            title = f"Wake Up Call: A Reality Check From Where This Road Ends"
            salutation = f"{user_name}, Listen Closely:"
            opening = (
                f"I am writing to you from {horizon_text} into the future, and I need to be completely honest with you. "
                f"If you stay on this exact trajectory, things are going to get painfully harder than you think."
            )
            body1 = (
                f"Right now, averaging {sleep:.1f} hours of fragmented sleep while scrolling for {screen:.1f} hours a day is keeping our energy "
                f"at a sluggish {energy:.0f}/100. Our burnout risk has spiked to {burnout:.0f}/100. You can feel that low-grade anxiety right now, "
                f"and over {horizon_text}, it settles into chronic exhaustion. Our projected CGPA is slipping toward {gpa:.2f}/10."
            )
            body2 = (
                f"Meanwhile, with daily spending around ₹{spend:.2f}/day, our savings sit at just ₹{savings:,.2f}. One unexpected medical "
                f"bill or tech breakdown will send us straight into high-interest debt panic."
            )
            closing = (
                "You have the power to change this trajectory today. You don't need a radical overnight overhaul—just "
                "one small courageous decision to reclaim your sleep and study hours."
            )
        elif tone == "motivational":
            title = f"You Can Course-Correct: Why Your Future Isn't Written in Stone"
            salutation = f"Dear Present {user_name},"
            opening = (
                f"I see you looking at this screen right now from {horizon_text} ahead. I know you feel tired, and I know changing daily habits feels daunting. "
                f"But I want you to know: your current path does NOT have to be your destiny."
            )
            body1 = (
                f"Right now our habits are holding us back: sleeping only {sleep:.1f} hours and spending {screen:.1f} hours on screens is costing us "
                f"our academic edge ({gpa:.2f} CGPA) and pushing burnout to {burnout:.0f}%. But every single habit is just a feedback loop waiting to be rewritten."
            )
            body2 = (
                f"Imagine what happens if you reclaim just 1 hour from screen time and reinvest it into sleep and movement. "
                f"That single pivot can turn our projected ₹{savings:,.2f} savings and fatigue into peak vitality."
            )
            closing = "Don't let autopilot steal our potential. Start today with just 30 minutes of intentional study and an earlier bedtime."
        else:  # gentle
            title = f"A Gentle Warning: Please Take Care of Us"
            salutation = f"Dear {user_name},"
            opening = (
                f"I am writing from {horizon_text} ahead with love and zero judgment. I remember how overwhelmed you feel right now, "
                f"and how scrolling late at night feels like the only personal time you have."
            )
            body1 = (
                f"Please be gentle with yourself, but also recognize that our body is struggling under {sleep:.1f} hours of sleep and high screen time. "
                f"Our energy is down to {energy:.0f}/100 and burnout is hovering at {burnout:.0f}%. You deserve rest that truly restores you."
            )
            body2 = (
                f"Our finances are also stretched thin with ₹{spend:.2f} in daily spending. Giving yourself permission to pause and budget "
                f"will take so much hidden stress off your shoulders."
            )
            closing = "Take one small step tonight. Go to sleep 30 minutes earlier. You deserve to feel rested."

        suggestions = [
            f"1. Replace 30 minutes of late-night screen time with light reading to boost sleep duration from {sleep:.1f}h toward 7.5h.",
            f"2. Schedule a daily 20-minute brisk walk outside to jumpstart dopamine and lower burnout risk.",
            f"3. Enforce a 24-hour waiting rule on non-essential online shopping to protect your cash reserves.",
        ]

    content = f"{salutation}\n\n{opening}\n\n{body1}\n\n{body2}\n\n{closing}"

    return {
        "title": title,
        "letter_content": content,
        "suggestions": suggestions,
        "generated_by": "simulation_engine",
    }


def generate_future_self_letter(
    user_name: str,
    scenario: str,
    horizon: str,
    tone: str,
    habits: Dict[str, float],
    metrics: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Primary letter generation pipeline:
    1. Checks for ANTHROPIC_API_KEY environment variable.
    2. If present, calls Anthropic Claude (claude-3-5-sonnet-20241022 or fallback model).
    3. If not present or if API call fails, falls back to the intelligent narrative engine seamlessly.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    
    # If key is missing or dummy placeholder, use local fallback narrative generator
    if not api_key or "your_anthropic_api_key" in api_key.lower():
        logger.info("Using built-in intelligent simulation narrative engine (no Anthropic API key configured).")
        return generate_local_fallback_letter(user_name, scenario, horizon, tone, habits, metrics)

    horizon_text = "5 years" if horizon == "5_years" else "6 months"
    scenario_name = "Improved Path" if scenario == "improved" else "Current Path"
    scenario_description = (
        "disciplined, healthy routine with optimal sleep, exercise, and budgeting"
        if scenario == "improved"
        else "extrapolated current everyday habits"
    )

    prompt = FUTURE_SELF_PROMPT_TEMPLATE.format(
        user_name=user_name or "Explorer",
        horizon_text=horizon_text,
        scenario_name=scenario_name,
        scenario_description=scenario_description,
        sleep_hours=float(habits.get("sleep_hours", 7.0)),
        screen_time_hours=float(habits.get("screen_time_hours", 4.0)),
        activity_min=float(habits.get("physical_activity_minutes", 30.0)),
        study_hours=float(habits.get("study_hours", 3.0)),
        daily_spending=float(habits.get("daily_spending", 25.0)),
        projected_gpa=float(metrics.get("academic_gpa", 7.80)),
        academic_percentile=float(metrics.get("academic_percentile", 65.0)),
        health_index=float(metrics.get("health_index", 70.0)),
        energy_score=float(metrics.get("energy_score", 65.0)),
        fitness_score=float(metrics.get("fitness_score", 60.0)),
        burnout_risk=float(metrics.get("burnout_risk", 35.0)),
        projected_savings=float(metrics.get("projected_savings", 2500.0)),
        savings_rate=float(metrics.get("savings_rate_pct", 20.0)),
        lifestyle_score=float(metrics.get("overall_lifestyle_score", 70.0)),
        tone=tone,
    )

    try:
        from anthropic import Anthropic
        client = Anthropic(api_key=api_key)

        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1200,
            temperature=0.7,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        raw_text = response.content[0].text.strip()

        # Clean JSON markdown if wrapped in ```json
        if raw_text.startswith("```"):
            lines = raw_text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            raw_text = "\n".join(lines).strip()

        parsed = json.loads(raw_text)
        return {
            "title": parsed.get("title", f"Letter from your Future Self ({horizon_text})"),
            "letter_content": parsed.get("letter_content", raw_text),
            "suggestions": parsed.get("suggestions", [
                "Protect 7.5+ hours of sleep nightly.",
                "Dedicate 45 minutes to physical activity.",
                "Review daily spending before sleeping.",
            ]),
            "generated_by": "anthropic_claude",
        }

    except Exception as e:
        logger.warning(f"Anthropic API call failed or encountered error: {e}. Falling back to simulation narrative engine.")
        fallback = generate_local_fallback_letter(user_name, scenario, horizon, tone, habits, metrics)
        fallback["generated_by"] = "simulation_engine_fallback"
        return fallback
