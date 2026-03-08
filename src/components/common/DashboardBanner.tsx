import React from 'react';
import { Activity, Calendar, BarChart2 } from 'lucide-react';
import { BarChart, LineChart } from './Charts';

export function DashboardBanner({
  dashboard, chartRange, setChartRange, comparisonMetric, setComparisonMetric,
  projectComparisonSeries, activeChartPoint, setActiveChartPoint, recentDaySeries
}: any) {
  return (
    <article className="card panel dashboard-panel wide-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}><Activity size={14} /> Dashboard</p>
          <h2 style={{ fontSize: '1.8rem' }}>Project Insights</h2>
        </div>

        <div className="chart-controls" style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <label className="input-block compact" style={{ padding: 0, background: 'transparent', minWidth: '160px', border: 'none' }}>
            <span style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> Time Period</span>
            <select style={{ background: 'var(--input-bg)' }} onChange={(event) => setChartRange(event.target.value)} value={chartRange}>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </label>
          <label className="input-block compact" style={{ padding: 0, background: 'transparent', minWidth: '160px', border: 'none' }}>
            <span style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><BarChart2 size={14} /> Metric</span>
            <select style={{ background: 'var(--input-bg)' }} onChange={(event) => setComparisonMetric(event.target.value)} value={comparisonMetric}>
              <option value="minutes">Minutes</option>
              <option value="weekly">Weekly Average</option>
              <option value="sessions">Sessions</option>
              <option value="streak">Daily Streak</option>
            </select>
          </label>
        </div>
      </div>

      <div className="analytics-grid dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '16px' }}>
        <div className="project-card active" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <strong style={{ fontSize: '0.9rem', opacity: 0.8 }}>Active Projects</strong>
          <span style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--accent)' }}>{dashboard.activeCount} <span style={{ fontSize: '0.9rem', color: 'var(--text)' }}>projects</span></span>
          <small>{dashboard.archivedCount} archived</small>
        </div>
        <div className="project-card active" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <strong style={{ fontSize: '0.9rem', opacity: 0.8 }}>Minutes this week</strong>
          <span style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--secondary)' }}>{dashboard.totalWeeklyMinutes} <span style={{ fontSize: '0.9rem', color: 'var(--text)' }}>minutes</span></span>
        </div>
        <div className="project-card active" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <strong style={{ fontSize: '0.9rem', opacity: 0.8 }}>Longest Streak</strong>
          <span style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', height: '100%' }}>{dashboard.topStreakProject}</span>
        </div>
        <div className="project-card active" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <strong style={{ fontSize: '0.9rem', opacity: 0.8 }}>Best Time to Write</strong>
          <span style={{ fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', height: '100%' }}>{dashboard.strongestTime}</span>
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
