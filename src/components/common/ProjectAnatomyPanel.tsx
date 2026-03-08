import React from 'react';
import { Disc3 } from 'lucide-react';
import { BarChart } from './Charts';

export function ProjectAnatomyPanel({ activeProject, analytics, outcomeLabel, outcomeSeries, activeChartPoint, setActiveChartPoint, moodSeries }: any) {
  return (
    <article className="card panel analytics-panel" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="panel-head">
        <div>
          <p className="eyebrow" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}><Disc3 size={14} /> Project Focus</p>
          <h2>Details: {activeProject.name}</h2>
        </div>
      </div>

      <div className="project-list analytics-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px', marginBottom: '40px' }}>
        <div className="project-card" style={{ background: 'var(--surface-soft)', border: '1px solid var(--panel-border)' }}><strong>Total Time</strong><span style={{ fontSize: '1.4rem', color: 'var(--text)' }}>{analytics.totalMinutes} min</span></div>
        <div className="project-card" style={{ background: 'var(--surface-soft)', border: '1px solid var(--panel-border)' }}><strong>Total Sessions</strong><span style={{ fontSize: '1.4rem', color: 'var(--text)' }}>{analytics.totalSessions}</span></div>
        <div className="project-card" style={{ background: 'var(--surface-soft)', border: '1px solid var(--panel-border)' }}><strong>Peak Activity</strong><span style={{ fontSize: '1rem', marginTop: '6px', color: 'var(--text)' }}>{analytics.bestTime}</span></div>
        <div className="project-card" style={{ background: 'var(--surface-soft)', border: '1px solid var(--panel-border)' }}><strong>Average Session</strong><span style={{ fontSize: '1rem', marginTop: '6px', color: 'var(--text)' }}>{analytics.averageSprint} min</span></div>

        <div className="project-card" style={{ background: 'var(--surface-soft)', border: '1px solid var(--panel-border)', gridColumn: '1 / -1' }}>
          <strong>Recoveries</strong>
          <span style={{ fontSize: '0.95rem', marginTop: '6px', color: 'var(--muted)' }}>
            {analytics.restartSessions} times recovered from a break.
          </span>
        </div>
        <div className="project-card" style={{ background: 'var(--surface-soft)', border: '1px solid var(--panel-border)', gridColumn: '1 / -1' }}>
          <strong>Primary Pattern</strong>
          <span style={{ fontSize: '0.95rem', marginTop: '6px', color: 'var(--muted)' }}>
            Mood "{analytics.dominantMoodPattern[0]}" usually leads to "{outcomeLabel(analytics.dominantMoodPattern[1])}"
          </span>
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
