import React, { useState } from 'react';
import { Clock, Search } from 'lucide-react';

export function HistoryPanel({
  historyQuery, setHistoryQuery, historyProjectFilter, setHistoryProjectFilter,
  activeProject, historyOutcomeFilter, setHistoryOutcomeFilter, outcomeOptions,
  filteredHistory, projectNameMap, outcomeLabel
}: any) {
  const [showAll, setShowAll] = useState(false);

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
          <input 
            style={{ background: 'var(--input-bg)', border: '1px solid var(--panel-border)', padding: '16px 48px', width: '100%', borderRadius: '16px', fontSize: '1rem' }} 
            onChange={(event) => setHistoryQuery(event.target.value)} 
            type="text" 
            value={historyQuery} 
            placeholder="Search notes and cues..." 
          />
          {historyQuery && (
            <button 
              onClick={() => setHistoryQuery('')}
              style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }}
              type="button"
            >
              ✕
            </button>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px' }}>
          <label className="input-block compact" style={{ padding: 0, background: 'transparent', border: 'none' }}>
            <span style={{ marginBottom: '8px' }}>Filter by Project</span>
            <select style={{ background: 'var(--input-bg)' }} onChange={(event) => setHistoryProjectFilter(event.target.value)} value={historyProjectFilter}>
              <option value="active">Active: "{activeProject?.name ?? 'None'}"</option>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ color: 'var(--accent)', fontSize: '0.9rem', textTransform: 'uppercase' }}>
            {filteredHistory.length} Sessions Found
          </strong>
        </div>

        {filteredHistory.length === 0 ? (
          <p style={{ marginTop: '24px', opacity: 0.6, fontStyle: 'italic' }}>No sessions found matching these filters.</p>
        ) : (
          <>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
              {(showAll ? filteredHistory : filteredHistory.slice(0, 50)).map((entry: any, index: number) => (
                <li className="history-item" key={`${entry.projectId}-${entry.date}-${index}`} style={{ background: 'var(--surface-soft)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                    <span className="date-tag" style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'var(--bg)', borderRadius: '8px', color: 'var(--muted)' }}>{entry.date} {entry.time}</span>
                    <span className="project-tag" style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'var(--accent-soft)', borderRadius: '8px', color: 'var(--accent)' }}>{projectNameMap[entry.projectId] || 'Unknown'}</span>
                    <span className="outcome-tag" style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'var(--text)' }}>{outcomeLabel(entry.outcome)}</span>
                  </div>
                  
                  {entry.goal && (
                    <div style={{ marginBottom: '8px', borderLeft: '2px solid var(--accent)', paddingLeft: '12px' }}>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text)', margin: 0, fontWeight: 500 }}>{entry.goal}</p>
                    </div>
                  )}

                  {entry.note && (
                    <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--muted)', marginTop: '8px' }}>
                      {entry.note}
                    </div>
                  )}

                  {entry.restartCue && (
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--accent)', opacity: 0.9 }}>
                      <strong>Return Cue:</strong> {entry.restartCue}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            {filteredHistory.length > 50 && !showAll && (
              <button
                className="ghost"
                onClick={() => setShowAll(true)}
                style={{ width: '100%', marginTop: '20px', padding: '16px', borderStyle: 'dashed' }}
                type="button"
              >
                Show all {filteredHistory.length} sessions
              </button>
            )}
          </>
        )}
      </div>
    </article>
  );
}
