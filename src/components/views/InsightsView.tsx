// @ts-nocheck
import React, { memo } from 'react';
import { LineChart, BarChart } from '../../App';
import { Activity, BarChart2, TrendingUp, Search, Calendar, Clock, Disc3 } from 'lucide-react';
import type { ChartRange, ComparisonMetric, SessionResultado, HistoryProjectFilter, HistoryOutcomeFilter } from '../../types';

function InsightsViewComponent({
  dashboard, chartRange, setChartRange, comparisonMetric, setComparisonMetric,
  projectComparisonSeries, activeChartPoint, setActiveChartPoint, recentDaySeries,
  activeProject, analytics, outcomeLabel, outcomeSeries, moodSeries,
  historyQuery, setHistoryQuery, historyProjectFilter, setHistoryProjectFilter,
  historyOutcomeFilter, setHistoryOutcomeFilter, outcomeOptions, filteredHistory,
  projectNameMap
}: any) {
  return (
    <section className="page-container workspace-insights">

      {/* Universal Dashboard Banner */}
      <article className="card panel dashboard-panel wide-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
          <div>
            <p className="eyebrow" style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}><Activity size={14} /> Dashboard</p>
            <h2 style={{ fontSize: '1.8rem' }}>Project Insights</h2>
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

        {/* Global Trends */}
        <div className="two-column-layout" style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ padding: '24px', background: 'var(--surface-soft)', borderRadius: '24px' }}>
            <BarChart title="Time Distribution" points={projectComparisonSeries} activePoint={activeChartPoint} onPointFocus={setActiveChartPoint} />
          </div>
          <div style={{ padding: '24px', background: 'var(--surface-soft)', borderRadius: '24px' }}>
            <LineChart title="Activity Over Time" points={recentDaySeries} activePoint={activeChartPoint} onPointFocus={setActiveChartPoint} />
          </div>
        </div>
      </article>

      <div className="two-column-layout">

        {/* Deep Dive - Single Project Anatomy */}
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
                Mood "{analytics.dominantMoodPattern[0]}" usually leads to "{outcomeLabel(analytics.dominantMoodPattern[1] as SessionResultado)}"
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

        {/* The Raw Logs */}
        <article className="card panel history-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="panel-head">
            <div>
              <p className="eyebrow"><Clock size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> History</p>
              <h2>Session Logs</h2>
            </div>
          </div>

          <div className="history-controls" style={{ background: 'var(--surface-soft)', padding: '24px', borderRadius: '24px', marginBottom: '24px', border: '1px solid var(--panel-border)' }}>
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input style={{ background: 'var(--input-bg)', border: '1px solid var(--panel-border)', padding: '16px 16px 16px 48px', width: '100%', borderRadius: '16px', fontSize: '1rem' }} onChange={(event) => setHistoryQuery(event.target.value)} type="text" value={historyQuery} placeholder="Search notes and cues..." />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px' }}>
              <label className="input-block compact" style={{ padding: 0, background: 'transparent', border: 'none' }}>
                <span style={{ marginBottom: '8px' }}>Filter by Project</span>
                <select style={{ background: 'var(--input-bg)' }} onChange={(event) => setHistoryProjectFilter(event.target.value as HistoryProjectFilter)} value={historyProjectFilter}>
                  <option value="active">Active: "{activeProject.name}"</option>
                  <option value="all">All Projects</option>
                </select>
              </label>
              <label className="input-block compact" style={{ padding: 0, background: 'transparent', border: 'none' }}>
                <span style={{ marginBottom: '8px' }}>Filter by Outcome</span>
                <select style={{ background: 'var(--input-bg)' }} onChange={(event) => setHistoryOutcomeFilter(event.target.value as HistoryOutcomeFilter)} value={historyOutcomeFilter}>
                  <option value="all">All Outcomes</option>
                  {outcomeOptions.map((option: any) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="session-log history-log" style={{ flex: 1, overflowY: 'auto' }}>
            <strong style={{ color: 'var(--accent)', fontSize: '0.9rem', textTransform: 'uppercase' }}>
              {filteredHistory.length} Sessions Found
            </strong>

            {filteredHistory.length === 0 ? (
              <p style={{ marginTop: '24px', opacity: 0.6, fontStyle: 'italic' }}>No sessions found matching these filters.</p>
            ) : (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                {filteredHistory.slice(0, 50).map((entry: any, index: number) => (
                  <li className="history-item" key={`${entry.projectId}-${entry.date}-${index}`} style={{ background: 'var(--surface-soft)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.8rem' }}>
                        {entry.date} at {entry.timeOfDay}
                      </span>
                      <strong style={{ color: 'var(--text)', fontSize: '1.05rem' }}>{projectNameMap[entry.projectId] ?? 'Hidden Project'}</strong>
                    </div>

                    <div style={{ display: 'flex', gap: '24px', marginBottom: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ color: 'var(--accent)', fontSize: '0.8rem', textTransform: 'uppercase', display: 'block' }}>Outcome</span>
                        <strong style={{ fontSize: '0.95rem' }}>{outcomeLabel(entry.outcome)}</strong>
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{ color: 'var(--secondary)', fontSize: '0.8rem', textTransform: 'uppercase', display: 'block' }}>Duration</span>
                        <strong style={{ fontSize: '0.95rem' }}>{entry.minutes} minutes</strong>
                      </div>
                    </div>

                    {entry.note && (
                      <div style={{ background: 'var(--input-bg)', padding: '12px', borderRadius: '12px', marginBottom: '8px' }}>
                        <strong style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Note</strong>
                        <span style={{ fontStyle: 'italic', fontSize: '0.95rem' }}>"{entry.note}"</span>
                      </div>
                    )}

                    {entry.restartCue && (
                      <div style={{ padding: '0 12px' }}>
                        <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Restart cue: <strong>{entry.restartCue}</strong></span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>

      </div>
    </section>
  );
}
export const InsightsView = memo(InsightsViewComponent);
