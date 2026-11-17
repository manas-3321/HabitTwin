import React from 'react';
import { Sparkles, Sun, Moon, Clock, Database, Trash2 } from 'lucide-react';

export default function Header({
  horizon,
  setHorizon,
  darkMode,
  setDarkMode,
  onLoadSample,
  loadingSample,
  hasLogs = false,
  onResetZero = null,
  loadingReset = false,
}) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
              HabitTwin
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              See how today&apos;s routine shapes tomorrow&apos;s you
            </p>
          </div>
        </div>

        {/* Center / Right Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Horizon Toggle */}
          <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1.5 hidden sm:block" />
            <button
              onClick={() => setHorizon('6_months')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                horizon === '6_months'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              6 Months Ahead
            </button>
            <button
              onClick={() => setHorizon('5_years')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                horizon === '5_years'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              5 Years Ahead
            </button>
          </div>

          {/* Load Sample Data Button */}
          <button
            onClick={onLoadSample}
            disabled={loadingSample || loadingReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 transition-colors disabled:opacity-60"
            title="Populate sample days to preview immediately"
          >
            <Database className="w-3.5 h-3.5" />
            {loadingSample ? 'Loading...' : 'Load Sample Routine'}
          </button>

          {/* Delete Loaded Check-Ins & Reset to Zero Button */}
          {hasLogs && onResetZero && (
            <button
              onClick={onResetZero}
              disabled={loadingReset || loadingSample}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/70 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60 transition-colors disabled:opacity-60"
              title="Delete all check-in logs and reset to zero"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              {loadingReset ? 'Resetting...' : 'Reset to Zero'}
            </button>
          )}

          {/* Dark / Light Mode */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle theme"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
