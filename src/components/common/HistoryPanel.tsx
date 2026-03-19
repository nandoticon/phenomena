import React, { useState } from 'react';
import { Clock, Search, Plus, Pencil, Trash2 } from 'lucide-react';
import type { HistoryOutcomeFilter, HistoryProjectFilter, Project, SessionRecord } from '../../types';
import { outcomeOptions } from '../../constants';

interface HistoryPanelProps {
  historyQuery: string;
  setHistoryQuery: React.Dispatch<React.SetStateAction<string>>;
  historyProjectFilter: HistoryProjectFilter;
  setHistoryProjectFilter: React.Dispatch<React.SetStateAction<HistoryProjectFilter>>;
  activeProject: Project | undefined;
  historyOutcomeFilter: HistoryOutcomeFilter;
  setHistoryOutcomeFilter: React.Dispatch<React.SetStateAction<HistoryOutcomeFilter>>;
  outcomeOptions: typeof outcomeOptions;
  filteredHistory: SessionRecord[];
  projectNameMap: Record<string, string>;
  outcomeLabel: (outcome: SessionRecord['outcome']) => string;
  onEditSession: (session: SessionRecord) => void;
  onDeleteSession: (sessionId: string) => void;
  onAddSession?: () => void;
}

export function HistoryPanel({
  historyQuery, setHistoryQuery, historyProjectFilter, setHistoryProjectFilter,
  activeProject, historyOutcomeFilter, setHistoryOutcomeFilter, outcomeOptions,
  filteredHistory, projectNameMap, outcomeLabel,
  onEditSession, onDeleteSession, onAddSession
}: HistoryPanelProps) {
  const [showAll, setShowAll] = useState(false);

  return (
    <article className="card panel history-panel" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="panel-head">
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div>
            <p className="eyebrow"><Clock size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> History</p>
            <h2>Session History</h2>
          </div>
          <button 
            className="primary compact" 
            onClick={onAddSession}
            aria-label="Add manual session entry"
            style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.85rem' }}
          >
            <Plus size={16} style={{ marginRight: '6px' }} /> Manual Entry
          </button>
        </div>
      </div>

      <div className="history-controls" style={{ background: 'var(--surface-soft)', padding: '24px', borderRadius: '24px', marginBottom: '24px', border: '1px solid var(--panel-border)' }}>
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <label htmlFor="history-search" className="sr-only">Search sessions</label>
          <input 
            id="history-search"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--panel-border)', padding: '16px 48px', width: '100%', borderRadius: '16px', fontSize: '1rem' }} 
            onChange={(event) => setHistoryQuery(event.target.value)} 
            type="text" 
            value={historyQuery} 
            placeholder="Search notes and cues..." 
            aria-label="Search session history"
          />
          {historyQuery && (
            <button 
              onClick={() => setHistoryQuery('')}
              style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }}
              type="button"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px' }}>
          <label className="input-block compact" htmlFor="history-project-filter" style={{ padding: 0, background: 'transparent', border: 'none' }}>
            <span style={{ marginBottom: '8px' }}>Filter by Project</span>
            <select id="history-project-filter" style={{ background: 'var(--input-bg)' }} onChange={(event) => setHistoryProjectFilter(event.target.value as HistoryProjectFilter)} value={historyProjectFilter} aria-label="Filter session history by project">
              <option value="active">Active: "{activeProject?.name ?? 'None'}"</option>
              <option value="all">All Projects</option>
            </select>
          </label>
          <label className="input-block compact" htmlFor="history-outcome-filter" style={{ padding: 0, background: 'transparent', border: 'none' }}>
            <span style={{ marginBottom: '8px' }}>Filter by Outcome</span>
            <select id="history-outcome-filter" style={{ background: 'var(--input-bg)' }} onChange={(event) => setHistoryOutcomeFilter(event.target.value as HistoryOutcomeFilter)} value={historyOutcomeFilter} aria-label="Filter session history by outcome">
              <option value="all">All Outcomes</option>
              {outcomeOptions.map((option) => (
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
              {(showAll ? filteredHistory : filteredHistory.slice(0, 50)).map((entry, index: number) => (
                <li className="history-item" key={entry.id || `${entry.projectId}-${entry.date}-${index}`} style={{ background: 'var(--surface-soft)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255,255,255,0.03)', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="date-tag" style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'var(--bg)', borderRadius: '8px', color: 'var(--muted)' }}>{entry.date} {entry.timeOfDay}</span>
                      <span className="project-tag" style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'var(--accent-soft)', borderRadius: '8px', color: 'var(--accent)' }}>{projectNameMap[entry.projectId] || 'Unknown'}</span>
                      <span className="outcome-tag" style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'var(--text)' }}>{outcomeLabel(entry.outcome)}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginLeft: '4px' }}>{entry.minutes}m</span>
                    </div>

                    <div className="history-actions" style={{ display: 'flex', gap: '4px' }}>
                      <button 
                        className="ghost compact" 
                        onClick={() => onEditSession(entry)}
                        title="Edit Session"
                        aria-label={`Edit session on ${entry.date} for ${projectNameMap[entry.projectId] || 'Unknown project'}`}
                        style={{ padding: '6px', borderRadius: '8px' }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button 
                        className="ghost compact" 
                        onClick={() => onDeleteSession(entry.id)}
                        title="Delete Session"
                        aria-label={`Delete session on ${entry.date} for ${projectNameMap[entry.projectId] || 'Unknown project'}`}
                        style={{ padding: '6px', borderRadius: '8px', color: '#ff6b6b' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
