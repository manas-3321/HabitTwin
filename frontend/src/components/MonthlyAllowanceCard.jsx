import React, { useState, useMemo } from 'react';
import {
  Wallet,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Check,
  X,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  PieChart,
  Calendar,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

const ALLOWANCE_PRESETS = [
  { label: '₹1,000', value: 1000, desc: 'Bare Essentials' },
  { label: '₹1,500', value: 1500, desc: 'Standard Pocket' },
  { label: '₹2,500', value: 2500, desc: 'Balanced' },
  { label: '₹3,500', value: 3500, desc: 'Flexible' },
  { label: '₹5,000', value: 5000, desc: 'Generous' },
];

export default function MonthlyAllowanceCard({
  monthlyAllowance = 1500,
  onUpdateAllowance,
  logs = [],
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftAllowance, setDraftAllowance] = useState(monthlyAllowance);
  const [showCategoryBreakdown, setShowCategoryBreakdown] = useState(false);

  // Determine available months from logs and today's date
  const todayISO = new Date().toISOString().split('T')[0];
  const currentMonthKey = todayISO.slice(0, 7); // "YYYY-MM"

  const availableMonths = useMemo(() => {
    const set = new Set([currentMonthKey]);
    logs.forEach((l) => {
      if (l.date && l.date.length >= 7) {
        set.add(l.date.slice(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [logs, currentMonthKey]);

  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);

  // Month navigation helpers
  const currentMonthIndex = availableMonths.indexOf(selectedMonth);
  const canGoNewer = currentMonthIndex > 0;
  const canGoOlder = currentMonthIndex < availableMonths.length - 1;

  const handlePrevMonth = () => {
    if (canGoOlder) setSelectedMonth(availableMonths[currentMonthIndex + 1]);
  };

  const handleNextMonth = () => {
    if (canGoNewer) setSelectedMonth(availableMonths[currentMonthIndex - 1]);
  };

  // Month metadata
  const [yearNum, monthNum] = (selectedMonth || currentMonthKey).split('-').map(Number);
  const monthDate = new Date(yearNum, monthNum - 1, 1);
  const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const isCurrentMonth = selectedMonth === currentMonthKey;

  const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
  const todayDay = new Date().getDate();
  const currentDayInMonth = isCurrentMonth ? Math.min(daysInMonth, todayDay) : daysInMonth;
  const daysRemaining = isCurrentMonth ? Math.max(0, daysInMonth - currentDayInMonth) : 0;
  const daysPassed = currentDayInMonth;

  // Filter logs for this month
  const monthLogs = useMemo(() => {
    return logs.filter((l) => l.date && l.date.startsWith(selectedMonth));
  }, [logs, selectedMonth]);

  // Aggregate monthly spending
  const totalSpentThisMonth = useMemo(() => {
    return monthLogs.reduce((sum, l) => sum + (Number(l.total_spending) || 0), 0);
  }, [monthLogs]);

  // Category breakdown
  const categorySpending = useMemo(() => {
    const food = monthLogs.reduce((acc, l) => acc + (Number(l.spending_food) || 0), 0);
    const entertainment = monthLogs.reduce((acc, l) => acc + (Number(l.spending_entertainment) || 0), 0);
    const study = monthLogs.reduce((acc, l) => acc + (Number(l.spending_study) || 0), 0);
    const shopping = monthLogs.reduce((acc, l) => acc + (Number(l.spending_shopping) || 0), 0);
    const misc = monthLogs.reduce((acc, l) => acc + (Number(l.spending_misc) || 0), 0);
    return [
      { name: 'Food & Dining', val: food, color: 'bg-amber-500' },
      { name: 'Fun & Entertainment', val: entertainment, color: 'bg-indigo-500' },
      { name: 'Books & Study', val: study, color: 'bg-emerald-500' },
      { name: 'Shopping', val: shopping, color: 'bg-rose-500' },
      { name: 'Misc Discretionary', val: misc, color: 'bg-slate-400' },
    ].filter((c) => c.val > 0);
  }, [monthLogs]);

  const allowance = Number(monthlyAllowance) || 1500;
  const dailyBudgetTarget = Math.round(allowance / daysInMonth);
  const remainingAllowance = allowance - totalSpentThisMonth;
  const pctSpent = allowance > 0 ? Math.round((totalSpentThisMonth / allowance) * 100) : 0;
  const timeElapsedPct = Math.round((daysPassed / daysInMonth) * 100);

  // Dynamic safe daily spend for remaining days
  const dynamicSafeDaily =
    isCurrentMonth && daysRemaining > 0
      ? remainingAllowance > 0
        ? Math.round(remainingAllowance / daysRemaining)
        : 0
      : dailyBudgetTarget;

  // Average daily spend so far
  const daysLoggedCount = monthLogs.length;
  const avgDailySpend = daysLoggedCount > 0 ? Math.round(totalSpentThisMonth / daysLoggedCount) : 0;
  const projectedMonthEndSpend = Math.round(avgDailySpend * daysInMonth);
  const projectedSurplus = allowance - projectedMonthEndSpend;

  // Adherence status
  const isOverBudget = remainingAllowance < 0;
  const isBurningFast = !isOverBudget && pctSpent > timeElapsedPct + 12;
  const isOnTrack = !isOverBudget && !isBurningFast;

  const handleSaveAllowance = () => {
    const val = Math.max(500, Math.round(Number(draftAllowance) || 1500));
    onUpdateAllowance?.(val);
    setIsEditing(false);
  };

  const handleCancelEditing = () => {
    setDraftAllowance(allowance);
    setIsEditing(false);
  };

  return (
    <div className="rounded-3xl p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
      {/* Top Bar: Title, Month Selector & Edit Allowance Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Monthly Allowance &amp; Budget
              </h2>
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isOverBudget
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    : isBurningFast
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                }`}
              >
                {isOverBudget ? 'Over Limit ⚠️' : isBurningFast ? 'Burn Rate High ⚡' : 'On Track 🎯'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your college pocket money tracker • Real-time burn rate &amp; safe daily spending
            </p>
          </div>
        </div>

        {/* Controls: Month Selector & Edit Allowance Trigger */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Month Navigator */}
          <div className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={!canGoOlder}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-semibold text-slate-700 dark:text-slate-200 min-w-[100px] text-center">
              {monthName}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              disabled={!canGoNewer}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Edit Allowance Button */}
          {!isEditing ? (
            <button
              type="button"
              onClick={() => {
                setDraftAllowance(allowance);
                setIsEditing(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Allowance</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCancelEditing}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          )}
        </div>
      </div>

      {/* Inline Allowance Editor Modal/Drawer */}
      {isEditing && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Set Your Monthly Pocket Allowance
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400">
              Syncs with What-If Lab &amp; Future Projections
            </span>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2">
            {ALLOWANCE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setDraftAllowance(preset.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  draftAllowance === preset.value
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-700'
                }`}
              >
                <span>{preset.label}</span>
                <span className="block text-[10px] font-normal opacity-80">{preset.desc}</span>
              </button>
            ))}
          </div>

          {/* Custom Input & Live Breakdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Custom:</span>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="500"
                  max="50000"
                  step="100"
                  value={draftAllowance}
                  onChange={(e) => setDraftAllowance(Math.max(0, Number(e.target.value)))}
                  className="w-36 pl-7 pr-3 py-1.5 text-sm font-bold rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <span className="text-xs text-slate-500">/ month</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right text-[11px] text-slate-600 dark:text-slate-300">
                <span>Daily: <strong>₹{Math.round(draftAllowance / 30)}/day</strong></span>
                <span className="mx-1.5">•</span>
                <span>Weekly: <strong>₹{Math.round(draftAllowance / 4.3)}/wk</strong></span>
              </div>
              <button
                type="button"
                onClick={handleSaveAllowance}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all inline-flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Allowance</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4 Core Financial Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Monthly Allowance */}
        <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Allowance
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
            ₹{allowance.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500">
            Budget pace: ~₹{dailyBudgetTarget}/day
          </div>
        </div>

        {/* Metric 2: Spent This Month */}
        <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Spent This Month
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
            ₹{Math.round(totalSpentThisMonth).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500">
            {daysLoggedCount} days logged • {pctSpent}% used
          </div>
        </div>

        {/* Metric 3: Remaining Allowance */}
        <div
          className={`p-4 rounded-2xl border space-y-1 ${
            isOverBudget
              ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-900/60'
              : remainingAllowance < allowance * 0.2
              ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-900/60'
              : 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/60'
          }`}
        >
          <div
            className={`text-[11px] font-bold uppercase tracking-wider ${
              isOverBudget
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-700 dark:text-emerald-400'
            }`}
          >
            {isOverBudget ? 'Over Budget By' : 'Allowance Left'}
          </div>
          <div
            className={`text-lg sm:text-2xl font-black ${
              isOverBudget
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-700 dark:text-emerald-400'
            }`}
          >
            ₹{Math.abs(Math.round(remainingAllowance)).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {isOverBudget
              ? 'Cap discretionary spends'
              : `${Math.round(100 - pctSpent)}% balance remaining`}
          </div>
        </div>

        {/* Metric 4: Safe Daily Pace */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100/80 dark:border-indigo-900/60 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Safe Daily Pace
          </div>
          <div className="text-lg sm:text-2xl font-black text-indigo-700 dark:text-indigo-300">
            ₹{dynamicSafeDaily}
            <span className="text-xs font-normal text-slate-400">/day</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {isCurrentMonth && daysRemaining > 0
              ? `${daysRemaining} days left in ${monthDate.toLocaleDateString('en-US', { month: 'short' })}`
              : 'Target budget rate'}
          </div>
        </div>
      </div>

      {/* Progress Bar & Calendar Pace Comparison */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between text-xs font-semibold gap-2">
          <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <span>Budget Consumed:</span>
            <strong className="text-slate-900 dark:text-white">{pctSpent}%</strong>
            <span className="text-slate-400 font-normal">
              (₹{Math.round(totalSpentThisMonth)} / ₹{allowance})
            </span>
          </span>

          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            🗓️ Day {daysPassed} of {daysInMonth} ({timeElapsedPct}% of month elapsed)
          </span>
        </div>

        {/* Dual Marker Progress Bar */}
        <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOverBudget
                ? 'bg-rose-500'
                : isBurningFast
                ? 'bg-amber-500'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500'
            }`}
            style={{ width: `${Math.min(100, pctSpent)}%` }}
          />
        </div>

        {/* Narrative Insight */}
        <div className="flex items-start justify-between gap-3 text-xs pt-1">
          <div className="flex items-center gap-2">
            {isOverBudget ? (
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            ) : isBurningFast ? (
              <TrendingUp className="w-4 h-4 text-amber-500 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            )}
            <span className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              {isOverBudget ? (
                <>
                  You have spent <strong>₹{Math.abs(remainingAllowance)}</strong> over your monthly allowance with{' '}
                  {daysRemaining} days remaining in {monthName}.
                </>
              ) : isBurningFast ? (
                <>
                  You have consumed <strong>{pctSpent}%</strong> of your allowance in {timeElapsedPct}% of the month.
                  Limit daily spending to <strong>₹{dynamicSafeDaily}/day</strong> to finish safely.
                </>
              ) : (
                <>
                  Pacing smoothly! You are spending within your <strong>₹{dailyBudgetTarget}/day</strong> limit with{' '}
                  <strong>₹{remainingAllowance}</strong> remaining for {daysRemaining} days.
                </>
              )}
            </span>
          </div>

          {/* Toggle Category Breakdown */}
          {categorySpending.length > 0 && (
            <button
              type="button"
              onClick={() => setShowCategoryBreakdown((prev) => !prev)}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
            >
              {showCategoryBreakdown ? 'Hide Breakdown' : 'View Categories'}
            </button>
          )}
        </div>
      </div>

      {/* Expandable Category Spending Breakdown */}
      {showCategoryBreakdown && categorySpending.length > 0 && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Where Your Allowance Went in {monthName}
            </span>
            <span className="text-slate-400 text-[11px]">
              Avg ₹{avgDailySpend}/day across {daysLoggedCount} logged days
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {categorySpending.map((cat) => {
              const catPct = totalSpentThisMonth > 0 ? Math.round((cat.val / totalSpentThisMonth) * 100) : 0;
              return (
                <div
                  key={cat.name}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                    <span className="font-medium text-slate-700 dark:text-slate-300">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 dark:text-white">
                      ₹{Math.round(cat.val).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">({catPct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Projected Month-End Forecast */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <span>
              Forecast at current pace: Projected month-end spend <strong>₹{projectedMonthEndSpend.toLocaleString('en-IN')}</strong>
            </span>
            <span
              className={`font-bold ${
                projectedSurplus >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {projectedSurplus >= 0
                ? `+₹${projectedSurplus.toLocaleString('en-IN')} surplus`
                : `-₹${Math.abs(projectedSurplus).toLocaleString('en-IN')} deficit`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
