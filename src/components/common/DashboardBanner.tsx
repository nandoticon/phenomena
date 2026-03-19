import React from 'react';
import { Activity, Calendar, BarChart2 } from 'lucide-react';
import { BarChart, LineChart } from './Charts';
import type { ChartPoint, ChartRange, ComparisonMetric } from '../../types';

interface DashboardSummary {
  activeCount: number;
  totalWeeklyMinutes: number;
  topStreakProject: string;
  strongestTime: string;
}

interface DashboardBannerProps {
  dashboard: DashboardSummary;
  chartRange: ChartRange;
  setChartRange: React.Dispatch<React.SetStateAction<ChartRange>>;
  comparisonMetric: ComparisonMetric;
  setComparisonMetric: React.Dispatch<React.SetStateAction<ComparisonMetric>>;
  projectComparisonSeries: ChartPoint[];
  activeChartPoint: ChartPoint | null;
  setActiveChartPoint: React.Dispatch<React.SetStateAction<ChartPoint | null>>;
  recentDaySeries: ChartPoint[];
}

export function DashboardBanner({
  dashboard, chartRange, setChartRange, comparisonMetric, setComparisonMetric,
  projectComparisonSeries, activeChartPoint, setActiveChartPoint, recentDaySeries
}: DashboardBannerProps) {
  return (
    <article className="card panel dashboard-panel wide-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}><Activity size={14} /> Dashboard</p>
          <h1 style={{ fontSize: 'clamp(1rem, 3vw, 1.4rem)', margin: 0 }}>Project Insights</h1>
        </div>

        <div className="chart-controls" style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <label className="input-block compact" style={{ padding: 0, background: 'transparent', minWidth: '160px', border: 'none' }}>
            <span style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> Time Period</span>
            <select style={{ background: 'var(--input-bg)' }} onChange={(event) => setChartRange(event.target.value as ChartRange)} value={chartRange}>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </label>
          <label className="input-block compact" style={{ padding: 0, background: 'transparent', minWidth: '160px', border: 'none' }}>
            <span style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><BarChart2 size={14} /> Metric</span>
            <select style={{ background: 'var(--input-bg)' }} onChange={(event) => setComparisonMetric(event.target.value as ComparisonMetric)} value={comparisonMetric}>
              <option value="minutes">Minutes</option>
              <option value="weekly">Weekly Average</option>
              <option value="sessions">Sessions</option>
              <option value="streak">Daily Streak</option>
            </select>
          </label>
        </div>
      </div>

        <div className="analytics-grid dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '16px' }}>
          <div className="project-card active">
          <strong style={{ fontSize: '0.9rem', opacity: 0.8 }}>Active Projects</strong>
          <span style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', fontWeight: 600, color: 'var(--accent)' }}>{dashboard.activeCount} <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>active</span></span>
        </div>
        <div className="project-card active">
          <strong style={{ fontSize: '0.9rem', opacity: 0.8 }}>Weekly Minutes</strong>
          <span style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', fontWeight: 600, color: 'var(--secondary)' }}>{dashboard.totalWeeklyMinutes} <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>min</span></span>
        </div>
        <div className="project-card active">
          <strong style={{ fontSize: '0.9rem', opacity: 0.8 }}>Best Streak</strong>
          <span style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', fontWeight: 600 }}>{dashboard.topStreakProject}</span>
        </div>
        <div className="project-card active">
          <strong style={{ fontSize: '0.9rem', opacity: 0.8 }}>Strongest Time Block</strong>
          <span style={{ fontSize: 'clamp(1rem, 3vw, 1.2rem)', fontWeight: 600 }}>{dashboard.strongestTime}</span>
        </div>
      </div>

      <div className="two-column-layout" style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ padding: '24px', background: 'var(--surface-soft)', borderRadius: '24px' }}>
          <BarChart title="Time Distribution" points={projectComparisonSeries} activePoint={activeChartPoint} onPointFocus={setActiveChartPoint} />
        </div>
        <div style={{ padding: '24px', background: 'var(--surface-soft)', borderRadius: '24px' }}>
          <LineChart title="Activity Over Time" points={recentDaySeries} activePoint={activeChartPoint} onPointFocus={setActiveChartPoint} />
        </div>
      </div>
    </article>
  );
}
