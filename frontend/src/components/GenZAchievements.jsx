import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Flame,
  Award,
  Zap,
  Sparkles,
  CheckCircle2,
  Lock,
  Printer,
  X,
  Share2,
  Heart,
  Crown,
  BookOpen,
  Moon,
  Smartphone,
  Wallet,
} from 'lucide-react';

export default function GenZAchievements({ logs = [], analysis = null, userName = 'Alex' }) {
  const [showCertificate, setShowCertificate] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);

  // Calculate real consecutive streaks from logs
  const { currentStreak, bestStreak, totalDays, sleepCount, studyCount, grassCount, budgetCount } = useMemo(() => {
    if (!logs || logs.length === 0) {
      return {
        currentStreak: 0,
        bestStreak: 0,
        totalDays: 0,
        sleepCount: 0,
        studyCount: 0,
        grassCount: 0,
        budgetCount: 0,
      };
    }

    const sorted = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
    let cur = 0;
    let maxS = 0;
    let tempS = 0;
    let prevDate = null;
    let sleepC = 0;
    let studyC = 0;
    let grassC = 0;
    let budgetC = 0;

    for (const log of sorted) {
      const d = new Date(log.date);
      if (prevDate) {
        const diffDays = Math.round((d - prevDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempS++;
        } else if (diffDays > 1) {
          tempS = 1;
        }
      } else {
        tempS = 1;
      }
      if (tempS > maxS) maxS = tempS;
      prevDate = d;

      if (log.sleep_hours >= 7.0 && log.sleep_hours <= 9.0) sleepC++;
      if (log.study_hours >= 3.5) studyC++;
      const leisureScreen = Math.max(0, (log.screen_time_hours || 0) - (log.study_hours || 0));
      if (leisureScreen <= 2.5) grassC++;
      if (log.total_spending <= 350) budgetC++;
    }

    // Current streak working back from latest day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastLogDate = new Date(sorted[sorted.length - 1].date);
    lastLogDate.setHours(0, 0, 0, 0);
    const dayGap = Math.round((today - lastLogDate) / (1000 * 60 * 60 * 24));

    cur = dayGap <= 1 ? tempS : 0;

    return {
      currentStreak: cur || tempS,
      bestStreak: Math.max(maxS, cur || tempS),
      totalDays: sorted.length,
      sleepCount: sleepC,
      studyCount: studyC,
      grassCount: grassC,
      budgetCount: budgetC,
    };
  }, [logs]);

  // Main 3 Milestones: 15-day badge, 30-day badge, 6-month certificate
  const unlocked15 = bestStreak >= 15;
  const unlocked30 = bestStreak >= 30;
  const unlocked180 = bestStreak >= 180;

  // Print Certificate action
  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="space-y-8 select-none">
      {/* ================================================================= */}
      {/* 1. Gen Z Header Hero                                              */}
      {/* ================================================================= */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-pink-950/30 border border-indigo-200/80 dark:border-indigo-800/60 shadow-sm">
        {/* Glow Spheres */}
        <div className="pointer-events-none absolute -top-12 -right-12 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
              <span>Main Character Energy • Gen Z Trophy Room</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Habit Streaks &amp; Achievements 🏆
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              Build your streak, stop doom-scrolling, and collect certified proof that you&apos;re built different.
              15 days = Badge. 30 days = Beast Mode. 6 Months = Official Certificate of Appreciation. No cap.
            </p>
          </div>

          {/* Quick Streak Card */}
          <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm shrink-0">
            <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-500">
              <Flame className="w-7 h-7 animate-bounce" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Current Streak
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {currentStreak} <span className="text-sm font-semibold text-amber-500">Days W</span>
              </div>
              <div className="text-[10px] text-slate-500">
                Best Era: <strong>{bestStreak} Days</strong> • {totalDays} total check-ins
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. Core 3 Major Milestones (15-Day, 30-Day, 6-Month Certificate) */}
      {/* ================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <span>The Big Three Milestones</span>
          </h3>
          <span className="text-xs text-slate-500">Continuous Progress Milestones</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Milestone 1: 15 Days Badge */}
          <div
            className={`relative rounded-3xl p-6 border transition-all flex flex-col justify-between space-y-4 ${
              unlocked15
                ? 'bg-gradient-to-b from-purple-500/10 to-transparent dark:from-purple-950/40 border-purple-500/40 shadow-lg shadow-purple-500/5 ring-1 ring-purple-500/30'
                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 opacity-90'
            }`}
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                    unlocked15
                      ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  ⚡
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    unlocked15
                      ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {unlocked15 ? '✓ Unlocked' : 'Locked'}
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  15-Day Milestone
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  &ldquo;Locked In&rdquo; Badge
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  15 days of continuous habit progress. You stopped procrastinating, locked in on study &amp; sleep, and officially started your main character arc.
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Progress</span>
                <span className={unlocked15 ? 'text-purple-600 dark:text-purple-400' : 'text-slate-700 dark:text-slate-300'}>
                  {Math.min(15, bestStreak)} / 15 Days
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (bestStreak / 15) * 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 text-right">
                {unlocked15 ? 'Badge active in profile 🔥' : `${Math.max(0, 15 - bestStreak)} more days to claim`}
              </div>
            </div>
          </div>

          {/* Milestone 2: 30 Days Badge */}
          <div
            className={`relative rounded-3xl p-6 border transition-all flex flex-col justify-between space-y-4 ${
              unlocked30
                ? 'bg-gradient-to-b from-amber-500/10 to-transparent dark:from-amber-950/40 border-amber-500/40 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30'
                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 opacity-90'
            }`}
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                    unlocked30
                      ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  🏆
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    unlocked30
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {unlocked30 ? '✓ Unlocked' : 'Locked'}
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  30-Day Milestone
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  &ldquo;Built Different&rdquo; Badge
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  30 consecutive days of habit wins. An entire month on demon mode. Your routine is now self-sustaining, and your semester CGPA trajectory is untouchable.
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Progress</span>
                <span className={unlocked30 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}>
                  {Math.min(30, bestStreak)} / 30 Days
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (bestStreak / 30) * 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 text-right">
                {unlocked30 ? 'Certified Built Different 👑' : `${Math.max(0, 30 - bestStreak)} more days to claim`}
              </div>
            </div>
          </div>

          {/* Milestone 3: 6 Months (180 Days) Certificate */}
          <div
            className={`relative rounded-3xl p-6 border transition-all flex flex-col justify-between space-y-4 ${
              unlocked180
                ? 'bg-gradient-to-b from-emerald-500/10 to-teal-500/5 dark:from-emerald-950/40 border-emerald-500/40 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30'
                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                    unlocked180
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  📜
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    unlocked180
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {unlocked180 ? '✓ Awarded' : 'Grand Reward'}
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  6-Month Grand Honor
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Certificate of Genuine Appreciation
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  The holy grail of student discipline. Awarded to those who show up every day for 6 consecutive months (180 days).
                </p>
              </div>
            </div>

            {/* Action / Progress */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">6-Month Progress</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {Math.min(180, bestStreak)} / 180 Days
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (bestStreak / 180) * 100)}%` }}
                />
              </div>

              {/* View / Preview Certificate Button */}
              <button
                onClick={() => setShowCertificate(true)}
                className="w-full mt-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <Award className="w-4 h-4" />
                <span>{unlocked180 ? 'View & Print Certificate 📜' : 'Preview Certificate 📜'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3. Bonus Gen Z Micro-Badges                                       */}
      {/* ================================================================= */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <span>Gen Z Habit Arc Badges</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {[
            {
              id: 'weapon',
              title: 'Academic Weapon',
              emoji: '📚',
              desc: 'Logged ≥3.5h study',
              unlocked: studyCount >= 5,
              count: `${studyCount} days`,
              color: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/30',
            },
            {
              id: 'sleep',
              title: 'Snooze Denier',
              emoji: '💤',
              desc: '7–9h restorative sleep',
              unlocked: sleepCount >= 5,
              count: `${sleepCount} days`,
              color: 'text-blue-600 bg-blue-500/10 border-blue-500/30',
            },
            {
              id: 'grass',
              title: 'Grass Touched',
              emoji: '🌿',
              desc: 'Leisure screen ≤2.5h',
              unlocked: grassCount >= 5,
              count: `${grassCount} days`,
              color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30',
            },
            {
              id: 'budget',
              title: 'Budget Sigma',
              emoji: '💸',
              desc: 'Spending within allowance',
              unlocked: budgetCount >= 5,
              count: `${budgetCount} days`,
              color: 'text-amber-600 bg-amber-500/10 border-amber-500/30',
            },
          ].map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border transition-all ${
                b.unlocked
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-900/40 border-dashed border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{b.emoji}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    b.unlocked ? b.color : 'text-slate-400 bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  {b.unlocked ? 'Unlocked' : '5 days req'}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">{b.title}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{b.desc}</div>
              <div className="text-[10px] font-semibold text-slate-400 mt-2">Earned: {b.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ================================================================= */}
      {/* 4. Full-Screen / Printable Certificate Modal                      */}
      {/* ================================================================= */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto flex items-center justify-center animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-amber-500/40 overflow-hidden my-8">
            {/* Modal Controls Bar */}
            <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>HabitTwin Digital Certificate</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Certificate</span>
                </button>
                <button
                  onClick={() => setShowCertificate(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Official Certificate Canvas */}
            <div className="p-8 sm:p-12 text-center space-y-6 relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50/50 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20">
              {/* Ornate Gold Border Line */}
              <div className="pointer-events-none absolute inset-4 border-2 border-amber-500/40 rounded-2xl" />
              <div className="pointer-events-none absolute inset-5 border border-dashed border-amber-500/25 rounded-xl" />

              {/* Seal Stamp */}
              <div className="relative z-10 mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-amber-500">
                  <Award className="w-8 h-8" />
                  <span className="text-[7px] font-black tracking-tighter uppercase mt-0.5">
                    Official Seal
                  </span>
                </div>
              </div>

              {/* Certificate Headings */}
              <div className="relative z-10 space-y-1">
                <div className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-amber-600 dark:text-amber-400">
                  HabitTwin Digital Future Protocol
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-amber-100 tracking-wide uppercase">
                  Certificate of Genuine Appreciation
                </h2>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-serif italic">
                  Presented in recognition of supreme student resilience &amp; unbroken discipline
                </div>
              </div>

              {/* Recipient */}
              <div className="relative z-10 space-y-2 py-2">
                <div className="text-xs text-slate-400 uppercase tracking-wider">Proudly Awarded To</div>
                <div className="text-2xl sm:text-3xl font-serif font-black text-indigo-600 dark:text-indigo-400 underline decoration-amber-400/80 decoration-2 underline-offset-8">
                  {userName || 'Campus Legend'}
                </div>
              </div>

              {/* Citation */}
              <div className="relative z-10 max-w-lg mx-auto text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif italic">
                &ldquo;For demonstrating extraordinary grit, successfully transcending late-night doom-scrolling,
                mastering restorative prefrontal sleep, and maintaining unbroken student progress for an entire
                six consecutive months (180 days). You didn&apos;t just prepare for exams—you conquered your habits.
                100% Certified Built Different.&rdquo;
              </div>

              {/* Signatures & Seal */}
              <div className="relative z-10 pt-6 border-t border-amber-500/30 grid grid-cols-2 gap-6 max-w-md mx-auto text-left text-xs">
                <div>
                  <div className="font-serif italic text-sm text-slate-800 dark:text-slate-200 border-b border-slate-300 dark:border-slate-700 pb-1">
                    Your Future Self (2025)
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
                    Digital Twin Protocol
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-serif italic text-sm text-slate-800 dark:text-slate-200 border-b border-slate-300 dark:border-slate-700 pb-1">
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="text-[10px] text-amber-500 mt-1 uppercase tracking-wider font-bold">
                    ✓ Verified No Cap
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
