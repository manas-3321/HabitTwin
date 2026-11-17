import React from 'react';
import {
  GraduationCap,
  HeartPulse,
  Wallet,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Zap,
  ShieldCheck,
  Flame,
  ArrowUpRight,
  Layers,
  Brain,
} from 'lucide-react';
import FutureTwinAvatar from './FutureTwinAvatar';

function formatMoney(amount) {
  const sign = amount < 0 ? '-' : '';
  return `${sign}₹${Math.abs(Math.round(amount)).toLocaleString('en-IN')}`;
}

function getPillarHeat(score) {
  if (score >= 90) {
    return {
      bg: 'bg-emerald-500/20 dark:bg-emerald-500/25 border-emerald-300 dark:border-emerald-600/50 text-emerald-950 dark:text-emerald-100',
      badge: 'bg-emerald-600 text-white',
      label: 'Peak Flow',
      barColor: 'bg-emerald-500',
    };
  }
  if (score >= 78) {
    return {
      bg: 'bg-teal-500/15 dark:bg-teal-500/20 border-teal-300 dark:border-teal-600/50 text-teal-950 dark:text-teal-100',
      badge: 'bg-teal-600 text-white',
      label: 'Thriving',
      barColor: 'bg-teal-500',
    };
  }
  if (score >= 65) {
    return {
      bg: 'bg-cyan-500/15 dark:bg-cyan-500/20 border-cyan-300 dark:border-cyan-600/40 text-cyan-950 dark:text-cyan-100',
      badge: 'bg-cyan-600 text-white',
      label: 'Healthy',
      barColor: 'bg-cyan-500',
    };
  }
  if (score >= 50) {
    return {
      bg: 'bg-amber-500/15 dark:bg-amber-500/20 border-amber-300 dark:border-amber-600/40 text-amber-950 dark:text-amber-100',
      badge: 'bg-amber-600 text-white',
      label: 'Coasting',
      barColor: 'bg-amber-500',
    };
  }
  return {
    bg: 'bg-rose-500/15 dark:bg-rose-500/20 border-rose-300 dark:border-rose-600/40 text-rose-950 dark:text-rose-100',
    badge: 'bg-rose-600 text-white',
    label: 'Strained',
    barColor: 'bg-rose-500',
  };
}

function ScenarioSummaryCard({ scenario, accent, labelBadge }) {
  const { metrics, avatar, assumed_habits } = scenario;
  const isImproved = scenario.id === 'scenario_b_improved';

  return (
    <div
      className={`rounded-3xl p-6 border transition-all bg-white dark:bg-slate-900 shadow-sm ${
        isImproved
          ? 'border-emerald-200 dark:border-emerald-800/70 ring-1 ring-emerald-500/15'
          : 'border-amber-200/80 dark:border-amber-900/50'
      }`}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between gap-2 mb-5">
        <div>
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide mb-1.5 ${
              isImproved
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
            }`}
          >
            {labelBadge}
          </span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{scenario.name}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isImproved
              ? 'With restful sleep, active movement & smart budgeting'
              : 'If your recent daily habits stay right where they are'}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs font-medium text-slate-400">Life Score</div>
          <div
            className={`text-3xl font-extrabold ${
              isImproved ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {Math.round(metrics.overall_lifestyle_score)}
            <span className="text-sm font-medium text-slate-400">/100</span>
          </div>
        </div>
      </div>

      {/* Animated Future Twin Avatar */}
      <div className="flex justify-center py-2 mb-5">
        <FutureTwinAvatar avatar={avatar} compact />
      </div>

      {/* 4 Key Outcome Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
            <span>Projected CGPA</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {metrics.academic_gpa.toFixed(2)}
            <span className="text-xs font-normal text-slate-400 ml-1">/ 10.0</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-medium">
            <Brain className="w-3 h-3 text-purple-500" />
            <span>Grasp: {Math.round(metrics.mental_grasp_score ?? 80)}%</span>
            <span>• Blank-out: {Math.round(metrics.exam_blankout_risk ?? 15)}%</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
            <span>Health &amp; Vitality</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {Math.round(metrics.health_index)}
            <span className="text-xs font-normal text-slate-400 ml-1">/ 100</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Wallet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Projected Savings</span>
          </div>
          <div
            className={`text-xl font-bold mt-1 ${
              metrics.projected_savings >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatMoney(metrics.projected_savings)}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Stress / Burnout Risk</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {Math.round(metrics.burnout_risk)}%
            <span className="text-xs font-normal text-slate-400 ml-1">
              {metrics.burnout_risk > 65 ? '(High)' : metrics.burnout_risk > 40 ? '(Moderate)' : '(Low)'}
            </span>
          </div>
        </div>
      </div>

      {/* Routine Snapshot Pills */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
          Sleep: <strong>{assumed_habits.sleep_hours}h</strong>
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800" title="Total daily screen time including study laptop and phone">
          Total Screen: <strong>{assumed_habits.screen_time_hours}h</strong> (incl. study)
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
          Active: <strong>{Math.round(assumed_habits.physical_activity_minutes)}m</strong>
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
          Study: <strong>{assumed_habits.study_hours}h</strong>
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
          Spend: <strong>₹{assumed_habits.daily_spending}/day</strong>
        </span>
      </div>
    </div>
  );
}

export default function ScenarioComparison({ prediction }) {
  if (!prediction) return null;

  const { scenario_a_current: cur, scenario_b_improved: imp, delta_summary, horizon } = prediction;
  const horizonLabel = horizon === '5_years' ? '5 Years' : '6 Months';

  // 5 Core Life Pillars for the Comparison Heat Map
  const PILLARS = [
    {
      id: 'academics',
      name: 'Academic CGPA',
      desc: 'Semester grades & study efficiency',
      icon: GraduationCap,
      accent: 'text-indigo-500',
      curValue: `${cur.metrics.academic_gpa.toFixed(2)} CGPA`,
      impValue: `${imp.metrics.academic_gpa.toFixed(2)} CGPA`,
      curScore: Math.min(100, Math.max(0, (cur.metrics.academic_gpa / 10.0) * 100)),
      impScore: Math.min(100, Math.max(0, (imp.metrics.academic_gpa / 10.0) * 100)),
      gainText: `+${delta_summary.gpa_gain.toFixed(2)} CGPA`,
      gainSub: 'Elevated academic standing',
    },
    {
      id: 'fitness',
      name: 'Physical Fitness',
      desc: 'Cardiovascular endurance & movement',
      icon: HeartPulse,
      accent: 'text-rose-500',
      curValue: `${Math.round(cur.metrics.fitness_score)} / 100`,
      impValue: `${Math.round(imp.metrics.fitness_score)} / 100`,
      curScore: cur.metrics.fitness_score,
      impScore: imp.metrics.fitness_score,
      gainText: `+${Math.round(imp.metrics.fitness_score - cur.metrics.fitness_score)} pts`,
      gainSub: 'Stronger body & stamina',
    },
    {
      id: 'energy',
      name: 'Daily Mental Vitality',
      desc: 'Sustained focus without midday fatigue',
      icon: Zap,
      accent: 'text-amber-500',
      curValue: `${Math.round(cur.metrics.energy_score)} / 100`,
      impValue: `${Math.round(imp.metrics.energy_score)} / 100`,
      curScore: cur.metrics.energy_score,
      impScore: imp.metrics.energy_score,
      gainText: `+${delta_summary.energy_gain} pts`,
      gainSub: 'Consistent daily alertness',
    },
    {
      id: 'stress',
      name: 'Calm & Stress Shield',
      desc: 'Resilience against chronic exhaustion',
      icon: ShieldCheck,
      accent: 'text-teal-500',
      curValue: `${Math.round(100 - cur.metrics.burnout_risk)} / 100`,
      impValue: `${Math.round(100 - imp.metrics.burnout_risk)} / 100`,
      curScore: 100 - cur.metrics.burnout_risk,
      impScore: 100 - imp.metrics.burnout_risk,
      gainText: `${delta_summary.burnout_reduction}% less burnout`,
      gainSub: 'Shielded mental health',
    },
    {
      id: 'finances',
      name: 'Financial Health & Savings',
      desc: 'Safety net & wealth trajectory',
      icon: Wallet,
      accent: 'text-emerald-500',
      curValue: formatMoney(cur.metrics.projected_savings),
      impValue: formatMoney(imp.metrics.projected_savings),
      curScore: cur.metrics.financial_health_score,
      impScore: imp.metrics.financial_health_score,
      gainText: `+${formatMoney(delta_summary.savings_differential)}`,
      gainSub: 'Debt-free emergency buffer',
    },
    {
      id: 'lifestyle',
      name: 'Overall Lifestyle Balance',
      desc: 'Holistic harmony across mind, body, & money',
      icon: Sparkles,
      accent: 'text-purple-500',
      curValue: `${Math.round(cur.metrics.overall_lifestyle_score)} / 100`,
      impValue: `${Math.round(imp.metrics.overall_lifestyle_score)} / 100`,
      curScore: cur.metrics.overall_lifestyle_score,
      impScore: imp.metrics.overall_lifestyle_score,
      gainText: `+${delta_summary.lifestyle_gain} pts`,
      gainSub: 'Total lifestyle elevation',
    },
  ];

  return (
    <section className="space-y-6">
      {/* Positive Impact Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 p-5 sm:p-6 text-white shadow-lg shadow-indigo-500/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-sm shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold">
              Your {horizonLabel} Future Snapshot
            </h2>
            <p className="text-sm text-indigo-50/90 mt-0.5">
              Adopting healthier everyday routines could raise your life score by{' '}
              <strong className="text-white">+{delta_summary.lifestyle_gain} pts</strong>, add{' '}
              <strong className="text-white">+{delta_summary.gpa_gain.toFixed(2)} CGPA</strong>, and grow savings by{' '}
              <strong className="text-white">{formatMoney(delta_summary.savings_differential)}</strong>.
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/15 text-xs font-semibold shrink-0">
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>{delta_summary.burnout_reduction > 0 ? `${delta_summary.burnout_reduction}% less burnout` : 'Balanced path'}</span>
        </div>
      </div>

      {/* Side-by-Side Future Self Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScenarioSummaryCard
          scenario={cur}
          labelBadge="Path A • If Nothing Changes"
        />
        <ScenarioSummaryCard
          scenario={imp}
          labelBadge="Path B • Healthier Routine"
        />
      </div>

      {/* Life Pillar Balance Comparison Heat Map Matrix */}
      <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Life Pillar Comparison Heat Map
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visual heat intensity comparing your current habits vs your healthier potential
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-block w-3 h-3 rounded-md bg-amber-500/40" />
            <span className="text-slate-500">Current</span>
            <span className="inline-block w-3 h-3 rounded-md bg-emerald-500/50 ml-2" />
            <span className="text-slate-500">Healthier</span>
          </div>
        </div>

        {/* Heat Map Matrix Table */}
        <div className="space-y-3 pt-2">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            const curHeat = getPillarHeat(pillar.curScore);
            const impHeat = getPillarHeat(pillar.impScore);

            return (
              <div
                key={pillar.id}
                className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                {/* Pillar Icon and Name */}
                <div className="flex items-center gap-3 md:w-1/3">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm shrink-0">
                    <Icon className={`w-4 h-4 ${pillar.accent}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {pillar.name}
                    </h4>
                    <p className="text-xs text-slate-400">{pillar.desc}</p>
                  </div>
                </div>

                {/* Heat Tile Comparison (Current vs Healthier) */}
                <div className="grid grid-cols-2 gap-3 flex-1">
                  {/* Current Path Heat Tile */}
                  <div
                    className={`p-3 rounded-2xl border flex flex-col justify-between ${curHeat.bg}`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold opacity-80">
                      <span>Current Path</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/40 dark:bg-slate-900/40">
                        {curHeat.label}
                      </span>
                    </div>
                    <div className="text-base font-extrabold mt-1">
                      {pillar.curValue}
                    </div>
                    <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mt-2">
                      <div
                        className={`h-full ${curHeat.barColor} rounded-full`}
                        style={{ width: `${Math.min(100, pillar.curScore)}%` }}
                      />
                    </div>
                  </div>

                  {/* Healthier Path Heat Tile */}
                  <div
                    className={`p-3 rounded-2xl border flex flex-col justify-between ring-1 ring-emerald-500/20 ${impHeat.bg}`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold opacity-90">
                      <span>Healthier Path</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/40 dark:bg-slate-900/40">
                        {impHeat.label}
                      </span>
                    </div>
                    <div className="text-base font-extrabold mt-1 text-emerald-950 dark:text-emerald-100">
                      {pillar.impValue}
                    </div>
                    <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mt-2">
                      <div
                        className={`h-full ${impHeat.barColor} rounded-full`}
                        style={{ width: `${Math.min(100, pillar.impScore)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Net Momentum Advantage Badge */}
                <div className="md:w-1/4 flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700/80 pt-2 md:pt-0 md:pl-4">
                  <span className="text-[11px] text-slate-400 font-medium">Momentum Gain</span>
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs shadow-sm">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>{pillar.gainText}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 hidden md:inline mt-0.5">
                    {pillar.gainSub}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
