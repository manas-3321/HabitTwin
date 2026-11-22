import React, { useState } from 'react';
import {
  Mail,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  Calendar,
  Hourglass,
  Quote,
  ShieldAlert,
  Zap,
  Award,
  GraduationCap,
  HeartPulse,
  Wallet,
  Scale,
  Sliders,
  Database,
  Moon,
  BookOpen,
  Smartphone,
  Activity,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Flame,
  User,
  SlidersHorizontal,
} from 'lucide-react';

const TONES = [
  { id: 'motivational', label: 'Inspiring' },
  { id: 'honest', label: 'Honest' },
  { id: 'gentle', label: 'Gentle' },
];

const FOCUS_AREAS = [
  { id: 'academics', label: 'Academic CGPA', icon: GraduationCap },
  { id: 'health', label: 'Energy & Health', icon: HeartPulse },
  { id: 'wealth', label: 'Wealth & Savings', icon: Wallet },
  { id: 'balanced', label: 'Balanced Life', icon: Scale },
];

export default function FutureLetter({
  letter,
  loadingLetter,
  scenario,
  setScenario,
  tone,
  setTone,
  userFocus = 'balanced',
  setUserFocus,
  habitSource = 'logs',
  setHabitSource,
  userName = 'Alex',
  setUserName,
  horizon,
  onRegenerate,
  onOpenShare,
  whatIfInputs = {},
  onChangeSlider,
  logs = [],
}) {
  const [copied, setCopied] = useState(false);
  // Default to collapsed so the letter is the hero of the page
  const [showHabitTuner, setShowHabitTuner] = useState(false);

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

  const snap = letter?.habit_snapshot;
  const baseline = snap?.baseline || {
    sleep_hours: 6.2,
    study_hours: 2.2,
    screen_time_hours: 6.5,
    physical_activity_minutes: 20,
    daily_spending: 380,
  };
  const target = snap?.target || {
    sleep_hours: whatIfInputs.sleep_hours || 7.5,
    study_hours: whatIfInputs.study_hours || 4.0,
    screen_time_hours: whatIfInputs.screen_time_hours || 4.0,
    physical_activity_minutes: whatIfInputs.physical_activity_minutes || 35,
    daily_spending: whatIfInputs.daily_spending || 120,
  };
  const streak = snap?.streak_days || logs.length || 0;
  const latestLogNote = logs.length > 0 && logs[0].notes ? logs[0].notes : null;

  // 1-Tap Preset Archetype Handlers
  const applyPreset = (preset) => {
    if (!onChangeSlider) return;
    if (setHabitSource) setHabitSource('whatif');

    if (preset === 'crammer') {
      onChangeSlider('sleep_hours', 4.5);
      onChangeSlider('study_hours', 2.0);
      onChangeSlider('study_screen_hours', 2.0);
      onChangeSlider('leisure_screen_hours', 6.5);
      onChangeSlider('screen_time_hours', 8.5);
      onChangeSlider('physical_activity_minutes', 15);
      onChangeSlider('daily_spending', 450);
    } else if (preset === 'deans_list') {
      onChangeSlider('sleep_hours', 7.8);
      onChangeSlider('study_hours', 5.0);
      onChangeSlider('study_screen_hours', 3.0);
      onChangeSlider('leisure_screen_hours', 0.8);
      onChangeSlider('screen_time_hours', 3.8);
      onChangeSlider('physical_activity_minutes', 40);
      onChangeSlider('daily_spending', 120);
    } else if (preset === 'athlete') {
      onChangeSlider('sleep_hours', 8.5);
      onChangeSlider('study_hours', 3.5);
      onChangeSlider('study_screen_hours', 2.0);
      onChangeSlider('leisure_screen_hours', 0.5);
      onChangeSlider('screen_time_hours', 2.5);
      onChangeSlider('physical_activity_minutes', 60);
      onChangeSlider('daily_spending', 100);
    } else if (preset === 'reset') {
      if (baseline) {
        onChangeSlider('sleep_hours', baseline.sleep_hours);
        onChangeSlider('study_hours', baseline.study_hours);
        onChangeSlider('screen_time_hours', baseline.screen_time_hours);
        onChangeSlider('physical_activity_minutes', Math.round(baseline.physical_activity_minutes));
        onChangeSlider('daily_spending', Math.round(baseline.daily_spending));
      }
    }
    if (onRegenerate) setTimeout(onRegenerate, 50);
  };

  const handleHabitChange = (key, val) => {
    if (setHabitSource && habitSource !== 'whatif') {
      setHabitSource('whatif');
    }
    if (onChangeSlider) {
      onChangeSlider(key, val);
    }
  };

  // Safe metrics for visual cards
  const sleepDelta = Math.round((target.sleep_hours - baseline.sleep_hours) * 10) / 10;
  const studyDelta = Math.round((target.study_hours - baseline.study_hours) * 10) / 10;
  const screenDelta = Math.round((target.screen_time_hours - baseline.screen_time_hours) * 10) / 10;
  const spendDelta = Math.round(target.daily_spending - baseline.daily_spending);

  return (
    <section className="space-y-4">
      {/* Sleek Top Header & Streamlined Controls Toolbar */}
      <div
        className={`rounded-2xl p-4 sm:p-5 border transition-all duration-300 ${
          isFiveYears
            ? 'bg-gradient-to-r from-amber-500/10 via-amber-50/40 to-indigo-950/10 dark:from-slate-900 dark:via-amber-950/20 dark:to-slate-900 border-amber-300/60 dark:border-amber-800/40'
            : 'bg-gradient-to-r from-indigo-50/80 via-white to-sky-50/40 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 border-indigo-200/70 dark:border-slate-800'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Identity & Horizon */}
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                isFiveYears
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 ring-1 ring-amber-400/40'
                  : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-400/30'
              }`}
            >
              {isFiveYears ? <Hourglass className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {isFiveYears ? 'Sealed Time Capsule (2031)' : 'Tactical Semester Dispatch'}
                </h2>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    isFiveYears
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300/60'
                      : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200 border border-indigo-300/60'
                  }`}
                >
                  {isFiveYears ? '5-Year Horizon' : '6-Month Horizon'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isFiveYears
                  ? 'A panoramic retrospective from 2031 reflecting on 1,825 days of compounding habits.'
                  : 'A targeted check-in reflecting on how this semester’s habits shape your recall, GPA, and energy.'}
              </p>
            </div>
          </div>

          {/* Unified Controls Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Recipient Name Input */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-medium text-slate-400">To:</span>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName && setUserName(e.target.value)}
                placeholder="Your name"
                aria-label="Recipient name"
                className="w-20 sm:w-24 text-xs font-semibold bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none"
              />
            </div>

            {/* Scenario Switcher */}
            <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setScenario('improved')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  scenario === 'improved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🌱 Healthier
              </button>
              <button
                type="button"
                onClick={() => setScenario('current')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  scenario === 'current'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                ⚡ Current Path
              </button>
            </div>

            {/* Tone Selector */}
            <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id)}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLetter ? 'animate-spin' : ''}`} />
              <span>{loadingLetter ? 'Writing...' : 'Regenerate'}</span>
            </button>

            {/* Share Button */}
            {onOpenShare && (
              <button
                type="button"
                onClick={() => onOpenShare({ cardType: 'letter', letter })}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs transition-colors"
                title="Share this future self wisdom card"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Share</span>
              </button>
            )}

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs transition-colors"
              title="Copy letter text to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Streamlined Blueprint Status & Collapsible Fine-Tuning Drawer */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xs overflow-hidden transition-all shadow-2xs">
        <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-2.5">
          {/* Quick Informative Chips (decluttered overview) */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium text-[11px]">Personalized with:</span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px] border border-indigo-200/50 dark:border-indigo-800/40">
              Focus: {FOCUS_AREAS.find((f) => f.id === userFocus)?.label || 'Balanced'}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-[11px] border border-slate-200 dark:border-slate-700">
              Source: {habitSource === 'whatif' ? 'What-If Lab' : 'My Logs'}
            </span>
            {streak > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-semibold text-[11px] border border-amber-200/50 dark:border-amber-800/40">
                ⚡ {streak}-day streak
              </span>
            )}
            {latestLogNote && (
              <span
                className="hidden md:inline px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px] truncate max-w-xs"
                title={latestLogNote}
              >
                📝 Includes your latest note
              </span>
            )}
          </div>

          {/* Collapsible Trigger Button */}
          <button
            type="button"
            onClick={() => setShowHabitTuner(!showHabitTuner)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ml-auto"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
            <span>{showHabitTuner ? 'Hide Blueprint Tuner' : 'Fine-Tune Blueprint'}</span>
            {showHabitTuner ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Collapsible Blueprint Customization Drawer */}
        {showHabitTuner && (
          <div className="p-4 sm:p-5 border-t border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/90 space-y-4">
            {/* Row 1: Focus Area & Data Source */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] mr-1">
                  Life Focus:
                </span>
                {FOCUS_AREAS.map((fa) => {
                  const Icon = fa.icon;
                  const isAct = userFocus === fa.id;
                  return (
                    <button
                      key={fa.id}
                      type="button"
                      onClick={() => setUserFocus && setUserFocus(fa.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                        isAct
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200/60 dark:border-slate-700'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{fa.label}</span>
                    </button>
                  );
                })}
              </div>

              {setHabitSource && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                    Data Source:
                  </span>
                  <div className="inline-flex bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setHabitSource('logs')}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                        habitSource === 'logs'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Database className="w-3 h-3" />
                      <span>My Logs</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setHabitSource('whatif')}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                        habitSource === 'whatif'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Sliders className="w-3 h-3" />
                      <span>What-If Lab</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Row 2: 1-Tap Archetype Presets */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                1-Tap Habit Archetypes:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset('deans_list')}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                >
                  <Award className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Dean's List (7.8h sleep, 5h study)</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('crammer')}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition-colors flex items-center gap-1"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Late-Night Crammer (4.5h sleep, 8.5h screen)</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('athlete')}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-100 transition-colors flex items-center gap-1"
                >
                  <Activity className="w-3.5 h-3.5 text-sky-500" />
                  <span>High Vitality (8.5h sleep, 60m workout)</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('reset')}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors flex items-center gap-1 ml-auto"
                >
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                  <span>Reset to My Logged Averages</span>
                </button>
              </div>
            </div>

            {/* Row 3: Precision Habit Sliders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
              {/* Sleep Hours Slider */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                    <Moon className="w-3.5 h-3.5 text-indigo-500" /> Sleep
                  </span>
                  <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                    {(whatIfInputs.sleep_hours || target.sleep_hours || 7.5).toFixed(1)}h
                  </span>
                </div>
                <input
                  type="range"
                  min="4.0"
                  max="10.0"
                  step="0.1"
                  value={whatIfInputs.sleep_hours || target.sleep_hours || 7.5}
                  onChange={(e) => handleHabitChange('sleep_hours', parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 rounded-lg cursor-pointer bg-slate-200 dark:bg-slate-700"
                />
                <span className="text-[10px] text-slate-400 block mt-1">4.0h - 10.0h</span>
              </div>

              {/* Study Hours Slider */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-500" /> Study
                  </span>
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    {(whatIfInputs.study_hours || target.study_hours || 4.0).toFixed(1)}h
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10.0"
                  step="0.1"
                  value={whatIfInputs.study_hours || target.study_hours || 4.0}
                  onChange={(e) => handleHabitChange('study_hours', parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 h-1.5 rounded-lg cursor-pointer bg-slate-200 dark:bg-slate-700"
                />
                <span className="text-[10px] text-slate-400 block mt-1">0.5h - 10.0h</span>
              </div>

              {/* Screen Time Slider */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-amber-500" /> Screen Time
                  </span>
                  <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                    {(whatIfInputs.screen_time_hours || target.screen_time_hours || 4.0).toFixed(1)}h
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="12.0"
                  step="0.1"
                  value={whatIfInputs.screen_time_hours || target.screen_time_hours || 4.0}
                  onChange={(e) => handleHabitChange('screen_time_hours', parseFloat(e.target.value))}
                  className="w-full accent-amber-600 h-1.5 rounded-lg cursor-pointer bg-slate-200 dark:bg-slate-700"
                />
                <span className="text-[10px] text-slate-400 block mt-1">1.0h - 12.0h</span>
              </div>

              {/* Movement Slider */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-sky-500" /> Movement
                  </span>
                  <span className="text-xs font-extrabold text-sky-600 dark:text-sky-400">
                    {Math.round(whatIfInputs.physical_activity_minutes || target.physical_activity_minutes || 35)}m
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="5"
                  value={whatIfInputs.physical_activity_minutes || target.physical_activity_minutes || 35}
                  onChange={(e) => handleHabitChange('physical_activity_minutes', parseInt(e.target.value, 10))}
                  className="w-full accent-sky-600 h-1.5 rounded-lg cursor-pointer bg-slate-200 dark:bg-slate-700"
                />
                <span className="text-[10px] text-slate-400 block mt-1">0m - 120m</span>
              </div>

              {/* Daily Spending Slider */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5 text-purple-500" /> Daily Spend
                  </span>
                  <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">
                    ₹{Math.round(whatIfInputs.daily_spending || target.daily_spending || 120)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={whatIfInputs.daily_spending || target.daily_spending || 120}
                  onChange={(e) => handleHabitChange('daily_spending', parseInt(e.target.value, 10))}
                  className="w-full accent-purple-600 h-1.5 rounded-lg cursor-pointer bg-slate-200 dark:bg-slate-700"
                />
                <span className="text-[10px] text-slate-400 block mt-1">₹0 - ₹1,000/day</span>
              </div>
            </div>

            {/* Row 4: Delta Telemetry Cards */}
            {baseline && target && (
              <div className="pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Habit Delta Telemetry:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Sleep Hours</span>
                    <strong className="text-slate-800 dark:text-slate-200">{baseline.sleep_hours}h</strong>
                    <span className={`font-bold ${sleepDelta >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {' '}→ {target.sleep_hours}h ({sleepDelta >= 0 ? `+${sleepDelta}h` : `${sleepDelta}h`})
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Study Hours</span>
                    <strong className="text-slate-800 dark:text-slate-200">{baseline.study_hours}h</strong>
                    <span className={`font-bold ${studyDelta >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {' '}→ {target.study_hours}h ({studyDelta >= 0 ? `+${studyDelta}h` : `${studyDelta}h`})
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Screen Time</span>
                    <strong className="text-slate-800 dark:text-slate-200">{baseline.screen_time_hours}h</strong>
                    <span className={`font-bold ${screenDelta <= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {' '}→ {target.screen_time_hours}h ({screenDelta >= 0 ? `+${screenDelta}h` : `${screenDelta}h`})
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Movement</span>
                    <strong className="text-slate-800 dark:text-slate-200">{Math.round(baseline.physical_activity_minutes)}m</strong>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                      {' '}→ {Math.round(target.physical_activity_minutes)}m
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Daily Spend</span>
                    <strong className="text-slate-800 dark:text-slate-200">₹{Math.round(baseline.daily_spending)}</strong>
                    <span className={`font-bold ${spendDelta <= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {' '}→ ₹{Math.round(target.daily_spending)} ({spendDelta <= 0 ? `saved ₹${Math.abs(spendDelta)}` : `+₹${spendDelta}`})
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Letter Content or Loading State */}
      {loadingLetter && !letter ? (
        <div className="py-20 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 space-y-3">
          <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif italic text-base text-slate-700 dark:text-slate-300">
            Your {horizonText} future self is writing a personalized letter...
          </p>
          <p className="text-xs text-slate-400">
            Synthesizing habits, streak dynamics, and projected milestones across time.
          </p>
        </div>
      ) : letter ? (
        <div className="space-y-5">
          {/* Authentic Letter Stationery Card */}
          <div
            className={`rounded-3xl p-6 sm:p-10 relative border shadow-sm transition-all ${
              isFiveYears
                ? 'bg-[#fcfaf6] dark:bg-slate-950/90 border-amber-200/80 dark:border-amber-900/50 ring-1 ring-amber-300/30'
                : 'bg-white dark:bg-slate-950/90 border-indigo-100 dark:border-slate-800 ring-1 ring-indigo-500/10'
            }`}
          >
            {/* Top Right Horizon Stamp */}
            <div
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase border absolute top-7 right-8 select-none pointer-events-none ${
                isFiveYears
                  ? 'bg-amber-100/70 text-amber-900 border-amber-300/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60'
                  : 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-900/60'
              }`}
            >
              {isFiveYears ? '⏳ TIME CAPSULE ARCHIVE // 2031' : '📅 SEMESTER DISPATCH // +180 DAYS'}
            </div>

            {/* Letterhead */}
            <div className="mb-6 pb-5 border-b border-slate-200/70 dark:border-slate-800/80">
              <span className="text-[11px] font-extrabold tracking-wider uppercase text-indigo-600 dark:text-indigo-400 block mb-1">
                {letter.theme_badge || (isFiveYears ? 'Manifesto From 1,825 Days Ahead' : 'Dispatch From Finals Week')}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-amber-50 tracking-tight mb-3">
                {letter.title}
              </h3>

              {/* Meta Stamp Row: Recipient, Superpower, Vulnerability */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-serif italic text-sm mr-1">
                  Dispatched to <strong className="text-slate-800 dark:text-slate-200 font-sans font-semibold">{userName || 'You'}</strong>
                </span>

                {letter.superpower && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
                    <Zap className="w-3 h-3 text-emerald-500" />
                    Superpower: {letter.superpower}
                  </span>
                )}

                {letter.vulnerability && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-[11px] font-semibold">
                    <ShieldAlert className="w-3 h-3 text-amber-500" />
                    Watch Out: {letter.vulnerability}
                  </span>
                )}
              </div>
            </div>

            {/* Key Quote Callout (if available) */}
            {letter.key_quote && (
              <div
                className={`mb-7 p-4 sm:p-5 rounded-2xl flex items-start gap-3.5 border ${
                  isFiveYears
                    ? 'bg-amber-100/60 dark:bg-amber-950/30 border-amber-300/80 dark:border-amber-800/50 text-amber-950 dark:text-amber-200'
                    : 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200/80 dark:border-indigo-900/50 text-indigo-950 dark:text-indigo-200'
                }`}
              >
                <Quote className="w-5 h-5 shrink-0 opacity-70 mt-0.5" />
                <p className="font-serif italic text-base sm:text-lg leading-relaxed">
                  "{letter.key_quote}"
                </p>
              </div>
            )}

            {/* Main Letter Body */}
            <div className="font-serif text-base sm:text-lg leading-relaxed sm:leading-loose text-slate-800 dark:text-slate-200 whitespace-pre-wrap space-y-4">
              {letter.letter_content}
            </div>

            {/* Elegant Closing & Seal */}
            <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
              <div className="font-serif italic text-slate-500 dark:text-slate-400">
                Dispatched across time with genuine conviction in your compounding journey.
              </div>
              <div className="font-mono text-[11px] tracking-wider uppercase text-slate-400 dark:text-slate-500">
                {isFiveYears ? 'Origin: 2031 Time Capsule' : 'Origin: Semester Dispatch'}
              </div>
            </div>
          </div>

          {/* Actionable Sprints / North Star Principles */}
          {letter.suggestions?.length > 0 && (
            <div
              className={`rounded-3xl p-5 sm:p-6 border ${
                isFiveYears
                  ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-900/40'
                  : 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-900/40'
              }`}
            >
              <h4
                className={`text-sm font-bold mb-3.5 flex items-center gap-2 ${
                  isFiveYears ? 'text-amber-950 dark:text-amber-200' : 'text-emerald-950 dark:text-emerald-200'
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {letter.suggestions.map((step, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-2xl border flex flex-col justify-between ${
                      isFiveYears
                        ? 'bg-white dark:bg-slate-900/90 border-amber-200/60 dark:border-amber-900/40 text-slate-800 dark:text-slate-200'
                        : 'bg-white dark:bg-slate-900/90 border-emerald-200/60 dark:border-emerald-900/40 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                          isFiveYears
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                        }`}
                      >
                        0{i + 1}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {isFiveYears ? 'North Star' : 'Tactical Sprint'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                      {step.replace(/^[0-9]+[.)]\s*/, '')}
                    </p>
                  </div>
                ))}
              </div>
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
            Click Regenerate above to generate your deeply personalized time capsule dispatch from your future self.
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
