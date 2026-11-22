/**
 * HabitTwin Client-Side Deeply Personalized Future Self Letter Generator
 * Dynamically constructs letters reflecting the user's REAL tracked baseline habits,
 * target improvements, streak, and personal life focus.
 */

function diagnoseProfile(b = {}, target = {}) {
  const cSleep = b.sleep_hours ?? 6.2;
  const cScreen = b.screen_time_hours ?? 6.5;
  const cEx = b.physical_activity_minutes ?? 20;
  const cStudy = b.study_hours ?? 2.2;
  const cSpend = b.daily_spending ?? (b.total_spending ?? 350);

  let superpower = 'commitment to tracking daily routines';
  if (cSleep >= 7.5) superpower = `restorative sleep foundation (${cSleep.toFixed(1)}h/night)`;
  else if (cStudy >= 4.0) superpower = `deep study endurance (${cStudy.toFixed(1)}h/day)`;
  else if (cEx >= 35) superpower = `regular physical movement (${Math.round(cEx)}m/day)`;
  else if (cSpend <= 100) superpower = `conscious student budgeting (₹${Math.round(cSpend)}/day)`;
  else if (cScreen <= 3.5) superpower = `disciplined screen habits (${cScreen.toFixed(1)}h/day)`;

  let vulnerability = 'mid-semester habit inconsistency';
  if (cScreen >= 5.5) vulnerability = `late-night screen scrolling (${cScreen.toFixed(1)}h/day)`;
  else if (cSleep < 6.5) vulnerability = `chronic sleep deficit (${cSleep.toFixed(1)}h/night)`;
  else if (cStudy < 2.5) vulnerability = `irregular study blocks (${cStudy.toFixed(1)}h/day)`;
  else if (cSpend >= 250) vulnerability = `daily cash spending leaks (₹${Math.round(cSpend)}/day)`;
  else if (cEx < 15) vulnerability = `sedentary study posture (<15m movement)`;

  return { superpower, vulnerability };
}

export function generateClientLetter({
  userName = 'Explorer',
  scenario = 'improved',
  horizon = '6_months',
  tone = 'motivational',
  habits = {},
  metrics = {},
  baselineHabits = null,
  userFocus = 'balanced',
  streakDays = 0,
  latestNotes = '',
}) {
  const name = userName.trim() || 'Explorer';
  const isFiveYears = horizon === '5_years';
  const isImproved = scenario === 'improved' || (metrics.overall_lifestyle_score ?? 70) >= 75;

  // Target / Projected Habits
  const sleep = habits.sleep_hours ?? 7.5;
  const screen = habits.screen_time_hours ?? 4.0;
  const exercise = habits.physical_activity_minutes ?? 35;
  const study = habits.study_hours ?? 4.0;
  const spend = habits.daily_spending ?? (habits.total_spending ?? 120);

  // User's Real Baseline Habits (from logs or fallback)
  const b = baselineHabits || {
    sleep_hours: 6.2,
    screen_time_hours: 6.5,
    physical_activity_minutes: 20,
    study_hours: 2.2,
    daily_spending: 380,
  };
  const bSleep = b.sleep_hours ?? 6.2;
  const bScreen = b.screen_time_hours ?? 6.5;
  const bEx = b.physical_activity_minutes ?? 20;
  const bStudy = b.study_hours ?? 2.2;
  const bSpend = b.daily_spending ?? (b.total_spending ?? 380);

  const gpa = metrics.academic_gpa ?? 7.8;
  const health = metrics.health_index ?? 72;
  const energy = metrics.energy_score ?? 68;
  const burnout = metrics.burnout_risk ?? 30;
  const savings = metrics.projected_savings ?? 8500;
  const recall = metrics.exam_recall_rate ?? 78;
  const blankout = metrics.exam_blankout_risk ?? 14;

  const streak = intSafe(streakDays);
  const profile = diagnoseProfile(b, habits);

  let streakPhrase = 'deciding to stop running on autopilot and confront your daily numbers changed our trajectory';
  if (streak >= 15) {
    streakPhrase = `your relentless ${streak}-day tracking streak proved that you are someone who keeps promises to yourself`;
  } else if (streak >= 5) {
    streakPhrase = `hitting a ${streak}-day consistency streak broke the friction that used to derail your weeks`;
  } else if (streak > 0) {
    streakPhrase = `starting your tracking journey with ${streak} logged days was the spark that ignited this shift`;
  }

  const notesCallout = latestNotes
    ? `\n\nI was looking back at that honest journal note you logged: "${latestNotes}". You were running on fumes that day, but acknowledging that friction was the exact catalyst that turned things around.`
    : '';

  // =========================================================================
  // HORIZON A: 6-MONTH SEMESTER DISPATCH
  // =========================================================================
  if (!isFiveYears) {
    const themeBadge = '📅 Semester Field Dispatch // +180 Days Out';

    let focus6mImp = '';
    let focus6mCur = '';
    if (userFocus === 'academics') {
      focus6mImp = `Because you prioritized academic mastery—expanding study from ${bStudy.toFixed(1)}h to ${study.toFixed(1)}h daily—our CGPA soared to a commanding ${gpa.toFixed(2)}/10.0. In seminars and lab presentations, professors took notice. While classmates crammed in panic before finals, our exam recall held at an effortless ${Math.round(recall)}% with blank-out risk at just ${Math.round(blankout)}%.`;
      focus6mCur = `Right now, averaging only ${bStudy.toFixed(1)} hours of study while losing ${bScreen.toFixed(1)} hours to your phone leaves us skating on thin ice with a ${gpa.toFixed(2)} CGPA. Our exam blank-out risk is spiked at ${Math.round(blankout)}%, and last-minute cramming will not save our semester grades.`;
    } else if (userFocus === 'health') {
      focus6mImp = `Prioritizing your biology—expanding sleep from ${bSleep.toFixed(1)}h to ${sleep.toFixed(1)}h and committing ${Math.round(exercise)}m to daily movement—healed our nervous system. Our health index reached ${Math.round(health)}/100 and energy held rock-solid at ${Math.round(energy)}/100. The 3 PM lecture brain fog and midnight caffeine tremors you accepted as normal completely vanished.`;
      focus6mCur = `Running our body on only ${bSleep.toFixed(1)} hours of sleep while screen exposure tops ${bScreen.toFixed(1)} hours is running our engine dry. Our burnout risk is spiked at ${Math.round(burnout)}%, and you can already feel that constant morning exhaustion making 8:30 AM lectures torture.`;
    } else if (userFocus === 'wealth') {
      focus6mImp = `Taking control of your student wallet—slashing daily spending from ₹${Math.round(bSpend)} down to ₹${Math.round(spend)}—worked miracles. We built an end-of-semester emergency reserve of ₹${Math.round(savings).toLocaleString('en-IN')}. Having that financial cushion while our peers were stressed about canteen bills, project materials, and weekend outings gave us unprecedented peace of mind.`;
      focus6mCur = `Letting ₹${Math.round(bSpend)}/day slip away into food delivery fees, midnight snacks, and impulse shopping is bleeding our student wallet dry. At this rate, we enter the next term with barely ₹${Math.round(savings).toLocaleString('en-IN')} in savings, one unexpected book or lab fee away from panic.`;
    } else {
      focus6mImp = `You brought complete balance to our campus life: harmonizing ${study.toFixed(1)}h of study with ${sleep.toFixed(1)}h of deep sleep and ₹${Math.round(spend)}/day budgeting. Our CGPA reached ${gpa.toFixed(2)}/10.0, our vitality hit ${Math.round(health)}/100, and our savings grew to ₹${Math.round(savings).toLocaleString('en-IN')}.`;
      focus6mCur = `Your current daily averages—${bSleep.toFixed(1)}h sleep, ${bScreen.toFixed(1)}h screen, and ₹${Math.round(bSpend)}/day spending—are pulling our semester in opposite directions. Projected CGPA sits at ${gpa.toFixed(2)} while burnout hovers at a dangerous ${Math.round(burnout)}%.`;
    }

    const scorecard6m = `┌────────────────────────────────────────────────────────┐
│ 📊 SEMESTER SCORECARD & COGNITIVE VITALS (+180 DAYS)   │
├────────────────────────────────────────────────────────┤
│ • Expected Semester CGPA : ${gpa.toFixed(2)} / 10.0
│ • Exam Memory Recall     : ${Math.round(recall)}% (Recall under pressure)
│ • Exam Blank-Out Risk    : ${Math.round(blankout)}% (${blankout >= 25 ? 'Critical Risk' : 'Controlled'})
│ • Daily Energy Level     : ${Math.round(energy)} / 100 (${energy >= 70 ? 'Sharp' : 'Fatigued'})
│ • Semester Burnout Risk  : ${Math.round(burnout)}% (${burnout >= 45 ? 'High Warning' : 'Protected'})
│ • Semester Cash Reserve  : ₹${Math.round(savings).toLocaleString('en-IN')}
└────────────────────────────────────────────────────────┘`;

    if (isImproved) {
      const header6m = `[ CAMPUS FIELD DISPATCH // SEMESTER FINALS REPORT ]
TIMELINE  : +180 Days Out (Finals Week Complete)
LOCATION  : Central Campus Library • 2nd Floor Focus Pod
RECIPIENT : Present-Day ${name} (Beginning of Semester)
STATUS    : Trajectory Overhaul Verified`;

      const title = `Dispatch From Finals Week: How Your 180-Day Pivot Saved Our Semester`;
      const keyQuote = `You took our daily routine from ${bSleep.toFixed(1)}h sleep and ${bScreen.toFixed(1)}h screens to a commanding ${gpa.toFixed(2)} CGPA.`;
      const salutation = `Dear Present-Day ${name},`;
      const opening = `I am writing this from the campus library right as our final semester exams wrap up, exactly 180 days ahead. I pulled out my journal because I needed to say thank you. Six months ago, when you logged that routine averaging ${bSleep.toFixed(1)} hours of sleep, ${bScreen.toFixed(1)} hours of screen time, and ₹${Math.round(bSpend)} in daily spending, you were exhausted and wondering if small habit adjustments would really make a difference. Well, ${streakPhrase}.`;

      const body = `Look at the contrast: by shifting sleep to ${sleep.toFixed(1)} hours and curbing screen time to ${screen.toFixed(1)} hours, our cognitive edge returned. While others around us were chugging third energy drinks at 3 AM in exam week, we walked in rested and alert. ${focus6mImp}

Our biggest past vulnerability—${profile.vulnerability}—is no longer running our life. You built a working system that proved small daily habits compound into our dream semester.${notesCallout}

${scorecard6m}`;

      const closing = `Keep walking this line through the upcoming weeks. What felt like difficult discipline back then is the exact reason I am smiling at the semester finish line today.

— Your Future Self, celebrating your consistency`;

      const content = `${header6m}\n\n${salutation}\n\n${opening}\n\n${body}\n\n${closing}`;

      return {
        title,
        theme_badge: themeBadge,
        key_quote: keyQuote,
        letter_content: content,
        suggestions: [
          `1. Sleep Shield: Shift bedtime 45 minutes earlier to move from your baseline of ${bSleep.toFixed(1)}h toward your target of ${sleep.toFixed(1)}h.`,
          `2. Focus Sprint: Complete a daily ${study.toFixed(1)}h deep study block to secure your ${gpa.toFixed(2)} CGPA trajectory.`,
          `3. Daily Budget Rule: Keep daily out-of-pocket spending under ₹${Math.round(spend)} to protect your ₹${Math.round(savings).toLocaleString('en-IN')} semester cushion.`,
        ],
        horizon_label: '6-Month Horizon (Semester)',
        superpower: profile.superpower,
        vulnerability: profile.vulnerability,
        generated_by: 'client_simulation_engine',
        habit_snapshot: { baseline: b, target: habits, streak_days: streak, user_focus: userFocus },
      };
    } else {
      // Current path warning (6-Month)
      const header6m = `[ URGENT SEMESTER ALERT // FINALS CRITICAL WARNING ]
TIMELINE  : +180 Days Out (Semester Finals Crisis)
LOCATION  : Campus Hostel Room • 3:30 AM
RECIPIENT : Present-Day ${name} (Beginning of Semester)
STATUS    : High Burnout & Academic Slippage Detected`;

      const title = `Semester Alert: The High Cost of Staying on Autopilot`;
      const keyQuote = `Continuing at ${bSleep.toFixed(1)}h sleep and ${bScreen.toFixed(1)}h screen time leads directly to a ${gpa.toFixed(2)} CGPA and ${Math.round(burnout)}% burnout.`;
      const salutation = `${name}, listen closely:`;
      const opening = `I am writing from 6 months in the future, and I need to deliver an urgent wake-up call. Right now, your logs show you averaging ${bSleep.toFixed(1)} hours of sleep, ${bScreen.toFixed(1)} hours glued to screens, and spending ₹${Math.round(bSpend)} each day. If you stay on this exact trajectory for the next 180 days, you will walk straight into a mid-semester wall.`;

      const body = `${focus6mCur}

Our projected CGPA slips toward ${gpa.toFixed(2)}/10.0, and our burnout risk hits an alarming ${Math.round(burnout)}/100. Walking into exams on ${bSleep.toFixed(1)}h sleep impairs memory retrieval under pressure. Your biggest vulnerability—${profile.vulnerability}—is costing us our academic momentum and financial peace of mind.${notesCallout}

${scorecard6m}`;

      const closing = `You have the power to pivot today. Close the screen tonight, reclaim your sleep, and take back control of your degree.

— Your Future Self, urging you to change today`;

      const content = `${header6m}\n\n${salutation}\n\n${opening}\n\n${body}\n\n${closing}`;

      return {
        title,
        theme_badge: themeBadge,
        key_quote: keyQuote,
        letter_content: content,
        suggestions: [
          `1. Cut Screen Exposure: Shave 1 hour off your ${bScreen.toFixed(1)}h daily screen time to protect your cognitive energy.`,
          `2. Protect 7+ Hours Sleep: Replace late-night scrolling with rest to lower burnout from ${Math.round(burnout)}%.`,
          `3. Canteen Spending Cap: Cap daily spending at ₹${Math.round(bSpend * 0.7)} to avoid end-of-semester debt panic.`,
        ],
        horizon_label: '6-Month Horizon (Semester)',
        superpower: profile.superpower,
        vulnerability: profile.vulnerability,
        generated_by: 'client_simulation_engine',
        habit_snapshot: { baseline: b, target: habits, streak_days: streak, user_focus: userFocus },
      };
    }
  }

  // =========================================================================
  // HORIZON B: 5-YEAR TIME CAPSULE (2031)
  // =========================================================================
  const themeBadge = '⏳ Sealed Time Capsule Manifesto // Dispatched From 2031';
  const compoundStudyHours = Math.round(study * 365 * 5);
  const compoundSavings5y = Math.round(savings * 8);

  let focus5yImp = '';
  let focus5yCur = '';
  if (userFocus === 'academics') {
    focus5yImp = `Over these five years, pushing daily study from ${bStudy.toFixed(1)}h to ${study.toFixed(1)}h compounded into over ${compoundStudyHours.toLocaleString('en-IN')} hours of deep intellectual mastery. That wasn't just about college grades—it built an irreplaceable technical and strategic moat. In our mid-twenties, while peers struggled with rapid career shifts and AI disruption, you possessed rare, high-leverage expertise.`;
    focus5yCur = `Losing ${bScreen.toFixed(1)} hours daily to shallow phone consumption while studying only ${bStudy.toFixed(1)} hours locked us into a dangerous trap. Five years later, we accumulated only a fraction of the deep skill hours needed for top-tier leadership. We are stuck at entry level.`;
  } else if (userFocus === 'health') {
    focus5yImp = `Protecting ${sleep.toFixed(1)} hours of sleep and regular physical movement (${Math.round(exercise)}m/day) built the biological foundation of our entire adult life. Our health index stands at ${Math.round(health)}/100. While colleagues in their mid-twenties complain of chronic back pain, metabolic fatigue, and weekend exhaustion, you gave me the stamina and vibrant energy of a high-performing athlete.`;
    focus5yCur = `Living on ${bSleep.toFixed(1)} hours of broken sleep and sedentary habits followed us straight from college into adult life. By 2031, chronic twenties burnout (${Math.round(burnout)}%) and morning brain fog have become our permanent normal, sapping our ambition.`;
  } else if (userFocus === 'wealth') {
    focus5yImp = `Controlling college spending and capping daily expenses at ₹${Math.round(spend)} triggered the miracle of compound interest. We accumulated a financial runway of ₹${compoundSavings5y.toLocaleString('en-IN')}. Having that investment cushion gave us true autonomy—we never had to endure toxic workplaces or accept exploitative offers out of desperation. You bought our freedom.`;
    focus5yCur = `Letting ₹${Math.round(bSpend)}/day leak into peer spending and impulse purchases in college established a dangerous cycle of lifestyle inflation. After 1,825 days, we have virtually no investment assets, living paycheck to paycheck and constantly dreading rent day.`;
  } else {
    focus5yImp = `You designed a sustainable life architecture: balancing ${study.toFixed(1)}h of focused craft with ${sleep.toFixed(1)}h of rest and financial discipline. In 2031, we have built a ~${compoundStudyHours.toLocaleString('en-IN')} hour skill moat, ₹${compoundSavings5y.toLocaleString('en-IN')} in autonomous wealth, and ${Math.round(health)}/100 vitality.`;
    focus5yCur = `Drifting along on ${bSleep.toFixed(1)}h sleep, ${bScreen.toFixed(1)}h screens, and ₹${Math.round(bSpend)} spending wasn't just a college phase—it became our adult default. In 2031, our career momentum is stalled, health is compromised, and financial anxiety is constant.`;
  }

  const ledger5y = `┌────────────────────────────────────────────────────────┐
│ 🏛️ FIVE-YEAR COMPOUNDING MULTIPLIER LEDGER (2031)      │
├────────────────────────────────────────────────────────┤
│ • Cumulative Deep Focus Moat : ~${compoundStudyHours.toLocaleString('en-IN')} Hours of Craft Mastery
│ • Autonomous Capital Runway  : ₹${compoundSavings5y.toLocaleString('en-IN')}
│ • Biological Health Span     : ${Math.round(health)} / 100 Adult Vitality
│ • Twenties Burnout Resilience: ${Math.round(100 - burnout)}% Protection Index
│ • Executive Career Autonomy  : Unshakeable Professional Moat
└────────────────────────────────────────────────────────┘`;

  if (isImproved) {
    const header5y = `[ 2031 EXECUTIVE RETROSPECTIVE // TIME CAPSULE ]
CHRONICLE : November 2031 (Age +5 Years)
SETTING   : Senior Innovation Studio • Tech Hub
ADDRESSED : Student ${name} (Class of 2026)
ARCHIVE   : Five-Year Compounding Manifesto`;

    const title = `From 2031: How Your Daily Focus Built Our Career and Autonomy`;
    const keyQuote = `Compounding over 1,825 days turned a ${bStudy.toFixed(1)}h student routine into ${compoundStudyHours.toLocaleString('en-IN')} hours of intellectual mastery.`;
    const salutation = `Dear 2026 ${name},`;
    const opening = `I am writing across a five-year divide from the year 2031. College is behind us now, and I am sitting in our own apartment reflecting on where our journey truly began. It didn't start at graduation—it started on the exact day you decided that averaging ${bSleep.toFixed(1)}h sleep, ${bScreen.toFixed(1)}h on screens, and ₹${Math.round(bSpend)}/day spending wasn't good enough for who you wanted to become.`;

    const body = `${focus5yImp} ${streakPhrase}.

And financially, trimming our daily budget to ₹${Math.round(spend)}/day allowed compound growth to build an independent foundation of ₹${compoundSavings5y.toLocaleString('en-IN')}. We have autonomy, freedom of choice, and zero debt stress.${notesCallout}

${ledger5y}`;

    const closing = `Never underestimate the power of your daily routine. Every hour of sleep you protect and every page you study is building the extraordinary life I am living today.

— Your 2031 Future Self, living the life you built`;

    const content = `${header5y}\n\n${salutation}\n\n${opening}\n\n${body}\n\n${closing}`;

    return {
      title,
      theme_badge: themeBadge,
      key_quote: keyQuote,
      letter_content: content,
      suggestions: [
        `1. Compounding Craft Moat: Commit to your ${study.toFixed(1)}h daily focus routine as the primary career capital building toward 2031.`,
        `2. Biological Sovereignty: Protect your ${sleep.toFixed(1)}h sleep window to permanently eliminate the risk of mid-twenties burnout.`,
        `3. Capital Autonomy: Save consistently toward your ₹${compoundSavings5y.toLocaleString('en-IN')} 5-year financial freedom goal.`,
      ],
      horizon_label: '5-Year Horizon (2031)',
      superpower: profile.superpower,
      vulnerability: profile.vulnerability,
      generated_by: 'client_simulation_engine',
      habit_snapshot: { baseline: b, target: habits, streak_days: streak, user_focus: userFocus },
    };
  } else {
    // Current Path 5-Year Warning
    const header5y = `[ 2031 TIME CAPSULE WARNING // THE COST OF AUTOPILOT ]
CHRONICLE : November 2031 (Age +5 Years)
SETTING   : Exhausted Office Cubicle • Late Evening
ADDRESSED : Student ${name} (Class of 2026)
ARCHIVE   : The Five-Year Drift Audit`;

    const title = `From 2031 With High Alarm: The Five-Year Trap of Doing Nothing`;
    const keyQuote = `Habits don't stay in college. Living on ${bSleep.toFixed(1)}h sleep and ${bScreen.toFixed(1)}h screens followed us straight into our career.`;
    const salutation = `${name}, read this with absolute clarity:`;
    const opening = `I am writing from 2031. Five years have passed since you looked at your tracked routine (${bSleep.toFixed(1)}h sleep, ${bScreen.toFixed(1)}h screen, ₹${Math.round(bSpend)} spending) and thought you could fix it 'someday'. I am living in that 'someday', and it is painfully exhausting.`;

    const body = `${focus5yCur}

Chronic exhaustion from ${bSleep.toFixed(1)}h sleep became our permanent baseline, with burnout locked at ${Math.round(burnout)}%. Financially, continuing to bleed ₹${Math.round(bSpend)} every day left us with an embarrassing ₹${Math.round(savings * 2).toLocaleString('en-IN')} after five years. We are living paycheck to paycheck because you refused to build a budget in college.${notesCallout}

${ledger5y}`;

    const closing = `Break this loop today. You have 1,825 days to rewrite this ending before it becomes permanent.

— Your 2031 Self, pleading with you to change`;

    const content = `${header5y}\n\n${salutation}\n\n${opening}\n\n${body}\n\n${closing}`;

    return {
      title,
      theme_badge: themeBadge,
      key_quote: keyQuote,
      letter_content: content,
      suggestions: [
        `1. The 5-Year Reboot: Swap 45 minutes of screen time for sleep to protect your brain from chronic adult fatigue.`,
        `2. Daily Skill Moat: Carve out 1 uninterrupted study hour before lunch to save our career trajectory.`,
        `3. Strict Spending Cap: Cut daily spending from ₹${Math.round(bSpend)} down to ₹${Math.round(bSpend * 0.7)} to start building an emergency fund.`,
      ],
      horizon_label: '5-Year Horizon (2031)',
      superpower: profile.superpower,
      vulnerability: profile.vulnerability,
      generated_by: 'client_simulation_engine',
      habit_snapshot: { baseline: b, target: habits, streak_days: streak, user_focus: userFocus },
    };
  }
}

function intSafe(n) {
  const parsed = parseInt(n, 10);
  return isNaN(parsed) ? 0 : parsed;
}
