import React, { useState, useMemo } from 'react';
import {
  CalendarPlus,
  Edit3,
  Trash2,
  Check,
  X,
  Sparkles,
  Zap,
  ShieldCheck,
  ShieldAlert,
  Snowflake,
  Loader2,
  Copy,
  Moon,
  BookOpen,
  Smartphone,
  Activity,
  IndianRupee,
  Smile,
  ChevronDown,
  ChevronUp,
  Flame,
  Calendar,
} from 'lucide-react';
import MonthlyAllowanceCard from './MonthlyAllowanceCard';
import {
  getLocalStreakFreezes,
  getLocalFrozenDates,
  restoreStreak,
} from '../api/habitApi';

const todayISO = () => new Date().toISOString().split('T')[0];

const DEFAULT_FORM = {
  date: todayISO(),
  sleep_hours: 7.5,
  screen_time_hours: 4.5,
  physical_activity_minutes: 35,
  study_hours: 4.0,
  total_spending: 150,
  spending_food: 100,
  spending_entertainment: 30,
  spending_study: 0,
  spending_shopping: 0,
  spending_misc: 20,
  study_mode: 'regular',
  mental_mood: 'balanced',
  notes: '',
};

// 1-Tap Fast Day Templates
const ROUTINE_PRESETS = [
  {
    id: 'regular',
    name: 'College Day',
    icon: '🎒',
    badge: 'Popular',
    desc: '4h study • 7.5h sleep • classes',
    values: {
      sleep_hours: 7.5,
      study_hours: 4.0,
      screen_time_hours: 4.5,
      physical_activity_minutes: 30,
      total_spending: 150,
      spending_food: 110,
      spending_entertainment: 20,
      spending_study: 0,
      spending_shopping: 0,
      spending_misc: 20,
      mental_mood: 'balanced',
    },
  },
  {
    id: 'exam',
    name: 'Exam Sprint',
    icon: '⚡',
    badge: 'Crunch',
    desc: '7h study • 6.5h sleep • focus',
    values: {
      sleep_hours: 6.5,
      study_hours: 7.0,
      screen_time_hours: 4.0,
      physical_activity_minutes: 20,
      total_spending: 100,
      spending_food: 80,
      spending_entertainment: 0,
      spending_study: 20,
      spending_shopping: 0,
      spending_misc: 0,
      mental_mood: 'sharp',
    },
  },
  {
    id: 'peak',
    name: "Dean's List",
    icon: '👑',
    badge: 'Peak Flow',
    desc: '5.5h study • 8h sleep • 45m workout',
    values: {
      sleep_hours: 8.0,
      study_hours: 5.5,
      screen_time_hours: 3.5,
      physical_activity_minutes: 45,
      total_spending: 120,
      spending_food: 100,
      spending_entertainment: 0,
      spending_study: 0,
      spending_shopping: 0,
      spending_misc: 20,
      mental_mood: 'sharp',
    },
  },
  {
    id: 'weekend',
    name: 'Weekend Chill',
    icon: '🏖️',
    badge: 'Recovery',
    desc: '9h sleep • 1.5h study • leisure',
    values: {
      sleep_hours: 9.0,
      study_hours: 1.5,
      screen_time_hours: 5.5,
      physical_activity_minutes: 40,
      total_spending: 350,
      spending_food: 200,
      spending_entertainment: 120,
      spending_study: 0,
      spending_shopping: 0,
      spending_misc: 30,
      mental_mood: 'balanced',
    },
  },
];

const SLEEP_CHIPS = [6.0, 7.0, 7.5, 8.0, 9.0];
const STUDY_CHIPS = [1.0, 2.5, 4.0, 6.0, 8.0];
const SCREEN_CHIPS = [2.0, 3.5, 5.0, 6.5, 8.0];
const EXERCISE_CHIPS = [0, 20, 30, 45, 60];
const SPEND_CHIPS = [0, 50, 100, 180, 300, 500];

const MOODS = [
  { id: 'sharp', label: 'Peak Flow', emoji: '🔥' },
  { id: 'balanced', label: 'Balanced', emoji: '😌' },
  { id: 'fatigued', label: 'Drained', emoji: '😴' },
  { id: 'anxious', label: 'Stressed', emoji: '⚡' },
];

export default function HabitTracker({
  logs = [],
  onSaveLog,
  onDeleteLog,
  onLoadSample,
  onClearAll,
  monthlyAllowance = 1500,
  onUpdateAllowance,
}) {
  const dailyBudgetTarget = Math.round((Number(monthlyAllowance) || 1500) / 30);
  const [form, setForm] = useState(() => ({
    ...DEFAULT_FORM,
    total_spending: dailyBudgetTarget,
    spending_food: Math.round(dailyBudgetTarget * 0.7),
    spending_entertainment: Math.round(dailyBudgetTarget * 0.2),
    spending_misc: Math.round(dailyBudgetTarget * 0.1),
  }));
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showMagicBar, setShowMagicBar] = useState(false);
  const [showSpendBreakdown, setShowSpendBreakdown] = useState(false);
  const [quickText, setQuickText] = useState('');

  // Streak Freeze State
  const [freezesCount, setFreezesCount] = useState(() => getLocalStreakFreezes());
  const [frozenDatesList, setFrozenDatesList] = useState(() => getLocalFrozenDates());
  const [streakActionMsg, setStreakActionMsg] = useState(null);
  const [isRestoringStreak, setIsRestoringStreak] = useState(false);

  // Compute streak momentum and broken streak state for the check-in view
  const streakInfo = useMemo(() => {
    if (!logs || logs.length === 0) {
      return { streak: 0, isBroken: false, brokenDate: null, isProtected: false };
    }
    const sorted = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
    const frozenSet = new Set(frozenDatesList);

    let tempS = 0;
    let prevDate = null;
    for (const l of sorted) {
      const d = new Date(l.date);
      if (prevDate) {
        const diffDays = Math.round((d - prevDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempS++;
        } else if (diffDays > 1) {
          let ok = true;
          for (let s = 1; s < diffDays; s++) {
            const dt = new Date(prevDate.getTime() + s * 86400000).toISOString().split('T')[0];
            if (!frozenSet.has(dt)) {
              ok = false;
              break;
            }
          }
          tempS = ok ? tempS + diffDays : 1;
        }
      } else {
        tempS = 1;
      }
      prevDate = d;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today.getTime() - 86400000).toISOString().split('T')[0];
    const lastDate = new Date(sorted[sorted.length - 1].date);
    lastDate.setHours(0, 0, 0, 0);
    const dayGap = Math.round((today - lastDate) / (1000 * 60 * 60 * 24));

    if (dayGap <= 1) {
      return { streak: tempS, isBroken: false, brokenDate: null, isProtected: false };
    }
    if (dayGap === 2) {
      if (frozenSet.has(yesterday)) {
        return { streak: tempS + 1, isBroken: false, brokenDate: null, isProtected: true };
      }
      return { streak: 0, isBroken: true, brokenDate: yesterday, isProtected: false, previousStreak: tempS };
    }
    return { streak: 0, isBroken: true, brokenDate: yesterday, isProtected: false, previousStreak: tempS };
  }, [logs, frozenDatesList]);

  const handleQuickRestore = async () => {
    setIsRestoringStreak(true);
    setStreakActionMsg(null);
    try {
      const dt = streakInfo.brokenDate || new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const res = await restoreStreak(dt);
      if (res) {
        setFreezesCount(res.freezes_available ?? Math.max(0, freezesCount - 1));
        if (res.freezes_used) {
          setFrozenDatesList(res.freezes_used);
        } else {
          setFrozenDatesList((p) => [...p, dt]);
        }
        setStreakActionMsg({ type: 'success', text: res.message || 'Streak restored! 🧊' });
      }
    } catch (err) {
      setStreakActionMsg({ type: 'error', text: err?.message || 'Failed to restore streak.' });
    } finally {
      setIsRestoringStreak(false);
      setTimeout(() => setStreakActionMsg(null), 4000);
    }
  };

  // Anti-Spam Check: does date already exist?
  const existingLogForDate = logs.find((l) => l.date === form.date && l.id !== editingId);
  const isAlreadyLogged = Boolean(existingLogForDate);

  const handleField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSetTotalSpend = (val) => {
    const num = Math.max(0, Number(val) || 0);
    setForm((prev) => ({
      ...prev,
      total_spending: num,
      spending_food: Math.round(num * 0.7),
      spending_entertainment: Math.round(num * 0.2),
      spending_misc: Math.round(num * 0.1),
      spending_study: 0,
      spending_shopping: 0,
    }));
  };

  // 1-Click Preset Handler
  const handleApplyPreset = (preset) => {
    setForm((prev) => ({
      ...prev,
      ...preset.values,
      date: prev.date,
    }));
    setFeedback(`⚡ Applied "${preset.name}" preset!`);
  };

  // 1-Click "Same as Yesterday" Handler
  const handleCopyYesterday = () => {
    if (!logs || logs.length === 0) return;
    const y = logs[0];
    const total = y.total_spending || ((y.spending_food || 0) + (y.spending_entertainment || 0) + (y.spending_misc || 0));
    setForm((prev) => ({
      ...prev,
      sleep_hours: y.sleep_hours,
      screen_time_hours: y.screen_time_hours,
      physical_activity_minutes: Math.round(y.physical_activity_minutes),
      study_hours: y.study_hours,
      total_spending: Math.round(total),
      spending_food: y.spending_food ?? 100,
      spending_entertainment: y.spending_entertainment ?? 0,
      spending_study: y.spending_study ?? 0,
      spending_shopping: y.spending_shopping ?? 0,
      spending_misc: y.spending_misc ?? 20,
      mental_mood: y.mental_mood || 'balanced',
      notes: y.notes ? `Mirroring yesterday: ${y.notes}` : '',
    }));
    setFeedback("✨ Copied yesterday's routine!");
  };

  // Natural Language Smart Quick-Log Parser
  const handleQuickTextParse = (e) => {
    e?.preventDefault();
    if (!quickText.trim()) return;

    const lower = quickText.toLowerCase();
    const updates = {};

    const sleepMatch =
      lower.match(/(?:slept|sleep)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*h?/i) ||
      lower.match(/(\d+(?:\.\d+)?)\s*h(?:ours?)?\s*(?:of\s*)?sleep/i);
    if (sleepMatch) updates.sleep_hours = parseFloat(sleepMatch[1]);

    const studyMatch =
      lower.match(/(?:stud(?:y|ied)|revision)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*h?/i) ||
      lower.match(/(\d+(?:\.\d+)?)\s*h(?:ours?)?\s*(?:of\s*)?stud/i);
    if (studyMatch) updates.study_hours = parseFloat(studyMatch[1]);

    const screenMatch =
      lower.match(/(?:screen|phone|reels|scroll(?:ing)?)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*h?/i) ||
      lower.match(/(\d+(?:\.\d+)?)\s*h(?:ours?)?\s*(?:screen|phone|reels)/i);
    if (screenMatch) updates.screen_time_hours = parseFloat(screenMatch[1]);

    const exMatch =
      lower.match(/(?:workout|gym|exercise|walk|run)\s*[:=]?\s*(\d+)\s*m?/i) ||
      lower.match(/(\d+)\s*m(?:in(?:utes?)?)?\s*(?:workout|gym|walk|exercise)/i);
    if (exMatch) updates.physical_activity_minutes = parseInt(exMatch[1], 10);

    const spendMatch =
      lower.match(/(?:spent|spend|food|chai|canteen|₹|rs\.?)\s*[:=]?\s*(\d+(?:\.\d+)?)/i) ||
      lower.match(/(\d+)\s*(?:rs|inr|rupees)/i);
    if (spendMatch) {
      const sp = parseFloat(spendMatch[1]);
      updates.total_spending = sp;
      updates.spending_food = Math.round(sp * 0.7);
      updates.spending_entertainment = Math.round(sp * 0.2);
      updates.spending_misc = Math.round(sp * 0.1);
    }

    if (Object.keys(updates).length > 0) {
      setForm((prev) => ({ ...prev, ...updates }));
      setFeedback(`⚡ Parsed: ${Object.keys(updates).join(', ')}`);
      setQuickText('');
    } else {
      setFeedback('Tip: Try "Slept 7.5h, study 4h, screen 3h, 30m gym, spend 120"');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setFeedback('');
    try {
      const totalSpend = Number(form.total_spending) || 0;
      const fSpend = form.spending_food ?? Math.round(totalSpend * 0.7);
      const eSpend = form.spending_entertainment ?? Math.round(totalSpend * 0.2);
      const mSpend = form.spending_misc ?? Math.round(totalSpend * 0.1);

      await onSaveLog({
        ...form,
        sleep_hours: Number(form.sleep_hours),
        screen_time_hours: Number(form.screen_time_hours),
        physical_activity_minutes: Number(form.physical_activity_minutes),
        study_hours: Number(form.study_hours),
        spending_food: Number(fSpend),
        spending_entertainment: Number(eSpend),
        spending_study: Number(form.spending_study || 0),
        spending_shopping: Number(form.spending_shopping || 0),
        spending_misc: Number(mSpend),
        study_mode: form.study_mode || 'regular',
        mental_mood: form.mental_mood || 'balanced',
      });

      const actionWord = editingId || isAlreadyLogged ? 'Updated' : 'Logged';
      setFeedback(`✅ ${actionWord} for ${form.date} & synced Future Twin!`);
      setEditingId(null);
    } catch (err) {
      setFeedback(err.message || 'Could not save entry.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (log) => {
    setEditingId(log.id);
    const total = log.total_spending || ((log.spending_food || 0) + (log.spending_entertainment || 0) + (log.spending_misc || 0));
    setForm({
      date: log.date,
      sleep_hours: log.sleep_hours,
      screen_time_hours: log.screen_time_hours,
      physical_activity_minutes: log.physical_activity_minutes,
      study_hours: log.study_hours,
      total_spending: Math.round(total),
      spending_food: log.spending_food ?? 100,
      spending_entertainment: log.spending_entertainment ?? 0,
      spending_study: log.spending_study ?? 0,
      spending_shopping: log.spending_shopping ?? 0,
      spending_misc: log.spending_misc ?? 20,
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

  // Live Trajectory Impact Feedback
  const getDayImpact = () => {
    const s = form.sleep_hours;
    const st = form.study_hours;
    const sc = form.screen_time_hours;
    const ex = form.physical_activity_minutes;
    const sp = form.total_spending;

    let points = 0;
    if (s >= 7.0 && s <= 9.0) points += 2;
    if (st >= 3.5) points += 2;
    if (sc <= 4.5) points += 2;
    if (ex >= 25) points += 2;
    if (sp <= dailyBudgetTarget) {
      points += 2;
    } else if (sp <= dailyBudgetTarget * 1.3) {
      points += 1;
    }

    const budgetStatusText =
      sp <= dailyBudgetTarget
        ? 'Within Allowance Target 💰'
        : `₹${Math.round(sp - dailyBudgetTarget)} Over Daily Target`;

    if (points >= 8) {
      return {
        badge: 'Dean’s List Standing 👑',
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
        desc: `+0.03 CGPA Pace • High Energy • ${budgetStatusText}`,
      };
    }
    if (points >= 5) {
      return {
        badge: 'Steady Progress Pace ⚡',
        color: 'text-indigo-600 dark:text-indigo-400',
        bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
        desc: `Solid daily consistency • ${budgetStatusText}`,
      };
    }
    return {
      badge: 'Fatigue / Budget Alert ⚠️',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      desc: sp > dailyBudgetTarget * 1.5 ? 'High spend & routine variance detected' : 'Sleep deficit or high screen time detected',
    };
  };

  const impact = getDayImpact();

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* Top: Monthly Allowance & Budget Command Center                   */}
      {/* ================================================================= */}
      <MonthlyAllowanceCard
        monthlyAllowance={monthlyAllowance}
        onUpdateAllowance={onUpdateAllowance}
        logs={logs}
      />

      {/* Streak Freeze Alert or Broken Streak Recovery Banner */}
      {streakActionMsg && (
        <div
          className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between gap-2 animate-fadeIn ${
            streakActionMsg.type === 'success'
              ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-300 dark:border-cyan-800 text-cyan-800 dark:text-cyan-200'
              : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {streakActionMsg.type === 'success' ? (
              <Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            ) : (
              <X className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            )}
            <span>{streakActionMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStreakActionMsg(null)}
            className="text-xs opacity-60 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {streakInfo.isBroken && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 dark:from-amber-950/60 dark:via-rose-950/40 dark:to-amber-950/60 border border-amber-500/40 dark:border-amber-500/30 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-extrabold text-amber-950 dark:text-amber-200">
                  Streak in Danger! Missed logging {streakInfo.brokenDate || 'yesterday'}.
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-500/20 text-rose-700 dark:text-rose-300">
                  Broken
                </span>
              </div>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                Your previous {streakInfo.previousStreak || 1}-day streak broke. Use a Streak Freeze to repair the gap!
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isRestoringStreak}
            onClick={handleQuickRestore}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            {isRestoringStreak ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>🧊</span>}
            <span>{freezesCount > 0 ? `Restore Streak (1 Freeze)` : `Restore Streak (+1 Emergency Freeze)`}</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* ================================================================= */}
      {/* Left: Streamlined, Spacious, Uncluttered Daily Check-In Form        */}
      {/* ================================================================= */}
      <div className="lg:col-span-6 rounded-3xl p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        {/* Top Header & Date Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {editingId ? 'Edit Check-In' : 'Daily Check-In'}
                </h2>
                {streakInfo.streak > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    <Flame className="w-3 h-3 text-amber-500" />
                    <span>{streakInfo.streak}d Streak</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                  <Snowflake className="w-3 h-3 text-cyan-500" />
                  <span>{freezesCount} Freezes</span>
                </span>
                {streakInfo.isProtected && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span>Shielded</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tap presets or chips • Fast, clean, convenient
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Date Input with subtle indicator */}
            <div className="relative">
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => handleField('date', e.target.value)}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border outline-none transition-all ${
                  isAlreadyLogged
                    ? 'border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 ring-1 ring-amber-400/30'
                    : 'border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-400'
                }`}
              />
            </div>
            {editingId && (
              <button
                onClick={cancelEdit}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white p-1.5"
                title="Cancel Edit"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 1-Tap Fast Routine Ribbon */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 1-Tap Fast Presets
            </span>
            {logs.length > 0 && (
              <button
                type="button"
                onClick={handleCopyYesterday}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 inline-flex items-center gap-1 transition-colors"
                title="Populate with yesterday's numbers"
              >
                <Copy className="w-3.5 h-3.5" /> Same as Yesterday
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {ROUTINE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800/70 dark:hover:bg-indigo-950/60 border border-slate-200/70 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{preset.icon}</span>
                <span>{preset.name}</span>
              </button>
            ))}

            {/* Optional Magic Bar Toggle */}
            <button
              type="button"
              onClick={() => setShowMagicBar((prev) => !prev)}
              className="inline-flex items-center gap-1 py-1.5 px-3 rounded-xl text-xs font-semibold bg-indigo-50/60 hover:bg-indigo-100/70 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50 transition-colors ml-auto"
            >
              <span>Magic Bar ✨</span>
              {showMagicBar ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Collapsible Natural Language Smart Bar */}
        {showMagicBar && (
          <form onSubmit={handleQuickTextParse} className="relative pt-1 animate-fadeIn">
            <input
              type="text"
              value={quickText}
              onChange={(e) => setQuickText(e.target.value)}
              placeholder='e.g. "Slept 8h, study 4h, screen 3h, 30m gym, spend 120"'
              className="w-full pl-3 pr-20 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-2.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors"
            >
              Auto-Fill
            </button>
          </form>
        )}

        {/* Main Check-In Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* THE 4 CORE HABIT CARDS: Clean, spacious, with 1-tap chips + fine slider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* 1. SLEEP */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/40 dark:bg-slate-800/40 border border-indigo-100/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-indigo-500" /> Sleep
                </span>
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                  {form.sleep_hours} <span className="text-xs font-normal text-slate-400">hrs</span>
                </span>
              </div>

              {/* 1-Tap Quick Chips */}
              <div className="flex gap-1.5">
                {SLEEP_CHIPS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleField('sleep_hours', val)}
                    className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                      form.sleep_hours === val
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-600'
                    }`}
                  >
                    {val}h
                  </button>
                ))}
              </div>

              {/* Precision Slider */}
              <input
                type="range"
                min="0"
                max="14"
                step="0.5"
                value={form.sleep_hours}
                onChange={(e) => handleField('sleep_hours', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* 2. STUDY */}
            <div className="p-3.5 rounded-2xl bg-violet-50/40 dark:bg-slate-800/40 border border-violet-100/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-violet-500" /> Study Focus
                </span>
                <span className="text-sm font-black text-violet-600 dark:text-violet-400">
                  {form.study_hours} <span className="text-xs font-normal text-slate-400">hrs</span>
                </span>
              </div>

              {/* 1-Tap Quick Chips */}
              <div className="flex gap-1.5">
                {STUDY_CHIPS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleField('study_hours', val)}
                    className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                      form.study_hours === val
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-slate-600'
                    }`}
                  >
                    {val}h
                  </button>
                ))}
              </div>

              {/* Precision Slider */}
              <input
                type="range"
                min="0"
                max="14"
                step="0.5"
                value={form.study_hours}
                onChange={(e) => handleField('study_hours', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
              />
            </div>

            {/* 3. SCREEN TIME */}
            <div className="p-3.5 rounded-2xl bg-sky-50/40 dark:bg-slate-800/40 border border-sky-100/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-sky-500" /> Screen Time
                </span>
                <span className="text-sm font-black text-sky-600 dark:text-sky-400">
                  {form.screen_time_hours} <span className="text-xs font-normal text-slate-400">hrs</span>
                </span>
              </div>

              {/* 1-Tap Quick Chips */}
              <div className="flex gap-1.5">
                {SCREEN_CHIPS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleField('screen_time_hours', val)}
                    className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                      form.screen_time_hours === val
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-600'
                    }`}
                  >
                    {val}h
                  </button>
                ))}
              </div>

              {/* Precision Slider */}
              <input
                type="range"
                min="0"
                max="16"
                step="0.5"
                value={form.screen_time_hours}
                onChange={(e) => handleField('screen_time_hours', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
            </div>

            {/* 4. WORKOUT / EXERCISE */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/40 dark:bg-slate-800/40 border border-emerald-100/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-500" /> Movement
                </span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  {form.physical_activity_minutes} <span className="text-xs font-normal text-slate-400">mins</span>
                </span>
              </div>

              {/* 1-Tap Quick Chips */}
              <div className="flex gap-1.5">
                {EXERCISE_CHIPS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleField('physical_activity_minutes', val)}
                    className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                      form.physical_activity_minutes === val
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-600'
                    }`}
                  >
                    {val}m
                  </button>
                ))}
              </div>

              {/* Precision Slider */}
              <input
                type="range"
                min="0"
                max="120"
                step="5"
                value={form.physical_activity_minutes}
                onChange={(e) => handleField('physical_activity_minutes', parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
          </div>

          {/* 5. CONVENIENT TOTAL SPEND CARD */}
          <div className="p-3.5 rounded-2xl bg-amber-50/40 dark:bg-slate-800/40 border border-amber-100/80 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <IndianRupee className="w-4 h-4 text-amber-500" /> Daily Spending
                </span>
                <span className="text-[10px] text-slate-400">
                  Target: ~₹{dailyBudgetTarget}/day (from ₹{Number(monthlyAllowance).toLocaleString('en-IN')}/mo allowance)
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-400 font-medium">₹</span>
                <input
                  type="number"
                  min="0"
                  value={form.total_spending}
                  onChange={(e) => handleSetTotalSpend(e.target.value)}
                  className="w-20 text-right py-0.5 px-2 text-sm font-bold rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* 1-Tap Spending Chips with Allowance Target Highlight */}
            <div className="flex flex-wrap gap-1.5">
              {/* Target Allowance Chip */}
              <button
                type="button"
                onClick={() => handleSetTotalSpend(dailyBudgetTarget)}
                className={`py-1 px-2.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 ${
                  form.total_spending === dailyBudgetTarget
                    ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                }`}
                title="Log exact daily allowance target"
              >
                <span>🎯 Target: ₹{dailyBudgetTarget}</span>
              </button>

              {SPEND_CHIPS.filter((val) => val !== dailyBudgetTarget).map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleSetTotalSpend(val)}
                  className={`flex-1 min-w-[44px] py-1 rounded-lg text-xs font-bold transition-all ${
                    form.total_spending === val
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-600'
                  }`}
                >
                  ₹{val}
                </button>
              ))}
            </div>

            {/* Real-time Allowance Burn Feedback */}
            <div className="flex items-center justify-between text-[11px] px-2 py-1.5 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/50">
              <span className="text-slate-500 dark:text-slate-400">Daily Allowance Impact:</span>
              {form.total_spending <= dailyBudgetTarget ? (
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  ✅ ₹{dailyBudgetTarget - form.total_spending} under daily target (+₹{dailyBudgetTarget - form.total_spending} saved)
                </span>
              ) : (
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  ⚠️ ₹{form.total_spending - dailyBudgetTarget} over daily target
                </span>
              )}
            </div>

            {/* Optional Category Breakdown Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowSpendBreakdown((p) => !p)}
                className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 inline-flex items-center gap-1 transition-colors"
              >
                <span>Optional: Specify Categories (Food, Entertainment, Study)</span>
                {showSpendBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {showSpendBreakdown && (
                <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700 animate-fadeIn">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Food / Canteen</label>
                    <input
                      type="number"
                      min="0"
                      value={form.spending_food}
                      onChange={(e) => handleField('spending_food', Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Fun / Media</label>
                    <input
                      type="number"
                      min="0"
                      value={form.spending_entertainment}
                      onChange={(e) => handleField('spending_entertainment', Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Misc / Other</label>
                    <input
                      type="number"
                      min="0"
                      value={form.spending_misc}
                      onChange={(e) => handleField('spending_misc', Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 6. DAILY VIBE / MOOD PILLS */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shrink-0">
              <Smile className="w-4 h-4 text-amber-500" /> Daily Vibe:
            </span>
            <div className="flex gap-1.5 overflow-x-auto py-1">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleField('mental_mood', m.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold inline-flex items-center gap-1 transition-all ${
                    form.mental_mood === m.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 7. LIVE TODAY'S TRAJECTORY IMPACT PREVIEW */}
          <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs ${impact.bg}`}>
            <div>
              <span className={`font-bold block ${impact.color}`}>{impact.badge}</span>
              <span className="text-slate-600 dark:text-slate-300 text-[11px]">{impact.desc}</span>
            </div>
            <Zap className={`w-4 h-4 shrink-0 ${impact.color}`} />
          </div>

          {feedback && (
            <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
              {feedback}
            </div>
          )}

          {/* 8. PRIMARY CTA BUTTON */}
          <button
            type="submit"
            disabled={saving}
            className={`w-full py-3 rounded-2xl text-white text-xs sm:text-sm font-bold shadow-md transition-all inline-flex items-center justify-center gap-2 disabled:opacity-60 hover:scale-[1.01] active:scale-[0.99] ${
              isAlreadyLogged
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-amber-500/20'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/20'
            }`}
          >
            <Check className="w-4 h-4" />
            {saving
              ? 'Saving Changes...'
              : editingId
              ? 'Update Edited Log'
              : isAlreadyLogged
              ? `Update Today’s Log (${form.date})`
              : 'Log Today’s Habits'}
          </button>
        </form>
      </div>

      {/* ================================================================= */}
      {/* Right: Past Entries Log Table & History                            */}
      {/* ================================================================= */}
      <div className="lg:col-span-6 rounded-3xl p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Habit History ({logs.length} Days)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                1 record per calendar day • Powers your future simulation
              </p>
            </div>
            {logs.length > 0 && (
              <button
                onClick={onClearAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors"
                title="Reset log to zero"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Reset All
              </button>
            )}
          </div>

          {logs.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No daily logs recorded yet. Use the 1-tap presets on the left or load our 30-day student routine!
              </p>
              <button
                onClick={onLoadSample}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
              >
                Load Sample Routine
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Daily Allowance Adherence Banner */}
              <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
                <span>
                  🎯 Target: <strong>₹{dailyBudgetTarget}/day</strong>
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {logs.filter((l) => (Number(l.total_spending) || 0) <= dailyBudgetTarget).length} of {logs.length} days on budget
                </span>
              </div>

              <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-400">
                    <tr>
                      <th className="py-2.5 px-2">Date</th>
                      <th className="py-2.5 px-2">Sleep</th>
                      <th className="py-2.5 px-2">Study</th>
                      <th className="py-2.5 px-2">Screen</th>
                      <th className="py-2.5 px-2">Active</th>
                      <th className="py-2.5 px-2">Spend</th>
                      <th className="py-2.5 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                    {logs.map((log) => {
                      const isUnderDaily = (Number(log.total_spending) || 0) <= dailyBudgetTarget;
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 px-2 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                            {log.date}
                          </td>
                          <td className="py-2.5 px-2">{log.sleep_hours}h</td>
                          <td className="py-2.5 px-2 font-semibold text-indigo-600 dark:text-indigo-400">{log.study_hours}h</td>
                          <td className="py-2.5 px-2">{log.screen_time_hours}h</td>
                          <td className="py-2.5 px-2">{Math.round(log.physical_activity_minutes)}m</td>
                          <td className="py-2.5 px-2 font-medium">
                            <div className="flex items-center gap-1">
                              <span
                                className={
                                  isUnderDaily
                                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                                    : 'text-slate-800 dark:text-slate-200'
                                }
                              >
                                ₹{Math.round(log.total_spending).toLocaleString('en-IN')}
                              </span>
                              {isUnderDaily && (
                                <span className="text-[10px] text-emerald-500 font-bold" title="Within daily allowance">
                                  ✓
                                </span>
                              )}
                            </div>
                          </td>
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Motivational Footer Strip */}
        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>⚡ Daily habit logging compounds 1% every day</span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">Auto-saved</span>
        </div>
      </div>
    </div>
  </div>
  );
}
