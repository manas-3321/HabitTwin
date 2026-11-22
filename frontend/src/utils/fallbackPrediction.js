/**
 * Fallback Prediction Generator for HabitTwin
 * Ensures that if the backend is waking up or offline, the UI renders
 * full illustrative scenarios and avatars instead of an empty screen.
 */

export function getFallbackPrediction(horizon = '6_months', whatIf = null) {
  const is5Years = horizon === '5_years';
  const monthsCount = is5Years ? 60 : 6;

  const baseline = {
    sleep_hours: whatIf?.sleep_hours ?? 7.5,
    screen_time_hours: whatIf?.screen_time_hours ?? 4.5,
    physical_activity_minutes: whatIf?.physical_activity_minutes ?? 45,
    study_hours: whatIf?.study_hours ?? 4.0,
    daily_spending: whatIf?.daily_spending ?? 50,
  };

  // Base metrics for Current Path
  const curStudy = baseline.study_hours;
  const curSleep = baseline.sleep_hours;
  const curScreen = baseline.screen_time_hours;
  const curActivity = baseline.physical_activity_minutes;
  const curSpend = baseline.daily_spending;
  const baseAllowance = whatIf?.monthly_allowance ?? whatIf?.monthly_income ?? 1500;

  // Algorithmic CGPA estimate
  const baseGpa = Math.min(9.8, Math.max(4.0, 6.2 + curStudy * 0.45 + (curSleep >= 7 && curSleep <= 9 ? 0.4 : -0.3) - (curScreen > 5 ? 0.3 : 0)));
  const baseHealth = Math.min(95, Math.max(30, 50 + (curActivity / 60) * 25 + (curSleep >= 7 ? 15 : 0) - (curScreen > 6 ? 10 : 0)));
  const baseEnergy = Math.min(95, Math.max(25, 45 + (curSleep >= 7 ? 25 : 0) + (curActivity > 30 ? 15 : 0) - (curScreen > 5 ? 15 : 0)));
  const baseBurnout = Math.min(85, Math.max(5, (curScreen > 6 ? 35 : 15) + (curSleep < 6 ? 30 : 5) + (curStudy > 8 ? 20 : 0)));
  const baseSavings = Math.max(0, (baseAllowance - curSpend * 30) * (is5Years ? 60 : 6));

  const buildTrajectory = (gpaStart, gpaEnd, healthStart, healthEnd) => {
    const points = [];
    const stepCount = is5Years ? 5 : 6;
    for (let i = 0; i < stepCount; i++) {
      const factor = (i + 1) / stepCount;
      points.push({
        period_label: is5Years ? `Year ${i + 1}` : `Month ${i + 1}`,
        period_index: i,
        academic_gpa: Number((gpaStart + (gpaEnd - gpaStart) * factor).toFixed(2)),
        health_index: Number((healthStart + (healthEnd - healthStart) * factor).toFixed(1)),
        projected_savings: Math.round(baseSavings * factor),
        lifestyle_score: Number((70 + factor * 15).toFixed(1)),
      });
    }
    return points;
  };

  const scenario_a = {
    id: 'scenario_a_current',
    name: 'Current Path',
    description: 'Projects your existing habit routine forward in time.',
    horizon,
    assumed_habits: baseline,
    metrics: {
      academic_gpa: Number(baseGpa.toFixed(2)),
      academic_percentile: Math.min(99, Math.round(baseGpa * 10)),
      mental_grasp_score: Math.min(95, Math.round(65 + curStudy * 4)),
      exam_recall_rate: Math.min(95, Math.round(60 + curStudy * 4.5)),
      exam_blankout_risk: Math.max(5, Math.round(40 - curStudy * 3 - (curSleep >= 7 ? 10 : 0))),
      health_index: Number(baseHealth.toFixed(1)),
      fitness_score: Math.min(95, Math.round(curActivity * 1.2)),
      energy_score: Number(baseEnergy.toFixed(1)),
      burnout_risk: Number(baseBurnout.toFixed(1)),
      projected_savings: Math.round(baseSavings),
      monthly_net_cashflow: Math.round(baseAllowance - curSpend * 30),
      savings_rate_pct: 45,
      financial_health_score: Math.min(95, Math.round(50 + (baseAllowance - curSpend * 30) * 0.05)),
      overall_lifestyle_score: Number(((baseGpa * 10 + baseHealth + baseEnergy + (100 - baseBurnout)) / 4).toFixed(1)),
    },
    avatar: {
      posture: baseEnergy > 60 ? 'upright' : 'neutral',
      expression: baseGpa >= 8.0 ? 'radiant' : baseGpa >= 6.0 ? 'focused' : 'tired',
      aura_color: baseGpa >= 8.0 ? '#10B981' : baseGpa >= 6.0 ? '#F59E0B' : '#F43F5E',
      aura_intensity: 0.85,
      energy_level: Math.round(baseEnergy),
      accessories: baseGpa >= 8.0 ? ['graduation_cap', 'smartwatch'] : ['smartwatch'],
      environment_theme: 'sunlit_loft',
      badge_title: baseGpa >= 8.0 ? 'High Achiever' : 'Steady Learner',
    },
    trajectory: buildTrajectory(baseGpa - 0.4, baseGpa, baseHealth - 5, baseHealth),
  };

  // Improved Path
  const impGpa = Math.min(9.95, baseGpa + 0.65);
  const impHealth = Math.min(98, baseHealth + 12);
  const impEnergy = Math.min(96, baseEnergy + 15);
  const impBurnout = Math.max(4, baseBurnout - 15);
  const impSavings = Math.round(baseSavings + (is5Years ? 45000 : 9000));

  const scenario_b = {
    id: 'scenario_b_improved',
    name: 'Optimized Twin',
    description: 'Micro-habits optimized (+1h study, +20m activity, -1h screen).',
    horizon,
    assumed_habits: {
      ...baseline,
      study_hours: baseline.study_hours + 1.0,
      sleep_hours: Math.min(8.5, baseline.sleep_hours + 0.5),
      screen_time_hours: Math.max(1.5, baseline.screen_time_hours - 1.0),
      physical_activity_minutes: baseline.physical_activity_minutes + 20,
    },
    metrics: {
      academic_gpa: Number(impGpa.toFixed(2)),
      academic_percentile: Math.min(99, Math.round(impGpa * 10)),
      mental_grasp_score: Math.min(98, Math.round(scenario_a.metrics.mental_grasp_score + 10)),
      exam_recall_rate: Math.min(98, Math.round(scenario_a.metrics.exam_recall_rate + 12)),
      exam_blankout_risk: Math.max(3, Math.round(scenario_a.metrics.exam_blankout_risk - 8)),
      health_index: Number(impHealth.toFixed(1)),
      fitness_score: Math.min(98, Math.round(scenario_a.metrics.fitness_score + 16)),
      energy_score: Number(impEnergy.toFixed(1)),
      burnout_risk: Number(impBurnout.toFixed(1)),
      projected_savings: impSavings,
      monthly_net_cashflow: scenario_a.metrics.monthly_net_cashflow + 500,
      savings_rate_pct: 68,
      financial_health_score: 88,
      overall_lifestyle_score: Number(((impGpa * 10 + impHealth + impEnergy + (100 - impBurnout)) / 4).toFixed(1)),
    },
    avatar: {
      posture: 'upright',
      expression: 'radiant',
      aura_color: '#10B981',
      aura_intensity: 0.95,
      energy_level: Math.round(impEnergy),
      accessories: ['graduation_cap', 'golden_sparkles', 'smartwatch'],
      environment_theme: 'sunlit_loft',
      badge_title: 'Peak Future Twin',
    },
    trajectory: buildTrajectory(impGpa - 0.5, impGpa, impHealth - 6, impHealth),
  };

  return {
    horizon,
    baseline_habits: baseline,
    scenario_a_current: scenario_a,
    scenario_b_improved: scenario_b,
    scenario_custom: null,
    delta_summary: {
      gpa_gain: Number((impGpa - baseGpa).toFixed(2)),
      health_gain: Number((impHealth - baseHealth).toFixed(1)),
      energy_gain: Number((impEnergy - baseEnergy).toFixed(1)),
      burnout_reduction: Number((baseBurnout - impBurnout).toFixed(1)),
      savings_differential: impSavings - baseSavings,
      lifestyle_gain: Number((scenario_b.metrics.overall_lifestyle_score - scenario_a.metrics.overall_lifestyle_score).toFixed(1)),
      grasp_gain: scenario_b.metrics.mental_grasp_score - scenario_a.metrics.mental_grasp_score,
      recall_gain: scenario_b.metrics.exam_recall_rate - scenario_a.metrics.exam_recall_rate,
      blankout_reduction: scenario_a.metrics.exam_blankout_risk - scenario_b.metrics.exam_blankout_risk,
    },
    disclaimer:
      'Illustrative Simulation Notice: HabitTwin projections are educational lifestyle simulations built for reflection and motivation.',
  };
}
