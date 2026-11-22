import React, { useState } from 'react';
import {
  Sparkles,
  Sun,
  Moon,
  Clock,
  Database,
  Trash2,
  Share2,
  User,
  LogOut,
  Mail,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';

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
  onOpenShare = null,
  currentUser = null,
  onOpenAuth = null,
  onLogout = null,
  certStatus = null,
}) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

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

          {/* Share Progress Button */}
          {onOpenShare && (
            <button
              onClick={onOpenShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 transition-colors shadow-sm"
              title="Share your Future Twin card and progress with friends"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Progress</span>
            </button>
          )}

          {/* User Account Button / Pill */}
          {currentUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserDropdown((p) => !p)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 text-xs font-bold transition-all hover:bg-indigo-100"
              >
                <div className="w-5 h-5 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                </div>
                <span>{currentUser.name}</span>
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/15 text-cyan-700 dark:text-cyan-300" title="Active Streak Freezes">
                  🧊 {currentUser.streak_freezes_available ?? 2}
                </span>
                {certStatus?.cert_6m_sent && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" title="6-Month Certificate Emailed" />
                )}
                <ChevronDown className="w-3 h-3 text-indigo-400" />
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-50 text-xs space-y-2.5 animate-fadeIn">
                  <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="font-bold text-slate-900 dark:text-white truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{currentUser.email}</span>
                    </div>
                  </div>

                  {/* Streak Freeze & Certificate Status inside menu */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">Streak Freezes:</span>
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">
                        🧊 {currentUser.streak_freezes_available ?? 2} / 3 Active
                      </span>
                    </div>
                    <div>
                      <div className="text-slate-500 font-semibold">6-Month Certificate:</div>
                      {certStatus?.cert_6m_sent ? (
                        <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Emailed to inbox</span>
                        </div>
                      ) : (
                        <div className="text-slate-600 dark:text-slate-400 mt-0.5">
                          Auto-emails on 180-day streak
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserDropdown(false);
                      onLogout?.();
                    }}
                    className="w-full py-2 px-3 rounded-xl text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 text-left font-bold flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuth && onOpenAuth('signin')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In / Join</span>
            </button>
          )}

          {/* Load Sample Data Button */}
          <button
            onClick={onLoadSample}
            disabled={loadingSample || loadingReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-60"
            title="Populate sample days to preview immediately"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{loadingSample ? 'Loading...' : 'Sample Routine'}</span>
          </button>

          {/* Delete Loaded Check-Ins & Reset to Zero Button */}
          {hasLogs && onResetZero && (
            <button
              onClick={onResetZero}
              disabled={loadingReset || loadingSample}
              className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/70 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60 transition-colors disabled:opacity-60"
              title="Delete all check-in logs and reset to zero"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
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

