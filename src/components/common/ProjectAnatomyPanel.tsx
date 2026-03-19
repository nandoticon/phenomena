import React from 'react';
import { Disc3 } from 'lucide-react';
import { BarChart } from './Charts';
import type { ChartPoint, Project, SessionResultado } from '../../types';
import type { TrendAnnotation, TrendDriver } from '../../utils/analytics';

interface ProjectAnalyticsView {
  totalMinutes: number;
  totalSessions: number;
  bestTime: string;
  averageSprint: number;
  restartRecoveryRate: number;
  completionRate: number;
  bestRecoveryWindow: string;
  worstRecoveryWindow: string;
  dominantMoodPattern: string[];
  trendAnnotations: TrendAnnotation[];
  trendDrivers: TrendDriver[];
}

interface ProjectAnatomyPanelProps {
  activeProject: Project;
  analytics: ProjectAnalyticsView | null;
  outcomeLabel: (outcome: SessionResultado) => string;
  outcomeSeries: ChartPoint[];
  activeChartPoint: ChartPoint | null;
  setActiveChartPoint: React.Dispatch<React.SetStateAction<ChartPoint | null>>;
  moodSeries: ChartPoint[];
}

export function ProjectAnatomyPanel({ activeProject, analytics, outcomeLabel, outcomeSeries, activeChartPoint, setActiveChartPoint, moodSeries }: ProjectAnatomyPanelProps) {
  const safeAnalytics = analytics ?? {
    totalMinutes: 0,
    totalSessions: 0,
    bestTime: 'No data yet',
    averageSprint: 0,
    restartSessions: 0,
    restartRecoveryRate: 0,
    completionRate: 0,
    bestRecoveryWindow: 'No recovery window yet',
    worstRecoveryWindow: 'No recovery window yet',
    dominantMoodPattern: ['steady', 'drafted'],
    trendAnnotations: [],
    trendDrivers: [],
  };

  return (
    <article className="card panel analytics-panel" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="panel-head">
        <div>
          <p className="eyebrow" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}><Disc3 size={14} /> Project Focus</p>
          <h2>Details: {activeProject.name}</h2>
        </div>
      </div>

      <div className="project-list analytics-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px', marginBottom: '40px' }}>
        <div className="project-card" style={{ background: 'var(--surface-soft)', border: '1px solid var(--panel-border)' }}><strong>Total Time</strong><span style={{ fontSize: '1.4rem', color: 'var(--text)' }}>{safeAnalytics.totalMinutes} min</span></div>
        <div className="project-card" style={{ background: 'var(--surface-soft)', border: '1px solid var(--panel-border)' }}><strong>Total Sessions</strong><span style={{ fontSize: '1.4rem', color: 'var(--text)' }}>{safeAnalytics.totalSessions}</span></div>
        <div className="project-card" style={{ background: 'var(--surface-soft)', border: '1px solid var(--panel-border)' }}><strong>Peak Activity</strong><span style={{ fontSize: '1rem', marginTop: '6px', color: 'var(--text)' }}>{safeAnalytics.bestTime}</span></div>
        <div className="project-card" style={{ background: 'var(--surface-soft)', border: '1px solid var(--panel-border)' }}><strong>Average Session</strong><span style={{ fontSize: '1rem', marginTop: '6px', color: 'var(--text)' }}>{safeAnalytics.averageSprint} min</span></div>

        <div className="project-card" style={{ background: 'var(--surface-soft)', border: '1px solid var(--panel-border)', gridColumn: '1 / -1' }}>
          <strong>Recovery Rate</strong>
          <span style={{ fontSize: '0.95rem', marginTop: '6px', color: 'var(--muted)' }}>
            {safeAnalytics.restartRecoveryRate}% of restart-mode sessions recovered within two days.
          </span>
        </div>
        <div className="project-card" style={{ background: 'var(--surface-soft)', border: '1px solid var(--panel-border)', gridColumn: '1 / -1' }}>
          <strong>Primary Pattern</strong>
          <span style={{ fontSize: '0.95rem', marginTop: '6px', color: 'var(--muted)' }}>
            Mood "{safeAnalytics.dominantMoodPattern[0]}" usually leads to "{outcomeLabel(safeAnalytics.dominantMoodPattern[1] as SessionResultado)}"
          </span>
        </div>
        <div className="project-card" style={{ background: 'var(--surface-soft)', border: '1px solid var(--panel-border)', gridColumn: '1 / -1' }}>
          <strong>Follow-through</strong>
          <span style={{ fontSize: '0.95rem', marginTop: '6px', color: 'var(--muted)' }}>
            {safeAnalytics.completionRate}% of sessions reached the planned sprint length.
          </span>
        </div>
        <div className="project-card" style={{ background: 'var(--surface-soft)', border: '1px solid var(--panel-border)', gridColumn: '1 / -1' }}>
          <strong>Recovery Window</strong>
          <span style={{ fontSize: '0.95rem', marginTop: '6px', color: 'var(--muted)' }}>
            Best: {safeAnalytics.bestRecoveryWindow}. Worst: {safeAnalytics.worstRecoveryWindow}.
          </span>
        </div>
        <div className="project-card" style={{ background: 'var(--surface-soft)', border: '1px solid var(--panel-border)', gridColumn: '1 / -1' }}>
          <strong>Trend Notes</strong>
          <ul style={{ margin: '8px 0 0', paddingLeft: '18px', color: 'var(--muted)', lineHeight: 1.5 }}>
            {safeAnalytics.trendAnnotations.map((item: TrendAnnotation) => (
              <li key={item.title}><strong>{item.title}:</strong> {item.detail}</li>
            ))}
          </ul>
        </div>
        <div className="project-card" style={{ background: 'var(--surface-soft)', border: '1px solid var(--panel-border)', gridColumn: '1 / -1' }}>
          <strong>Why the trend looks this way</strong>
          <ul style={{ margin: '8px 0 0', paddingLeft: '18px', color: 'var(--muted)', lineHeight: 1.5 }}>
            {safeAnalytics.trendDrivers.map((driver: TrendDriver) => (
              <li key={driver.title}>
                <strong>{driver.title} ({driver.direction}):</strong> {driver.detail}
                <div style={{ marginTop: '4px', fontSize: '0.85rem', color: 'var(--secondary)' }}>{driver.evidence}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="two-up" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', color: 'var(--muted)', marginBottom: '16px' }}>Session Outcomes</h3>
          <BarChart title="" points={outcomeSeries} accent="var(--success)" activePoint={activeChartPoint} onPointFocus={setActiveChartPoint} />
        </div>
        <div style={{ paddingTop: '24px', borderTop: '1px solid var(--panel-border)' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--muted)', marginBottom: '16px' }}>Starting Moods</h3>
          <BarChart title="" points={moodSeries} activePoint={activeChartPoint} onPointFocus={setActiveChartPoint} />
        </div>
      </div>
    </article>
  );
}
