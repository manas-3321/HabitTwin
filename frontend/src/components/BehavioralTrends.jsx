import React from 'react';
import {
  Flame,
  Moon,
  Smartphone,
  Dumbbell,
  BookOpen,
  IndianRupee,
  Lightbulb,
  Link2,
} from 'lucide-react';
import GitHubContributionHeatmap from './GitHubContributionHeatmap';

function friendlyStrengthBadge(strength) {
  switch (strength) {
    case 'strong_positive':
      return { text: 'Goes Hand-in-Hand', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' };
    case 'moderate_positive':
      return { text: 'Gentle Boost', color: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300' };
    case 'strong_negative':
      return { text: 'Trades Off Strongly', color: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' };
    case 'moderate_negative':
      return { text: 'Competes For Time', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' };
    default:
      return { text: 'Independent', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' };
  }
}

// Strip raw "(r=-0.73)" technical annotations so explanations read naturally to everyday users
function cleanNarrativeText(text) {
  return (text || '').replace(/\s*\(r\s*=\s*-?\d+(\.\d+)?\)/gi, '');
}

export default function BehavioralTrends({ analysis, logs = [], monthlyAllowance = 1500 }) {
  if (!analysis) return null;

  const { summary, streaks, correlations, insights } = analysis;
  const spendTotal = summary.avg_daily_spending || 1;
  const targetDaily = Math.round((Number(monthlyAllowance) || 1500) / 30);
  const categories = [
    { name: 'Food & Dining', val: summary.spending_breakdown?.food || 0, color: 'bg-amber-500' },
    { name: 'Entertainment', val: summary.spending_breakdown?.entertainment || 0, color: 'bg-indigo-500' },
    { name: 'Shopping', val: summary.spending_breakdown?.shopping || 0, color: 'bg-rose-500' },
    { name: 'Study & Books', val: summary.spending_breakdown?.study || 0, color: 'bg-emerald-500' },
    { name: 'Other', val: summary.spending_breakdown?.misc || 0, color: 'bg-slate-400' },
  ];

  const consistencyLabel =
    summary.consistency_score >= 80
      ? 'Very Steady Rhythm'
      : summary.consistency_score >= 60
      ? 'Building Good Consistency'
      : 'Day-to-Day Swings';

  return (
    <section className="space-y-6">
      {/* Top Row: Averages & Streaks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Everyday Snapshot */}
        <div className="lg:col-span-2 rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Your Everyday Averages
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Based on {summary.total_days_logged} tracked day{summary.total_days_logged === 1 ? '' : 's'}
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              {Math.round(summary.consistency_score)}% • {consistencyLabel}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
              <Moon className="w-4 h-4 text-indigo-500 mb-1.5" />
              <div className="text-xl font-bold text-slate-900 dark:text-white">{summary.avg_sleep_hours}h</div>
              <div className="text-[11px] text-slate-500">Avg Sleep</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
              <Smartphone className="w-4 h-4 text-amber-500 mb-1.5" />
              <div className="text-xl font-bold text-slate-900 dark:text-white">{summary.avg_screen_time_hours}h</div>
              <div className="text-[11px] text-slate-500">Screen Time</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
              <Dumbbell className="w-4 h-4 text-emerald-500 mb-1.5" />
              <div className="text-xl font-bold text-slate-900 dark:text-white">{Math.round(summary.avg_physical_activity_minutes)}m</div>
              <div className="text-[11px] text-slate-500">Daily Activity</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
              <BookOpen className="w-4 h-4 text-sky-500 mb-1.5" />
              <div className="text-xl font-bold text-slate-900 dark:text-white">{summary.avg_study_hours}h</div>
              <div className="text-[11px] text-slate-500">Focused Study</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 col-span-2 sm:col-span-1">
              <IndianRupee className="w-4 h-4 text-rose-500 mb-1.5" />
              <div className="text-xl font-bold text-slate-900 dark:text-white">₹{Math.round(summary.avg_daily_spending).toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-slate-500">Daily Spend</div>
            </div>
          </div>

          {/* Active Streaks */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 text-xs">
              <Flame className="w-4 h-4 text-orange-500 shrink-0" />
              <span className="text-slate-600 dark:text-slate-300">
                <strong>{streaks.logging_streak_days}d</strong> check-in streak
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Flame className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="text-slate-600 dark:text-slate-300">
                <strong>{streaks.optimal_sleep_streak_days}d</strong> 7h+ sleep streak
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Flame className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-slate-600 dark:text-slate-300">
                <strong>{streaks.active_exercise_streak_days}d</strong> active streak
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Flame className="w-4 h-4 text-sky-500 shrink-0" />
              <span className="text-slate-600 dark:text-slate-300">
                <strong>{streaks.study_consistency_streak_days}d</strong> study streak
              </span>
            </div>
          </div>
        </div>

        {/* Where Daily Spending Goes */}
        <div className="rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Where Your Daily Budget Goes
              </h3>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg">
                ₹{Number(monthlyAllowance).toLocaleString('en-IN')}/mo allowance
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Avg ₹{Math.round(summary.avg_daily_spending).toLocaleString('en-IN')}/day • Allowance target ~₹{targetDaily}/day
            </p>
            <div className="space-y-3">
              {categories.map((cat) => {
                const pct = Math.min(100, Math.round((cat.val / spendTotal) * 100));
                return (
                  <div key={cat.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{cat.name}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">₹{Math.round(cat.val).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Allowance Pacing Status Footer */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Allowance Pacing:</span>
            {summary.avg_daily_spending <= targetDaily ? (
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                ✅ Under allowance pace (+₹{Math.round(monthlyAllowance - summary.avg_daily_spending * 30).toLocaleString('en-IN')} projected cushion)
              </span>
            ) : (
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                ⚡ Pacing ₹{Math.round(summary.avg_daily_spending - targetDaily)}/day above allowance
              </span>
            )}
          </div>
        </div>
      </div>

      {/* GitHub-Style 52-Week Habit Contribution Calendar */}
      <GitHubContributionHeatmap logs={logs} />

      {/* Bottom Row: Friendly Insights + Plain-English Habit Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personalized Highlights */}
        <div className="rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Key Takeaways From Your Routine
            </h3>
          </div>
          <ul className="space-y-2.5">
            {insights.map((tip, idx) => (
              <li
                key={idx}
                className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800"
              >
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Habit Ripple Connections */}
        <div className="rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Link2 className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              How Your Habits Influence Each Other
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Patterns spotted automatically across your daily check-ins
          </p>
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {correlations
              .filter((c) => c.strength !== 'neutral')
              .slice(0, 4)
              .map((item) => {
                const badge = friendlyStrengthBadge(item.strength);
                return (
                  <div
                    key={item.pair_name}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {item.pair_name}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.color}`}>
                        {badge.text}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {cleanNarrativeText(item.interpretation)}
                    </p>
                  </div>
                );
              })}
            {correlations.filter((c) => c.strength !== 'neutral').length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center">
                Log at least 3–5 days of habits (or load sample data) to see how your sleep, screen time, and study interact.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
