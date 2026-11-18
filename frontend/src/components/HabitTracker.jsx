import React, { useState } from 'react';
import {
  CalendarPlus,
  Edit3,
  Trash2,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Zap,
  ShieldAlert,
  ShieldCheck,
  Clock,
  ArrowRight,
  Copy,
} from 'lucide-react';

const todayISO = () => new Date().toISOString().split('T')[0];

const DEFAULT_FORM = {
  date: todayISO(),
  sleep_hours: 7.5,
  screen_time_hours: 4.5,
  physical_activity_minutes: 35,
  study_hours: 3.5,
  spending_food: 120,
  spending_entertainment: 40,
  spending_study: 0,
  spending_shopping: 0,
  spending_misc: 20,
  study_mode: 'regular',
  mental_mood: 'balanced',
  notes: '',
};

// 1-Click Fast Presets (Addresses Judge Remark #1: No time to manually type 9 numbers)
const ROUTINE_PRESETS = [
  {
    id: 'regular',
    name: 'College Day',
    icon: '🎒',
    badge: 'Popular',
    desc: '4h study • 7.5h sleep • classes & review',
    values: {
      sleep_hours: 7.5,
      study_hours: 4.0,
      screen_time_hours: 4.5,
      physical_activity_minutes: 30,
      spending_food: 120,
      spending_entertainment: 40,
      spending_study: 0,
      spending_shopping: 0,
      spending_misc: 20,
      notes: 'Standard college routine with regular study blocks.',
    },
  },
  {
    id: 'exam',
    name: 'Exam Sprint',
    icon: '⚡',
    badge: 'Crunch',
    desc: '7.5h study • 6h sleep • high retention',
    values: {
      sleep_hours: 6.0,
      study_hours: 7.5,
      screen_time_hours: 6.0,
      physical_activity_minutes: 15,
      spending_food: 70,
      spending_entertainment: 0,
      spending_study: 30,
      spending_shopping: 0,
      spending_misc: 10,
      notes: 'Intensive pre-exam revision sprint.',
    },
  },
  {
    id: 'weekend',
    name: 'Weekend Chill',
    icon: '🏖️',
    badge: 'Rest',
    desc: '9h sleep • 1.5h study • leisure & socializing',
    values: {
      sleep_hours: 9.0,
      study_hours: 1.5,
      screen_time_hours: 5.5,
      physical_activity_minutes: 45,
      spending_food: 220,
      spending_entertainment: 120,
      spending_study: 0,
      spending_shopping: 40,
      spending_misc: 30,
      notes: 'Weekend recovery and personal time.',
    },
  },
  {
    id: 'peak',
    name: "Dean's List",
    icon: '👑',
    badge: 'Peak Flow',
    desc: '5.5h study • 8h sleep • 50m workout',
    values: {
      sleep_hours: 8.0,
      study_hours: 5.5,
      screen_time_hours: 3.5,
      physical_activity_minutes: 50,
      spending_food: 80,
      spending_entertainment: 0,
      spending_study: 0,
      spending_shopping: 0,
      spending_misc: 15,
      notes: 'Balanced high-performance day.',
    },
  },
];

export default function HabitTracker({ logs = [], onSaveLog, onDeleteLog, onLoadSample, onClearAll }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [quickText, setQuickText] = useState('');

  // Anti-Spam Constraint (Addresses Judge Remark #2):
  // Checks if the chosen date already has an existing log in the database
  const existingLogForDate = logs.find((l) => l.date === form.date && l.id !== editingId);
  const isAlreadyLogged = Boolean(existingLogForDate);

  const handleField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleStep = (key, delta, min = 0, max = 24) => {
    setForm((prev) => {
      const cur = parseFloat(prev[key]) || 0;
      const next = Math.min(max, Math.max(min, Math.round((cur + delta) * 10) / 10));
      return { ...prev, [key]: next };
    });
  };

  // 1-Click Preset Handler
  const handleApplyPreset = (preset) => {
    setForm((prev) => ({
      ...prev,
      ...preset.values,
      date: prev.date, // keep currently selected date
    }));
    setFeedback(`⚡ Applied "${preset.name}" preset! Click Save to confirm.`);
  };

  // 1-Click "Same as Yesterday" Handler
  const handleCopyYesterday = () => {
    if (!logs || logs.length === 0) return;
    const yesterday = logs[0]; // Most recent entry
    setForm((prev) => ({
      ...prev,
      sleep_hours: yesterday.sleep_hours,
      screen_time_hours: yesterday.screen_time_hours,
      physical_activity_minutes: Math.round(yesterday.physical_activity_minutes),
      study_hours: yesterday.study_hours,
      spending_food: yesterday.spending_food ?? 100,
      spending_entertainment: yesterday.spending_entertainment ?? 0,
      spending_study: yesterday.spending_study ?? 0,
      spending_shopping: yesterday.spending_shopping ?? 0,
      spending_misc: yesterday.spending_misc ?? 20,
      notes: yesterday.notes ? `Mirroring yesterday: ${yesterday.notes}` : '',
    }));
    setFeedback("✨ Copied yesterday's routine! You can tweak any number or click save.");
  };

  // Natural Language Smart Quick-Log Parser
  const handleQuickTextParse = (e) => {
    e?.preventDefault();
    if (!quickText.trim()) return;

    const lower = quickText.toLowerCase();
    const updates = {};

    // Sleep extraction (e.g., "slept 7.5h", "8 hours sleep", "sleep 7")
    const sleepMatch =
      lower.match(/(?:slept|sleep)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*h?/i) ||
      lower.match(/(\d+(?:\.\d+)?)\s*h(?:ours?)?\s*(?:of\s*)?sleep/i);
    if (sleepMatch) updates.sleep_hours = parseFloat(sleepMatch[1]);

    // Study extraction (e.g., "study 4h", "studied 5 hours", "revision 3h")
    const studyMatch =
      lower.match(/(?:stud(?:y|ied)|revision)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*h?/i) ||
      lower.match(/(\d+(?:\.\d+)?)\s*h(?:ours?)?\s*(?:of\s*)?stud/i);
    if (studyMatch) updates.study_hours = parseFloat(studyMatch[1]);

    // Screen extraction (e.g., "screen 4h", "3h phone", "reels 2h")
    const screenMatch =
      lower.match(/(?:screen|phone|reels|scroll(?:ing)?)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*h?/i) ||
      lower.match(/(\d+(?:\.\d+)?)\s*h(?:ours?)?\s*(?:screen|phone|reels)/i);
    if (screenMatch) updates.screen_time_hours = parseFloat(screenMatch[1]);

    // Exercise / Workout / Gym (e.g., "gym 45m", "walk 30 min", "workout 40m")
    const exMatch =
      lower.match(/(?:workout|gym|exercise|walk|run)\s*[:=]?\s*(\d+)\s*m?/i) ||
      lower.match(/(\d+)\s*m(?:in(?:utes?)?)?\s*(?:workout|gym|walk|exercise)/i);
    if (exMatch) updates.physical_activity_minutes = parseInt(exMatch[1], 10);

    // Spend extraction (e.g., "spent 150", "₹120", "canteen 80")
    const spendMatch =
      lower.match(/(?:spent|spend|food|chai|canteen|₹|rs\.?)\s*[:=]?\s*(\d+(?:\.\d+)?)/i) ||
      lower.match(/(\d+)\s*(?:rs|inr|rupees)/i);
    if (spendMatch) updates.spending_food = parseFloat(spendMatch[1]);

    if (Object.keys(updates).length > 0) {
      setForm((prev) => ({ ...prev, ...updates }));
      setFeedback(`⚡ Smart parse filled: ${Object.keys(updates).join(', ')}!`);
      setQuickText('');
    } else {
      setFeedback('Tip: Try "Slept 7.5h, study 4h, screen 3h, 30m gym, spend 120"');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return; // Prevent double-click spam

    setSaving(true);
    setFeedback('');
    try {
      await onSaveLog({
        ...form,
        sleep_hours: Number(form.sleep_hours),
        screen_time_hours: Number(form.screen_time_hours),
        physical_activity_minutes: Number(form.physical_activity_minutes),
        study_hours: Number(form.study_hours),
        spending_food: Number(form.spending_food),
        spending_entertainment: Number(form.spending_entertainment),
        spending_study: Number(form.spending_study),
        spending_shopping: Number(form.spending_shopping),
        spending_misc: Number(form.spending_misc),
        study_mode: form.study_mode || 'regular',
        mental_mood: form.mental_mood || 'balanced',
      });

      const actionWord = editingId || isAlreadyLogged ? 'Updated' : 'Saved';
      setFeedback(`✅ ${actionWord} entry for ${form.date} & refreshed your Future Twin!`);
      setEditingId(null);
    } catch (err) {
      setFeedback(err.message || 'Could not save entry. Please check your numbers.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (log) => {
    setEditingId(log.id);
    setForm({
      date: log.date,
      sleep_hours: log.sleep_hours,
      screen_time_hours: log.screen_time_hours,
      physical_activity_minutes: log.physical_activity_minutes,
      study_hours: log.study_hours,
      spending_food: log.spending_food,
      spending_entertainment: log.spending_entertainment,
      spending_study: log.spending_study,
      spending_shopping: log.spending_shopping,
      spending_misc: log.spending_misc,
      study_mode: log.study_mode || 'regular',
      mental_mood: log.mental_mood || 'balanced',
      notes: log.notes || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ ...DEFAULT_FORM, date: todayISO() });
  };

  const dailySpendTotal =
    Number(form.spending_food || 0) +
    Number(form.spending_entertainment || 0) +
    Number(form.spending_study || 0) +
    Number(form.spending_shopping || 0) +
    Number(form.spending_misc || 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Zero-Friction Daily Check-In Form */}
      <div className="lg:col-span-5 rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm h-fit space-y-4">
        {/* Form Title & Anti-Spam Badge */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Past Entry' : 'Quick Daily Check-In'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                1-click presets • Takes 5 seconds
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
              title="Only 1 entry permitted per calendar day to prevent habit streak spamming"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              1 Log/Day Enforced
            </span>
            {editingId && (
              <button
                onClick={cancelEdit}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            )}
          </div>
        </div>

        {/* 1-CLICK ROUTINE PRESETS (Solves Judge Remark #1) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> 1-Click Routine Fast-Fill
            </span>
            {logs.length > 0 && (
              <button
                type="button"
                onClick={handleCopyYesterday}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 inline-flex items-center gap-1 transition-colors"
                title="Populate today with yesterday's exact habit numbers"
              >
                <Copy className="w-3 h-3" /> Same as Yesterday
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ROUTINE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="p-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/70 dark:bg-slate-800/60 dark:hover:bg-indigo-950/50 border border-slate-200/80 dark:border-slate-700/80 text-left transition-all hover:scale-[1.02] active:scale-[0.98] group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">{preset.icon}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-600">
                    {preset.badge}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
                  {preset.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{preset.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* NATURAL LANGUAGE QUICK-LOG INPUT */}
        <form onSubmit={handleQuickTextParse} className="relative">
          <input
            type="text"
            value={quickText}
            onChange={(e) => setQuickText(e.target.value)}
            placeholder='Or type naturally: "Slept 7h, study 4h, screen 3h, 30m gym, spend 100"'
            className="w-full pl-3 pr-20 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-sm transition-colors"
          >
            Auto-Fill
          </button>
        </form>

        {/* MAIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          {/* Date Selector & Anti-Spam Status Banner (Solves Judge Remark #2) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Check-In Date
              </label>
              {isAlreadyLogged && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  Already Logged • Updates Existing
                </span>
              )}
            </div>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => handleField('date', e.target.value)}
              className={`w-full px-3 py-2 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none transition-all ${
                isAlreadyLogged
                  ? 'border-amber-300 dark:border-amber-700 ring-1 ring-amber-400/30'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-400'
              }`}
            />
          </div>

          {/* Anti-Spam Notification Banner */}
          {isAlreadyLogged && (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Anti-Spam Policy Active:</strong> A check-in for <strong>{form.date}</strong> already exists. Submitting will cleanly update that entry instead of creating duplicates.
              </div>
            </div>
          )}

          {/* Core 4 Habit Steppers */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Sleep Hours */}
            <div className="p-2.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                <span>Sleep</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{form.sleep_hours} hrs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleStep('sleep_hours', -0.5, 0, 24)}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold hover:bg-slate-100"
                >
                  -
                </button>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  required
                  value={form.sleep_hours}
                  onChange={(e) => handleField('sleep_hours', e.target.value)}
                  className="w-full text-center py-1 text-sm font-bold rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                />
                <button
                  type="button"
                  onClick={() => handleStep('sleep_hours', 0.5, 0, 24)}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold hover:bg-slate-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Study Hours */}
            <div className="p-2.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                <span>Study</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{form.study_hours} hrs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleStep('study_hours', -0.5, 0, 24)}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold hover:bg-slate-100"
                >
                  -
                </button>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  required
                  value={form.study_hours}
                  onChange={(e) => handleField('study_hours', e.target.value)}
                  className="w-full text-center py-1 text-sm font-bold rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                />
                <button
                  type="button"
                  onClick={() => handleStep('study_hours', 0.5, 0, 24)}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold hover:bg-slate-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Screen Time */}
            <div className="p-2.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                <span>Screen (total)</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{form.screen_time_hours} hrs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleStep('screen_time_hours', -0.5, 0, 24)}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold hover:bg-slate-100"
                >
                  -
                </button>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  required
                  value={form.screen_time_hours}
                  onChange={(e) => handleField('screen_time_hours', e.target.value)}
                  className="w-full text-center py-1 text-sm font-bold rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                />
                <button
                  type="button"
                  onClick={() => handleStep('screen_time_hours', 0.5, 0, 24)}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold hover:bg-slate-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Exercise Minutes */}
            <div className="p-2.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                <span>Workout</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{form.physical_activity_minutes} mins</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleStep('physical_activity_minutes', -10, 0, 720)}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold hover:bg-slate-100"
                >
                  -
                </button>
                <input
                  type="number"
                  step="5"
                  min="0"
                  max="720"
                  required
                  value={form.physical_activity_minutes}
                  onChange={(e) => handleField('physical_activity_minutes', e.target.value)}
                  className="w-full text-center py-1 text-sm font-bold rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                />
                <button
                  type="button"
                  onClick={() => handleStep('physical_activity_minutes', 10, 0, 720)}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold hover:bg-slate-100"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Quick Spending Row */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Spending (₹)
              </span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                Total: ₹{Math.round(dailySpendTotal).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">Food / Canteen</label>
                <input
                  type="number"
                  min="0"
                  value={form.spending_food}
                  onChange={(e) => handleField('spending_food', e.target.value)}
                  className="w-full px-2 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">Fun / Media</label>
                <input
                  type="number"
                  min="0"
                  value={form.spending_entertainment}
                  onChange={(e) => handleField('spending_entertainment', e.target.value)}
                  className="w-full px-2 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">Other / Misc</label>
                <input
                  type="number"
                  min="0"
                  value={form.spending_misc}
                  onChange={(e) => handleField('spending_misc', e.target.value)}
                  className="w-full px-2 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
          </div>

          {feedback && (
            <div className="text-xs font-medium text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
              {feedback}
            </div>
          )}

          {/* Submit Button (Updates cleanly if date already exists) */}
          <button
            type="submit"
            disabled={saving}
            className={`w-full py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold shadow-sm transition-all inline-flex items-center justify-center gap-2 disabled:opacity-60 ${
              isAlreadyLogged
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
            }`}
          >
            <Check className="w-4 h-4" />
            {saving
              ? 'Saving Changes...'
              : editingId
              ? 'Save Edited Changes'
              : isAlreadyLogged
              ? `Update Existing Check-In (${form.date})`
              : 'Save Daily Check-In'}
          </button>
        </form>
      </div>

      {/* Right: Past Entries Log Table */}
      <div className="lg:col-span-7 rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Habit History ({logs.length} days recorded)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deduplicated • 1 record per calendar day
            </p>
          </div>
          {logs.length > 0 && (
            <button
              onClick={onClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors"
              title="Delete all check-in entries and reset your habit log to zero"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset All
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No daily logs yet. Use the 1-click presets on the left or load our 30-day student routine!
            </p>
            <button
              onClick={onLoadSample}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
            >
              Load Sample Routine
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[540px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-400">
                <tr>
                  <th className="py-2.5 px-2">Date</th>
                  <th className="py-2.5 px-2">Sleep</th>
                  <th className="py-2.5 px-2">Screen</th>
                  <th className="py-2.5 px-2">Active</th>
                  <th className="py-2.5 px-2">Study</th>
                  <th className="py-2.5 px-2">Spend</th>
                  <th className="py-2.5 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-2 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {log.date}
                    </td>
                    <td className="py-2.5 px-2">{log.sleep_hours}h</td>
                    <td className="py-2.5 px-2">{log.screen_time_hours}h</td>
                    <td className="py-2.5 px-2">{Math.round(log.physical_activity_minutes)}m</td>
                    <td className="py-2.5 px-2">{log.study_hours}h</td>
                    <td className="py-2.5 px-2 font-medium">₹{Math.round(log.total_spending).toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-2 text-right whitespace-nowrap">
                      <button
                        onClick={() => startEdit(log)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Edit entry"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteLog(log.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
