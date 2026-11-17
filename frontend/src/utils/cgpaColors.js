/**
 * CGPA Color System:
 * - 8 above (>= 8.0): Green (Emerald)
 * - 6 above (>= 6.0): Yellow (Amber)
 * - 4 below (<= 4.0): Red (Rose)
 * - 4 to 6: Orange (Warning)
 */
export function getCgpaColorClass(cgpa) {
  const val = Number(cgpa);
  if (isNaN(val)) return 'text-slate-800 dark:text-slate-200';
  if (val >= 8.0) {
    return 'text-emerald-600 dark:text-emerald-400';
  }
  if (val >= 6.0) {
    return 'text-amber-500 dark:text-amber-400';
  }
  if (val <= 4.0) {
    return 'text-rose-600 dark:text-rose-400';
  }
  return 'text-orange-500 dark:text-orange-400';
}

export function getCgpaBadgeClass(cgpa) {
  const val = Number(cgpa);
  if (isNaN(val)) return 'bg-slate-100 text-slate-700 border-slate-200';
  if (val >= 8.0) {
    return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
  }
  if (val >= 6.0) {
    return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30';
  }
  if (val <= 4.0) {
    return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30';
  }
  return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30';
}

export function getCgpaHeatTile(cgpa) {
  const val = Number(cgpa);
  if (val >= 8.0) {
    return {
      bg: 'bg-emerald-500/15 dark:bg-emerald-500/25 border-emerald-300 dark:border-emerald-600/50 text-emerald-950 dark:text-emerald-100',
      badge: 'bg-emerald-600 text-white',
      label: 'Distinction (≥8.0)',
      barColor: 'bg-emerald-500',
    };
  }
  if (val >= 6.0) {
    return {
      bg: 'bg-amber-500/15 dark:bg-amber-500/20 border-amber-300 dark:border-amber-600/50 text-amber-950 dark:text-amber-100',
      badge: 'bg-amber-600 text-white',
      label: 'Good Standing (≥6.0)',
      barColor: 'bg-amber-500',
    };
  }
  if (val <= 4.0) {
    return {
      bg: 'bg-rose-500/15 dark:bg-rose-500/20 border-rose-300 dark:border-rose-600/50 text-rose-950 dark:text-rose-100',
      badge: 'bg-rose-600 text-white',
      label: 'Academic Risk (≤4.0)',
      barColor: 'bg-rose-500',
    };
  }
  return {
    bg: 'bg-orange-500/15 dark:bg-orange-500/20 border-orange-300 dark:border-orange-600/50 text-orange-950 dark:text-orange-100',
    badge: 'bg-orange-600 text-white',
    label: 'Needs Push (4–6)',
    barColor: 'bg-orange-500',
  };
}
