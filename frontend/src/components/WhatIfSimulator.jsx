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

  // Study hours, study screen, and leisure screen
  const studyHours = whatIfInputs.study_hours ?? 4.0;
  const studyScreen = whatIfInputs.study_screen_hours ?? Math.min(studyHours, 3.5);
  const leisureScreen = whatIfInputs.leisure_screen_hours ?? 2.0;
  const totalScreen = Math.round((studyScreen + leisureScreen) * 10) / 10;

  // Monthly allowance (default 1500, min 1000, max 3500)
  const monthlyAllowance = whatIfInputs.monthly_allowance ?? whatIfInputs.monthly_income ?? 1500;
  const dailySpend = Math.round(monthlyAllowance / 30);

  // Handlers for sliders
  const handleStudyScreenChange = (val) => {
    onChangeSlider('study_screen_hours', val);
    onChangeSlider('screen_time_hours', Math.round((val + leisureScreen) * 10) / 10);
  };

  const handleLeisureScreenChange = (val) => {
    onChangeSlider('leisure_screen_hours', val);
    onChangeSlider('screen_time_hours', Math.round((studyScreen + val) * 10) / 10);
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
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Interactive &ldquo;What-If&rdquo; Simulator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tweak your study hours, screen time split, and allowance to simulate your future twin
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
                  (Aim for 7.5 – 8.5 hrs for sharp memory)
                </span>
              </div>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-lg">
                {whatIfInputs.sleep_hours} hrs
              </span>
            </div>
            <input
              type="range"
              min="4"
              max="10"
              step="0.5"
              value={whatIfInputs.sleep_hours}
              onChange={(e) => onChangeSlider('sleep_hours', parseFloat(e.target.value))}
              className="habit-slider w-full bg-slate-200 dark:bg-slate-700"
            />
          </div>

          {/* 2. Study Hours (Renamed from Focused Study) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
              <div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Study Hours
                </span>
                <span className="text-xs text-slate-400 ml-2 hidden sm:inline">
                  (Daily coursework, assignments &amp; study)
                </span>
              </div>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-lg">
                {studyHours} hrs
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="14"
              step="0.5"
              value={studyHours}
              onChange={(e) => onChangeSlider('study_hours', parseFloat(e.target.value))}
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
                Total: {totalScreen} hrs/day
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
                    (Laptop, coding, docs, online lectures)
                  </span>
                </div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                  {studyScreen} hrs
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="14"
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
                    (Phone, Instagram, reels, OTT &amp; gaming)
                  </span>
                </div>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md">
                  {leisureScreen} hrs
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
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
                  (Walking, sports, workouts, gym)
                </span>
              </div>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-lg">
                {Math.round(whatIfInputs.physical_activity_minutes)} mins
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="180"
              step="5"
              value={whatIfInputs.physical_activity_minutes}
              onChange={(e) => onChangeSlider('physical_activity_minutes', parseFloat(e.target.value))}
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
