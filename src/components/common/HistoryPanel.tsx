import React from 'react';
import { Clock, Search } from 'lucide-react';

export function HistoryPanel({
  historyQuery, setHistoryQuery, historyProjectFilter, setHistoryProjectFilter,
  activeProject, historyOutcomeFilter, setHistoryOutcomeFilter, outcomeOptions,
  filteredHistory, projectNameMap, outcomeLabel
}: any) {
  return (
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
            <select style={{ background: 'var(--input-bg)' }} onChange={(event) => setHistoryProjectFilter(event.target.value)} value={historyProjectFilter}>
              <option value="active">Active: "{activeProject.name}"</option>
              <option value="all">All Projects</option>
            </select>
          </label>
          <label className="input-block compact" style={{ padding: 0, background: 'transparent', border: 'none' }}>
            <span style={{ marginBottom: '8px' }}>Filter by Outcome</span>
            <select style={{ background: 'var(--input-bg)' }} onChange={(event) => setHistoryOutcomeFilter(event.target.value)} value={historyOutcomeFilter}>
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
  );
}
