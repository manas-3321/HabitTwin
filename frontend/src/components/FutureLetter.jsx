import React, { useState } from 'react';
import {
  Mail,
  RefreshCw,
  Share2,
  Copy,
  Check,
  Quote,
  CheckCircle2,
  Award,
  Sparkles,
} from 'lucide-react';

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
  horizon,
  onRegenerate,
  onOpenShare,
}) {
  const [copied, setCopied] = useState(false);

  const isFiveYears = horizon === '5_years';
  const horizonText = isFiveYears ? '5 Years From Now (2031)' : '6 Months From Now (End of Semester)';

  const handleCopy = async () => {
    if (!letter?.letter_content) return;
    try {
      const fullText = `${letter.title}\n\n${letter.letter_content}\n\nKey Steps:\n${(letter.suggestions || []).join('\n')}`;
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="space-y-5">
      {/* Clean, Decluttered Header: Only Tones & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Letter from Your Future Self
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isFiveYears
              ? 'A dispatch from 2031 reflecting on 5 years of compounding habits'
              : 'A dispatch from finals week (+180 days) reflecting on this semester'}
          </p>
        </div>

        {/* Controls: Scenario, Tone Selector & Regenerate */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Scenario Toggle */}
          {setScenario && (
            <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setScenario('improved')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  scenario === 'improved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🌱 Healthier Path
              </button>
              <button
                type="button"
                onClick={() => setScenario('current')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  scenario === 'current'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                ⚡ Current Path
              </button>
            </div>
          )}

          {/* Tone Selector */}
          <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            {TONES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTone(t.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  tone === t.id
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Regenerate Button */}
          <button
            type="button"
            onClick={onRegenerate}
            disabled={loadingLetter}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingLetter ? 'animate-spin' : ''}`} />
            <span>{loadingLetter ? 'Writing...' : 'Regenerate'}</span>
          </button>
        </div>
      </div>

      {/* Main Letter Body or Loading State */}
      {loadingLetter && !letter ? (
        <div className="py-20 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif italic text-base text-slate-700 dark:text-slate-300">
            Your {horizonText} future self is writing a personalized letter...
          </p>
        </div>
      ) : letter ? (
        <div className="space-y-5">
          {/* Letter Stationery Card */}
          <div
            className={`rounded-3xl p-6 sm:p-10 relative border shadow-sm transition-all ${
              isFiveYears
                ? 'bg-amber-50/40 dark:bg-slate-950/80 border-amber-200/80 dark:border-amber-900/60'
                : 'bg-white dark:bg-slate-950/80 border-slate-200 dark:border-slate-800'
            }`}
          >
            {/* Letterhead */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200/70 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-600 dark:text-indigo-400 block mb-1">
                  {letter.theme_badge || (isFiveYears ? '⏳ Sealed Time Capsule Manifesto // 2031' : '📅 Semester Field Dispatch // +180 Days')}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-semibold text-slate-900 dark:text-amber-50">
                  {letter.title}
                </h3>
              </div>

              {/* Action Buttons: Share & Copy */}
              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                {onOpenShare && (
                  <button
                    type="button"
                    onClick={() => onOpenShare({ cardType: 'letter', letter })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors"
                    title="Share this future self wisdom card"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Letter</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Key Quote Callout */}
            {letter.key_quote && (
              <div
                className={`mb-6 p-4 rounded-2xl flex items-start gap-3 border ${
                  isFiveYears
                    ? 'bg-amber-100/70 dark:bg-amber-950/40 border-amber-300/80 dark:border-amber-800/60 text-amber-950 dark:text-amber-200'
                    : 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200/80 dark:border-indigo-900/50 text-indigo-950 dark:text-indigo-200'
                }`}
              >
                <Quote className="w-5 h-5 shrink-0 opacity-70 mt-0.5" />
                <p className="font-serif italic text-sm sm:text-base leading-snug">
                  "{letter.key_quote}"
                </p>
              </div>
            )}

            {/* Main Letter Content */}
            <div className="font-serif text-base sm:text-lg leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap space-y-4">
              {letter.letter_content}
            </div>
          </div>

          {/* Actionable Suggestions */}
          {letter.suggestions?.length > 0 && (
            <div
              className={`rounded-2xl p-5 border ${
                isFiveYears
                  ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-900/50'
                  : 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/50'
              }`}
            >
              <h4
                className={`text-sm font-bold mb-3 flex items-center gap-2 ${
                  isFiveYears ? 'text-amber-950 dark:text-amber-200' : 'text-emerald-900 dark:text-emerald-200'
                }`}
              >
                {isFiveYears ? (
                  <>
                    <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>3 Five-Year North Star Principles for 2031</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>3 Immediate Tactical Sprints For This Week</span>
                  </>
                )}
              </h4>
              <ul className="space-y-2">
                {letter.suggestions.map((step, i) => (
                  <li
                    key={i}
                    className={`text-sm px-4 py-2.5 rounded-xl border flex items-start gap-2.5 ${
                      isFiveYears
                        ? 'text-amber-950 dark:text-amber-100 bg-white/80 dark:bg-slate-900/60 border-amber-200/60 dark:border-amber-900/40'
                        : 'text-emerald-950 dark:text-emerald-100 bg-white/80 dark:bg-slate-900/60 border-emerald-100 dark:border-emerald-900/40'
                    }`}
                  >
                    <span className="font-bold shrink-0 mt-0.5">
                      {isFiveYears ? '🧭' : '⚡'}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="py-16 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <Mail className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No Future Letter Generated Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click below to generate a personalized letter from your future self based on your daily habits.
          </p>
          <button
            type="button"
            onClick={onRegenerate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Future Letter</span>
          </button>
        </div>
      )}
    </section>
  );
}
