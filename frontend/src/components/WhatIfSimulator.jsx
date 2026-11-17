import React from 'react';
import {
  Sliders,
  RotateCcw,
  Sparkles,
  GraduationCap,
  HeartPulse,
  Wallet,
} from 'lucide-react';
import FutureTwinAvatar from './FutureTwinAvatar';

const SLIDERS = [
  {
    key: 'sleep_hours',
    label: 'Nightly Sleep',
    unit: 'hrs',
    min: 4,
    max: 10,
    step: 0.5,
    hint: 'Aim for 7.5 – 8.5 hrs to feel sharp',
  },
  {
    key: 'study_hours',
    label: 'Focused Study',
    unit: 'hrs',
    min: 0.5,
    max: 14,
    step: 0.5,
    hint: 'Deep learning, lectures & coursework',
  },
  {
    key: 'screen_time_hours',
    label: 'Total Screen Time',
    unit: 'hrs',
    min: 1.0,
    max: 18,
    step: 0.5,
    hint: 'Includes study laptop + phone leisure',
  },
  {
    key: 'physical_activity_minutes',
    label: 'Daily Movement / Exercise',
    unit: 'mins',
    min: 0,
    max: 180,
    step: 5,
    hint: 'Walking, sports, workouts, gym',
  },
  {
    key: 'daily_spending',
    label: 'Average Daily Spending',
    unit: '₹',
    prefix: '₹',
    min: 50,
    max: 1500,
    step: 25,
    hint: 'Food, chai/coffee, outings, shopping',
  },
];

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

  // Keep total screen time >= study hours automatically
  const handleSliderChangeInternal = (key, val) => {
    if (key === 'study_hours') {
      onChangeSlider('study_hours', val);
      if (val > whatIfInputs.screen_time_hours) {
        onChangeSlider('screen_time_hours', Math.round((val + 1.0) * 10) / 10);
      }
    } else if (key === 'screen_time_hours') {
      const clampedVal = Math.max(whatIfInputs.study_hours, val);
      onChangeSlider('screen_time_hours', clampedVal);
    } else {
      onChangeSlider(key, val);
    }
  };

  const leisureHours = Math.max(
    0,
    Math.round((whatIfInputs.screen_time_hours - whatIfInputs.study_hours) * 10) / 10
  );

  return (
    <section className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-violet-50 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Interactive &ldquo;What-If&rdquo; Simulator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tweak your daily routine variables to see how habits shape your CGPA, health, and finances
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
        {/* Left: 5 Clean Habit Sliders */}
        <div className="lg:col-span-7 space-y-5">
          {SLIDERS.map((slider) => {
            const val = whatIfInputs[slider.key];
            const isScreen = slider.key === 'screen_time_hours';
            const minAllowed = isScreen ? whatIfInputs.study_hours : slider.min;

            return (
              <div key={slider.key} className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {slider.label}
                    </span>
                    <span className="text-xs text-slate-400 ml-2 hidden sm:inline">
                      ({slider.hint})
                    </span>
                  </div>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-lg">
                    {slider.prefix || ''}{val}{!slider.prefix ? ` ${slider.unit}` : '/day'}
                  </span>
                </div>

                <input
                  type="range"
                  min={minAllowed}
                  max={slider.max}
                  step={slider.step}
                  value={val}
                  onChange={(e) => handleSliderChangeInternal(slider.key, parseFloat(e.target.value))}
                  className="habit-slider w-full bg-slate-200 dark:bg-slate-700"
                />

                {/* Helpful Screen Time breakdown tag */}
                {isScreen && (
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-0.5">
                    <span>
                      Study Laptop: <strong>{whatIfInputs.study_hours}h</strong> • Phone Leisure:{' '}
                      <strong>{leisureHours}h</strong>
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓ Includes study hours
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Live Future Twin Preview */}
        <div className="lg:col-span-5 rounded-3xl p-6 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Live Preview of Your What-If Twin
          </span>

          {customAvatar ? (
            <>
              <FutureTwinAvatar avatarState={customAvatar} />

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
                    <div className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
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
