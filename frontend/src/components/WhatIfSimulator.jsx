import React from 'react';
import {
  Sliders,
  RotateCcw,
  Sparkles,
  GraduationCap,
  HeartPulse,
  Wallet,
  Monitor,
  Smartphone,
  BookOpen,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Moon,
  Activity,
  Coffee,
} from 'lucide-react';
import FutureTwinAvatar from './FutureTwinAvatar';
import { getCgpaColorClass } from '../utils/cgpaColors';

export default function WhatIfSimulator({
  whatIfInputs,
  onChangeSlider,
  onReset,
  onApplyHealthyPreset,
  customScenario,
  horizon,
}) {
  const customMetrics = customScenario?.metrics;
  const customAvatar = customScenario?.avatar;

  // Active lifestyle time components (strictly bound to a 24-hour day)
  const sleepHours = whatIfInputs.sleep_hours ?? 7.5;
  const studyHours = whatIfInputs.study_hours ?? 4.0;
  const studyScreen = whatIfInputs.study_screen_hours ?? Math.min(studyHours, 3.5);
  const leisureScreen = whatIfInputs.leisure_screen_hours ?? 2.0;
  const totalScreen = Math.round((studyScreen + leisureScreen) * 10) / 10;
  const activityMins = whatIfInputs.physical_activity_minutes ?? 45;
  const activityHours = Math.round((activityMins / 60) * 10) / 10;

  // Monthly allowance (default 1500, min 1000, max 3500)
  const monthlyAllowance = whatIfInputs.monthly_allowance ?? whatIfInputs.monthly_income ?? 1500;
  const dailySpend = Math.round(monthlyAllowance / 30);

  // Total committed scheduled time (capped at exactly 24.0 hours)
  const totalCommittedHours = Math.min(
    24.0,
    Math.round((sleepHours + studyHours + leisureScreen + activityHours) * 10) / 10
  );
  const freeHours = Math.max(0, Math.round((24.0 - totalCommittedHours) * 10) / 10);

  // Dynamic maximums for each slider within current 24-hour physical day boundary
  const maxSleep = Math.max(4.0, Math.min(12.0, Math.floor((24.0 - (studyHours + leisureScreen + activityHours)) * 2) / 2));
  const maxStudy = Math.max(0.5, Math.min(16.0, Math.floor((24.0 - (sleepHours + leisureScreen + activityHours)) * 2) / 2));
  const maxStudyScreen = studyHours;
  const maxLeisure = Math.max(0.0, Math.min(12.0, Math.floor((24.0 - (sleepHours + studyHours + activityHours)) * 2) / 2));
  const maxExerciseHours = Math.max(0, 24.0 - (sleepHours + studyHours + leisureScreen));
  const maxActivityMins = Math.max(0, Math.min(180, Math.floor(maxExerciseHours * 60)));

  // Bounded Handlers for sliders
  const handleSleepChange = (val) => {
    const clamped = Math.min(val, maxSleep);
    onChangeSlider('sleep_hours', clamped);
  };

  const handleStudyChange = (val) => {
    const clamped = Math.min(val, maxStudy);
    onChangeSlider('study_hours', clamped);
  };

  const handleStudyScreenChange = (val) => {
    const clamped = Math.min(val, maxStudyScreen);
    onChangeSlider('study_screen_hours', clamped);
    onChangeSlider('screen_time_hours', Math.round((clamped + leisureScreen) * 10) / 10);
  };

  const handleLeisureScreenChange = (val) => {
    const clamped = Math.min(val, maxLeisure);
    onChangeSlider('leisure_screen_hours', clamped);
    onChangeSlider('screen_time_hours', Math.round((studyScreen + clamped) * 10) / 10);
  };

  const handleActivityChange = (val) => {
    const clamped = Math.min(val, maxActivityMins);
    onChangeSlider('physical_activity_minutes', clamped);
  };

  const handleAllowanceChange = (val) => {
    onChangeSlider('monthly_allowance', val);
    onChangeSlider('monthly_income', val);
    onChangeSlider('daily_spending', Math.round(val / 30));
  };

  return (
    <section className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Interactive &ldquo;What-If&rdquo; Simulator
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                24h Day Enforced ⏰
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Simulate your schedule within the physical 24-hour day. Adjust habits to project your future twin.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to My Average
          </button>
          <button
            onClick={onApplyHealthyPreset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Try Balanced Routine
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 24-Hour Day Time Budget Meter & Visual Breakdown                  */}
      {/* ================================================================= */}
      <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-blue-500/5 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-blue-950/30 border border-indigo-200/80 dark:border-indigo-800/60 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  24-Hour Daily Time Budget
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    freeHours <= 0.5
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {freeHours <= 0.5 ? '⏳ 100% Scheduled' : `✓ ${freeHours}h Free Time`}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A physical day has exactly 24 hours. Sliders automatically balance to never exceed 24 hours.
              </p>
            </div>
          </div>

          {/* Big Number Gauge */}
          <div className="flex items-baseline gap-1 text-right sm:text-right shrink-0">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {totalCommittedHours}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 24.0 hrs</span>
          </div>
        </div>

        {/* Multi-Segment 24-Hour Visual Bar */}
        <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex shadow-inner">
          {/* Sleep */}
          <div
            style={{ width: `${(sleepHours / 24) * 100}%` }}
            className="h-full bg-indigo-500 transition-all duration-300"
            title={`Sleep: ${sleepHours} hrs`}
          />
          {/* Study */}
          <div
            style={{ width: `${(studyHours / 24) * 100}%` }}
            className="h-full bg-blue-500 transition-all duration-300"
            title={`Study: ${studyHours} hrs`}
          />
          {/* Leisure Screen */}
          <div
            style={{ width: `${(leisureScreen / 24) * 100}%` }}
            className="h-full bg-purple-500 transition-all duration-300"
            title={`Leisure Screen: ${leisureScreen} hrs`}
          />
          {/* Exercise */}
          <div
            style={{ width: `${(activityHours / 24) * 100}%` }}
            className="h-full bg-emerald-500 transition-all duration-300"
            title={`Exercise: ${activityMins} mins (${activityHours} hrs)`}
          />
          {/* Free / Buffer Time */}
          {freeHours > 0 && (
            <div
              style={{ width: `${(freeHours / 24) * 100}%` }}
              className="h-full bg-slate-300 dark:bg-slate-600 transition-all duration-300"
              title={`Free / Routine Time: ${freeHours} hrs (Meals, commute, downtime)`}
            />
          )}
        </div>

        {/* Segment Legend with Live Percentages */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1">
          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
            <span>Sleep: {sleepHours}h ({Math.round((sleepHours / 24) * 100)}%)</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            <span>Study: {studyHours}h ({Math.round((studyHours / 24) * 100)}%)</span>
          </div>
          <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
            <span>Phone/OTT: {leisureScreen}h ({Math.round((leisureScreen / 24) * 100)}%)</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Workout: {activityMins}m ({Math.round((activityHours / 24) * 100)}%)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500 inline-block" />
            <span>Free/Rest: {freeHours}h ({Math.round((freeHours / 24) * 100)}%)</span>
          </div>
        </div>

        {/* Helpful alert when near or at 24 hours */}
        {freeHours <= 0.5 && (
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300/80 dark:border-amber-800 text-[11px] font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Your 24-hour day is at maximum capacity ({totalCommittedHours}h/24h). To increase study or workout time, reduce sleep or phone time first!
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Habit Sliders */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Nightly Sleep */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
              <div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Nightly Sleep
                </span>
                <span className="text-xs text-slate-400 ml-2 hidden sm:inline">
                  (Max available: {maxSleep}h in current 24h budget)
                </span>
              </div>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-lg">
                {sleepHours} hrs
              </span>
            </div>
            <input
              type="range"
              min="4"
              max={maxSleep}
              step="0.5"
              value={sleepHours}
              onChange={(e) => handleSleepChange(parseFloat(e.target.value))}
              className="habit-slider w-full bg-slate-200 dark:bg-slate-700"
            />
          </div>

          {/* 2. Study Hours */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
              <div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Study Hours
                </span>
                <span className="text-xs text-slate-400 ml-2 hidden sm:inline">
                  (Max available: {maxStudy}h in current 24h budget)
                </span>
              </div>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-lg">
                {studyHours} hrs
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max={maxStudy}
              step="0.5"
              value={studyHours}
              onChange={(e) => handleStudyChange(parseFloat(e.target.value))}
              className="habit-slider w-full bg-slate-200 dark:bg-slate-700"
            />
          </div>

          {/* 3 & 4. Screen Time Broken into Two Parts: Study Screen Time & Leisure Screen Time */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Screen Time Split
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                Total Screen: {totalScreen} hrs/day
              </span>
            </div>

            {/* Part A: Study Screen Time */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline">
                <div className="flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Study Screen Time
                  </span>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    (Laptop, coding, docs, lectures — capped at total study hours)
                  </span>
                </div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                  {studyScreen} hrs
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={maxStudyScreen}
                step="0.5"
                value={studyScreen}
                onChange={(e) => handleStudyScreenChange(parseFloat(e.target.value))}
                className="habit-slider w-full bg-slate-200 dark:bg-slate-700"
              />
            </div>

            {/* Part B: Leisure Screen Time */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-purple-500" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Leisure Screen Time
                  </span>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    (Phone, reels, gaming, OTT — max available: {maxLeisure}h)
                  </span>
                </div>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md">
                  {leisureScreen} hrs
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={maxLeisure}
                step="0.5"
                value={leisureScreen}
                onChange={(e) => handleLeisureScreenChange(parseFloat(e.target.value))}
                className="habit-slider w-full bg-slate-200 dark:bg-slate-700"
              />
            </div>

            {/* Dual Visual Ratio Bar */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                <span>Productive Screen: <strong>{studyScreen}h</strong></span>
                <span>Phone / Leisure: <strong>{leisureScreen}h</strong></span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${totalScreen > 0 ? (studyScreen / totalScreen) * 100 : 50}%` }}
                  title={`Study Screen: ${studyScreen}h`}
                />
                <div
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${totalScreen > 0 ? (leisureScreen / totalScreen) * 100 : 50}%` }}
                  title={`Leisure Screen: ${leisureScreen}h`}
                />
              </div>
            </div>
          </div>

          {/* 5. Daily Movement / Exercise */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
              <div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Daily Movement / Exercise
                </span>
                <span className="text-xs text-slate-400 ml-2 hidden sm:inline">
                  (Walking, sports, workouts — max available: {maxActivityMins}m)
                </span>
              </div>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-lg">
                {Math.round(activityMins)} mins
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={maxActivityMins}
              step="5"
              value={activityMins}
              onChange={(e) => handleActivityChange(parseFloat(e.target.value))}
              className="habit-slider w-full bg-slate-200 dark:bg-slate-700"
            />
          </div>

          {/* 6. Monthly Allowance (min ₹1000, max ₹3500, default ₹1500) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
              <div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Monthly Allowance
                </span>
                <span className="text-xs text-slate-400 ml-2 hidden sm:inline">
                  (~₹{dailySpend}/day pocket budget)
                </span>
              </div>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-lg">
                ₹{monthlyAllowance.toLocaleString('en-IN')}/mo
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="3500"
              step="100"
              value={monthlyAllowance}
              onChange={(e) => handleAllowanceChange(parseFloat(e.target.value))}
              className="habit-slider w-full bg-slate-200 dark:bg-slate-700"
            />
            <div className="flex justify-between text-[11px] text-slate-400 px-0.5">
              <span>Min: ₹1,000</span>
              <span>Default: ₹1,500</span>
              <span>Max: ₹3,500</span>
            </div>
          </div>
        </div>

        {/* Right: Live Future Twin Preview with Avatar */}
        <div className="lg:col-span-5 rounded-3xl p-6 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Live Preview of Your What-If Twin
          </span>

          {customAvatar ? (
            <>
              {/* Dynamic SVG Avatar - Now renders reliably */}
              <FutureTwinAvatar avatar={customAvatar} />

              <div className="w-full text-left space-y-1">
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  {customAvatar.headline}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {customAvatar.description}
                </div>
              </div>

              {/* Core 3 Outcome Metric Badges */}
              {customMetrics && (
                <div className="w-full grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
                  <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                      <GraduationCap className="w-3 h-3 text-indigo-500" />
                      <span>CGPA</span>
                    </div>
                    <div className={`text-base font-bold mt-0.5 ${getCgpaColorClass(customMetrics.academic_gpa)}`}>
                      {customMetrics.academic_gpa.toFixed(2)}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                      <HeartPulse className="w-3 h-3 text-rose-500" />
                      <span>Health</span>
                    </div>
                    <div className="text-base font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                      {Math.round(customMetrics.health_index)}/100
                    </div>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                      <Wallet className="w-3 h-3 text-emerald-500" />
                      <span>Savings</span>
                    </div>
                    <div
                      className={`text-base font-bold mt-0.5 ${
                        customMetrics.projected_savings >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {customMetrics.projected_savings < 0 ? '-' : ''}₹
                      {Math.abs(Math.round(customMetrics.projected_savings)).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-sm text-slate-400">
              Adjust any slider to preview your What-If twin!
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
