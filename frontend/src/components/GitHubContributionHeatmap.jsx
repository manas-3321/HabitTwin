import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Trash2,
  Check,
  Sparkles,
  Info,
  X,
} from 'lucide-react';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const METRIC_FILTERS = [
  { id: 'all', label: 'All Habits (Discipline Score)' },
  { id: 'study', label: 'Focused Study (≥3 hrs)' },
  { id: 'sleep', label: 'Restful Sleep (7–9 hrs)' },
  { id: 'exercise', label: 'Movement & Workout (≥30m)' },
  { id: 'spending', label: 'Budget Discipline (≤₹350)' },
];

export default function GitHubContributionHeatmap({
  logs = [],
  prediction = null,
  title = null,
  onResetZero = null,
}) {
  const [metricFilter, setMetricFilter] = useState('all');
  const [calendarMode, setCalendarMode] = useState('history'); // 'history' | 'improved_future' | 'current_future'
  const [hoveredDay, setHoveredDay] = useState(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHoveringGrid, setIsHoveringGrid] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showExplainer, setShowExplainer] = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSettingsDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Build a lookup map of dateStr -> log
  const logsMap = useMemo(() => {
    const map = {};
    for (const log of logs) {
      if (log.date) map[log.date] = log;
    }
    return map;
  }, [logs]);

  // Handle cursor spotlight movement for permanent ambient effect
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Generate 52 weeks (364 days) of calendar tiles aligned to GitHub's Sunday-Saturday grid
  const { weeks, monthHeaders, totalContributions } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let endAnchor = new Date(today);
    // Align to the coming Saturday so the last column is complete (Sunday=0 ... Saturday=6)
    const dayOfWeek = endAnchor.getDay();
    endAnchor.setDate(endAnchor.getDate() + (6 - dayOfWeek));

    if (calendarMode !== 'history') {
      // Future projection starts from today and runs forward 52 weeks
      endAnchor = new Date(today);
      endAnchor.setDate(endAnchor.getDate() + 364);
      const dow = endAnchor.getDay();
      endAnchor.setDate(endAnchor.getDate() + (6 - dow));
    }

    const startAnchor = new Date(endAnchor);
    startAnchor.setDate(startAnchor.getDate() - (52 * 7 - 1));

    const weeksArr = [];
    const monthsArr = [];
    let lastMonthIdx = -1;
    let curr = new Date(startAnchor);
    let activeContributionsCount = 0;

    for (let w = 0; w < 52; w++) {
      const days = [];
      const colStartMonth = curr.getMonth();

      // Ensure month labels have at least 2-3 weeks of spacing
      if (colStartMonth !== lastMonthIdx && (monthsArr.length === 0 || w - monthsArr[monthsArr.length - 1].weekIdx >= 3)) {
        monthsArr.push({ weekIdx: w, label: MONTH_NAMES[colStartMonth] });
        lastMonthIdx = colStartMonth;
      }

      for (let d = 0; d < 7; d++) {
        const dateStr = curr.toISOString().split('T')[0];
        const isFuture = curr > today;
        let dayLog = logsMap[dateStr] || null;

        // Realistic simulation for forward scenarios
        if (calendarMode === 'improved_future') {
          const isWeekend = d === 0 || d === 6;
          const studyH = isWeekend ? 3.0 : 4.5;
          const leisureH = isWeekend ? 2.0 : 1.2;
          dayLog = {
            date: dateStr,
            sleep_hours: isWeekend ? 8.2 : 7.8,
            screen_time_hours: round1(studyH + leisureH), // Total screen includes study
            physical_activity_minutes: isWeekend ? 55 : 45,
            study_hours: studyH,
            total_spending: isWeekend ? 280 : 180,
            simulated: true,
          };
        } else if (calendarMode === 'current_future') {
          const isWeekend = d === 0 || d === 6;
          const studyH = isWeekend ? 0.8 : 2.2;
          const leisureH = isWeekend ? 6.2 : 4.2;
          dayLog = {
            date: dateStr,
            sleep_hours: isWeekend ? 5.5 : 6.0,
            screen_time_hours: round1(studyH + leisureH),
            physical_activity_minutes: isWeekend ? 10 : 20,
            study_hours: studyH,
            total_spending: isWeekend ? 650 : 420,
            simulated: true,
          };
        }

        // Calculate Level (0 to 4) based on metric
        let level = 0;
        let metGoals = 0;

        if (dayLog) {
          if (metricFilter === 'all') {
            const leisureScreen = Math.max(0, (dayLog.screen_time_hours || 0) - (dayLog.study_hours || 0));
            if (dayLog.sleep_hours >= 7.0 && dayLog.sleep_hours <= 9.0) metGoals++;
            if (dayLog.study_hours >= 3.0) metGoals++;
            if (dayLog.physical_activity_minutes >= 30) metGoals++;
            if (leisureScreen <= 2.5 || dayLog.total_spending <= 350) metGoals++;
            level = metGoals;
          } else if (metricFilter === 'study') {
            const st = dayLog.study_hours || 0;
            if (st >= 5.0) level = 4;
            else if (st >= 4.0) level = 3;
            else if (st >= 3.0) level = 2;
            else if (st >= 1.5) level = 1;
            metGoals = st >= 3.0 ? 1 : 0;
          } else if (metricFilter === 'sleep') {
            const sl = dayLog.sleep_hours || 0;
            if (sl >= 7.5 && sl <= 8.5) level = 4;
            else if (sl >= 7.0 && sl <= 9.0) level = 3;
            else if (sl >= 6.0 && sl <= 9.5) level = 2;
            else if (sl >= 5.0) level = 1;
            metGoals = sl >= 7.0 && sl <= 9.0 ? 1 : 0;
          } else if (metricFilter === 'exercise') {
            const ex = dayLog.physical_activity_minutes || 0;
            if (ex >= 50) level = 4;
            else if (ex >= 35) level = 3;
            else if (ex >= 25) level = 2;
            else if (ex >= 10) level = 1;
            metGoals = ex >= 30 ? 1 : 0;
          } else if (metricFilter === 'spending') {
            const sp = dayLog.total_spending || 0;
            if (sp <= 200) level = 4;
            else if (sp <= 300) level = 3;
            else if (sp <= 400) level = 2;
            else if (sp <= 550) level = 1;
            metGoals = sp <= 350 ? 1 : 0;
          }

          if (level > 0) {
            activeContributionsCount++;
          }
        }

        days.push({
          date: new Date(curr),
          dateStr,
          isFuture,
          log: dayLog,
          level: Math.min(4, Math.max(0, level)),
          metGoals,
        });

        curr.setDate(curr.getDate() + 1);
      }
      weeksArr.push(days);
    }

    return {
      weeks: weeksArr,
      monthHeaders: monthsArr,
      totalContributions: activeContributionsCount,
    };
  }, [logsMap, metricFilter, calendarMode]);

  // Authentic GitHub contribution colors (Light Mode default + Dark Mode support)
  const getSquareColor = (level) => {
    switch (level) {
      case 4:
        return 'bg-[#216e39] dark:bg-[#39d353] border-[#216e39] dark:border-[#39d353] shadow-[0_0_8px_rgba(33,110,57,0.4)] dark:shadow-[0_0_8px_rgba(57,211,83,0.7)]';
      case 3:
        return 'bg-[#30a14e] dark:bg-[#26a641] border-[#30a14e] dark:border-[#26a641] shadow-[0_0_5px_rgba(48,161,78,0.3)] dark:shadow-[0_0_5px_rgba(38,166,65,0.45)]';
      case 2:
        return 'bg-[#40c463] dark:bg-[#006d32] border-[#40c463] dark:border-[#006d32]';
      case 1:
        return 'bg-[#9be9a8] dark:bg-[#0e4429] border-[#9be9a8] dark:border-[#0e4429]';
      default:
        return 'bg-[#ebedf0] dark:bg-[#161b22] border-slate-200/80 dark:border-[rgba(255,255,255,0.05)]';
    }
  };

  const activeMetricLabel = METRIC_FILTERS.find((m) => m.id === metricFilter)?.label || 'All Habits';

  return (
    <div className="w-full space-y-2 select-none">
      {/* ================================================================= */}
      {/* 1. GitHub Header Bar: Outside the Box                             */}
      {/* ================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        {/* Left: Contributions in the last year */}
        <h3 className="text-sm sm:text-base font-medium text-slate-800 dark:text-[#e6edf3]">
          {totalContributions}{' '}
          {calendarMode === 'history'
            ? 'contributions in the last year'
            : calendarMode === 'improved_future'
            ? 'disciplined days projected on Healthier Path'
            : 'disciplined days projected on Current Path'}
        </h3>

        {/* Right: Contribution settings dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowSettingsDropdown((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-[#7d8590] hover:text-slate-900 dark:hover:text-[#e6edf3] font-medium transition-colors py-1 px-2.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#21262d]"
          >
            <span>Contribution settings</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-[#7d8590]" />
          </button>

          {/* Clean Dropdown Menu */}
          {showSettingsDropdown && (
            <div className="absolute right-0 mt-1 w-64 rounded-xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] shadow-xl z-50 py-1.5 text-xs text-slate-700 dark:text-[#e6edf3] animate-in fade-in duration-150">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 dark:text-[#7d8590] uppercase tracking-wider">
                Filter Contribution Activity
              </div>
              {METRIC_FILTERS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setMetricFilter(opt.id);
                    setShowSettingsDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-[#1f6feb] hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <span>{opt.label}</span>
                  {metricFilter === opt.id && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-white" />}
                </button>
              ))}

              {/* Reset to Zero Option */}
              {logs.length > 0 && onResetZero && (
                <>
                  <div className="my-1 border-t border-slate-100 dark:border-[#30363d]" />
                  <button
                    onClick={() => {
                      setShowSettingsDropdown(false);
                      onResetZero();
                    }}
                    className="w-full text-left px-3 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/20 flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset check-ins to zero</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. Main Area: Heatmap Container + Right-Side Year Selector        */}
      {/* ================================================================= */}
      <div className="flex flex-col lg:flex-row items-start gap-4">
        {/* Heatmap Box (GitHub Bordered Container in Light Mode) */}
        <div
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHoveringGrid(true)}
          onMouseLeave={() => {
            setIsHoveringGrid(false);
            setHoveredDay(null);
          }}
          className="relative flex-1 w-full overflow-hidden rounded-2xl p-4 sm:p-5 bg-white dark:bg-[#0d1117] border border-slate-200/90 dark:border-[#30363d] shadow-sm text-slate-800 dark:text-[#e6edf3] transition-all"
        >
          {/* Permanent Ambient Background Glows */}
          <div className="pointer-events-none absolute -top-16 -left-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl opacity-60" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl opacity-50" />

          {/* Interactive Cursor Spotlight */}
          {isHoveringGrid && (
            <div
              className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-200"
              style={{
                background: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, rgba(34, 197, 94, 0.12), transparent 75%)`,
              }}
            />
          )}

          {/* Scrollable Calendar Area */}
          <div className="relative z-10 overflow-x-auto pb-1">
            <div className="min-w-[700px]">
              {/* Month Header Row */}
              <div className="relative h-4 mb-1 pl-7 text-[11px] font-normal text-slate-500 dark:text-[#7d8590]">
                {monthHeaders.map((m, idx) => (
                  <span
                    key={idx}
                    className="absolute"
                    style={{ left: `${28 + m.weekIdx * 13}px` }}
                  >
                    {m.label}
                  </span>
                ))}
              </div>

              {/* Grid: Day of Week Column (Mon, Wed, Fri) + 52 Week Columns */}
              <div className="flex items-start gap-1">
                {/* Day Labels Column: aligned precisely to 10px squares + 3px gap */}
                <div className="flex flex-col gap-[3px] text-[10px] font-normal text-slate-400 dark:text-[#7d8590] w-7 shrink-0 select-none">
                  <span className="h-[10px] leading-[10px]" /> {/* Sun */}
                  <span className="h-[10px] leading-[10px]">Mon</span> {/* Mon */}
                  <span className="h-[10px] leading-[10px]" /> {/* Tue */}
                  <span className="h-[10px] leading-[10px]">Wed</span> {/* Wed */}
                  <span className="h-[10px] leading-[10px]" /> {/* Thu */}
                  <span className="h-[10px] leading-[10px]">Fri</span> {/* Fri */}
                  <span className="h-[10px] leading-[10px]" /> {/* Sat */}
                </div>

                {/* 52 Columns of 7 Squares */}
                <div className="flex gap-[3px]">
                  {weeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-[3px]">
                      {week.map((day, dIdx) => {
                        const colorClass = getSquareColor(day.level);
                        const isHovered = hoveredDay?.dateStr === day.dateStr;

                        return (
                          <div
                            key={dIdx}
                            onMouseEnter={() => setHoveredDay(day)}
                            className={`w-[10px] h-[10px] rounded-[2px] border transition-all duration-150 cursor-pointer ${colorClass} ${
                              isHovered
                                ? 'scale-150 z-30 ring-2 ring-emerald-500 shadow-[0_0_12px_rgba(34,197,94,0.8)] brightness-110'
                                : ''
                            }`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Tooltip Bar on Hover */}
          {hoveredDay && (
            <div className="relative z-20 mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] shadow-sm flex flex-wrap items-center justify-between gap-2 text-xs animate-in fade-in duration-100">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-[2px] ${
                    hoveredDay.level > 0 ? 'bg-[#30a14e] dark:bg-[#39d353]' : 'bg-[#ebedf0] dark:bg-[#161b22] border border-slate-300 dark:border-[#30363d]'
                  }`}
                />
                <span className="text-slate-800 dark:text-[#e6edf3] font-semibold">
                  {hoveredDay.date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  :
                </span>
                {hoveredDay.log ? (
                  <span className="text-slate-600 dark:text-[#7d8590]">
                    Sleep: <strong className="text-slate-900 dark:text-[#e6edf3]">{hoveredDay.log.sleep_hours}h</strong> • Study:{' '}
                    <strong className="text-slate-900 dark:text-[#e6edf3]">{hoveredDay.log.study_hours}h</strong> • Total Screen:{' '}
                    <strong className="text-slate-900 dark:text-[#e6edf3]">{hoveredDay.log.screen_time_hours}h</strong> (incl. study) • Active:{' '}
                    <strong className="text-slate-900 dark:text-[#e6edf3]">{Math.round(hoveredDay.log.physical_activity_minutes)}m</strong> • Spend:{' '}
                    <strong className="text-slate-900 dark:text-[#e6edf3]">₹{Math.round(hoveredDay.log.total_spending)}</strong>
                  </span>
                ) : (
                  <span className="text-slate-400">No habit check-in logged</span>
                )}
              </div>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-[#7d8590]">
                {hoveredDay.level === 4
                  ? 'Peak Discipline'
                  : hoveredDay.level === 3
                  ? 'Strong Habits'
                  : hoveredDay.level === 2
                  ? 'Moderate'
                  : hoveredDay.level === 1
                  ? 'Light Activity'
                  : 'Rest / No Data'}
              </span>
            </div>
          )}

          {/* Explainer Drawer (When clicking "Learn how we count contributions") */}
          {showExplainer && (
            <div className="relative z-20 mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] text-xs text-slate-600 dark:text-[#7d8590] space-y-2">
              <div className="flex items-center justify-between text-slate-900 dark:text-[#e6edf3] font-semibold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  How HabitTwin Counts Contributions
                </span>
                <button
                  onClick={() => setShowExplainer(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] leading-relaxed">
                Each day can earn up to 4 discipline points (represented by 4 shades of green):
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span><strong>Restful Sleep:</strong> 7.0 to 9.0 hours</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span><strong>Focused Study:</strong> ≥ 3.0 hours</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span><strong>Physical Movement:</strong> ≥ 30 minutes</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span><strong>Budget / Screen:</strong> Spend ≤ ₹350 OR phone leisure ≤ 2.5h</span>
                </li>
              </ul>
              <div className="text-[10px] text-slate-400 dark:text-[#7d8590] pt-1 border-t border-slate-200 dark:border-[#30363d]/60">
                Total Screen Time includes both study laptop hours and mobile phone leisure.
              </div>
            </div>
          )}

          {/* GitHub Card Footer: "Learn how we count contributions" & "Less [■■■■■] More" */}
          <div className="relative z-10 mt-3 pt-3 border-t border-slate-100 dark:border-[#30363d] flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-[#7d8590]">
            <button
              onClick={() => setShowExplainer((prev) => !prev)}
              className="text-slate-500 dark:text-[#7d8590] hover:text-indigo-600 dark:hover:text-[#58a6ff] hover:underline cursor-pointer transition-colors"
            >
              Learn how we count contributions
            </button>

            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <div className="flex gap-[3px] items-center">
                <span className="w-[10px] h-[10px] rounded-[2px] bg-[#ebedf0] dark:bg-[#161b22] border border-slate-200/80 dark:border-[rgba(255,255,255,0.05)]" />
                <span className="w-[10px] h-[10px] rounded-[2px] bg-[#9be9a8] dark:bg-[#0e4429] border border-[#9be9a8] dark:border-[#0e4429]" />
                <span className="w-[10px] h-[10px] rounded-[2px] bg-[#40c463] dark:bg-[#006d32] border border-[#40c463] dark:border-[#006d32]" />
                <span className="w-[10px] h-[10px] rounded-[2px] bg-[#30a14e] dark:bg-[#26a641] border border-[#30a14e] dark:border-[#26a641] shadow-[0_0_4px_rgba(48,161,78,0.3)]" />
                <span className="w-[10px] h-[10px] rounded-[2px] bg-[#216e39] dark:bg-[#39d353] border border-[#216e39] dark:border-[#39d353] shadow-[0_0_6px_rgba(33,110,57,0.4)]" />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* Right-Side Year / Timeline Selector (Matches GitHub's 2024, 2023) */}
        {/* ================================================================= */}
        <div className="flex sm:flex-row lg:flex-col gap-1 w-full lg:w-48 shrink-0">
          <button
            onClick={() => setCalendarMode('history')}
            className={`w-full text-left px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              calendarMode === 'history'
                ? 'bg-[#1f6feb] text-white shadow-sm'
                : 'text-slate-600 dark:text-[#7d8590] hover:text-slate-900 dark:hover:text-[#e6edf3] hover:bg-slate-100 dark:hover:bg-[#21262d]'
            }`}
          >
            2024 (Past Year)
          </button>
          <button
            onClick={() => setCalendarMode('improved_future')}
            className={`w-full text-left px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              calendarMode === 'improved_future'
                ? 'bg-[#1f6feb] text-white shadow-sm'
                : 'text-slate-600 dark:text-[#7d8590] hover:text-slate-900 dark:hover:text-[#e6edf3] hover:bg-slate-100 dark:hover:bg-[#21262d]'
            }`}
          >
            2025 (Healthier Path)
          </button>
          <button
            onClick={() => setCalendarMode('current_future')}
            className={`w-full text-left px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              calendarMode === 'current_future'
                ? 'bg-[#1f6feb] text-white shadow-sm'
                : 'text-slate-600 dark:text-[#7d8590] hover:text-slate-900 dark:hover:text-[#e6edf3] hover:bg-slate-100 dark:hover:bg-[#21262d]'
            }`}
          >
            2025 (Current Path)
          </button>

          {/* Quick Indicator Badge */}
          <div className="hidden lg:block mt-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#161b22] border border-slate-200/80 dark:border-[#30363d] text-[11px] text-slate-500 dark:text-[#7d8590] space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Ambient Active</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-[#7d8590]">
              Showing: <span className="font-semibold text-slate-700 dark:text-[#e6edf3]">{activeMetricLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function round1(val) {
  return Math.round(val * 10) / 10;
}
