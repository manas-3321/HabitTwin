import React from 'react';
import GitHubContributionHeatmap from './GitHubContributionHeatmap';

export default function TrajectoryCharts({ prediction, logs = [], onResetZero = null }) {
  if (!prediction) return null;

  return (
    <section>
      {/* Permanent Ambient GitHub Habit Heatmap */}
      <GitHubContributionHeatmap logs={logs} prediction={prediction} onResetZero={onResetZero} />
    </section>
  );
}
