import React from 'react';
import { Mail, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

const TONES = [
  { id: 'motivational', label: 'Inspiring' },
  { id: 'honest', label: 'Honest Check-in' },
  { id: 'gentle', label: 'Warm & Gentle' },
];

export default function FutureLetter({
  letter,
  loadingLetter,
  scenario,
  setScenario,
  tone,
  setTone,
  userName,
  setUserName,
  horizon,
  onRegenerate,
}) {
  const horizonText = horizon === '5_years' ? '5 years from now' : '6 months from now';

  return (
    <section className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-amber-50/70 via-white to-indigo-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 border border-amber-200/60 dark:border-slate-800 shadow-sm">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              A Letter From You, {horizonText}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Reflections written from the perspective of your future twin based on your real data
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Name Field */}
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Your first name"
            aria-label="Your first name"
            className="w-32 px-3 py-1.5 text-xs font-medium rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          {/* Scenario Toggle */}
          <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setScenario('improved')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                scenario === 'improved'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Healthier You
            </button>
            <button
              onClick={() => setScenario('current')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                scenario === 'current'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Current Path You
            </button>
          </div>

          {/* Tone Selector */}
          <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {TONES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTone(t.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  tone === t.id
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Regenerate */}
          <button
            onClick={onRegenerate}
            disabled={loadingLetter}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingLetter ? 'animate-spin' : ''}`} />
            {loadingLetter ? 'Writing...' : 'Regenerate'}
          </button>
        </div>
      </div>

      {/* Letter Paper Body */}
      {loadingLetter && !letter ? (
        <div className="py-12 text-center text-sm text-slate-500 animate-pulse">
          Your future self is putting pen to paper...
        </div>
      ) : letter ? (
        <div className="space-y-6">
          <div className="rounded-2xl p-6 sm:p-8 bg-white/95 dark:bg-slate-950/70 border border-amber-100 dark:border-slate-800 shadow-inner">
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-slate-900 dark:text-amber-50">
                {letter.title}
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-[11px] font-medium text-indigo-600 dark:text-indigo-300 shrink-0">
                <Sparkles className="w-3 h-3" />
                Future Twin AI
              </span>
            </div>

            <div className="font-serif text-base leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-line">
              {letter.letter_content}
            </div>
          </div>

          {/* 3 Simple Actionable Steps */}
          {letter.suggestions?.length > 0 && (
            <div className="rounded-2xl p-5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/50">
              <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                3 Small Steps You Can Start This Week
              </h4>
              <ul className="space-y-2">
                {letter.suggestions.map((step, i) => (
                  <li
                    key={i}
                    className="text-sm text-emerald-950 dark:text-emerald-100 bg-white/80 dark:bg-slate-900/60 px-4 py-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40"
                  >
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="py-10 text-center text-sm text-slate-500">
          Click Regenerate to read a personalized letter from your future self.
        </div>
      )}
    </section>
  );
}
