import React from 'react';
import { FileText, Activity } from 'lucide-react';

export function SessionPanel({ outcomeOptions, activeProject, updateProject, state, setState, coaching, recoveryMessage, streakLabel, recentSessions, outcomeLabel }: any) {
  return (
    <article className="card panel session-panel workspace-today">
      <div className="panel-head">
        <div>
          <p className="eyebrow"><FileText size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> Session Log</p>
          <h2>Session Details</h2>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '0.95rem', color: 'var(--muted)', margin: '0 0 14px' }}>What did you accomplish today?</h3>
        <div className="outcome-grid">
          {outcomeOptions.map((option: any) => (
            <button className={activeProject.sessionOutcome === option.value ? 'outcome active' : 'outcome'} key={option.value} onClick={() => updateProject((project: any) => ({ ...project, sessionOutcome: option.value }))} type="button">
              <strong>{option.label}</strong>
              <span style={{ fontSize: '0.85rem' }}>{option.detail}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '24px', padding: '20px', borderRadius: '20px', background: 'var(--surface-soft)', border: '1px solid var(--panel-border)' }}>
        <h3 style={{ fontSize: '0.95rem', color: 'var(--muted)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '6px' }}><Activity size={16} /> Current State</h3>
        <div className="selectors" style={{ gap: '16px' }}>
          <label style={{ padding: 0, background: 'transparent', border: 'none', flex: 1 }}>
            <span style={{ marginBottom: '8px' }}>Mood</span>
            <select style={{ background: 'var(--input-bg)' }} onChange={(event) => setState((current: any) => ({ ...current, mood: event.target.value }))} value={state.mood}>
              <option value="foggy">Foggy</option>
              <option value="steady">Steady</option>
              <option value="restless">Restless</option>
              <option value="anxious">Anxious</option>
            </select>
          </label>
          <label style={{ padding: 0, background: 'transparent', border: 'none', flex: 1 }}>
            <span style={{ marginBottom: '8px' }}>Energy</span>
            <select style={{ background: 'var(--input-bg)' }} onChange={(event) => setState((current: any) => ({ ...current, energy: event.target.value }))} value={state.energy}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label style={{ padding: 0, background: 'transparent', border: 'none', flex: 1 }}>
            <span style={{ marginBottom: '8px' }}>Focus</span>
            <select style={{ background: 'var(--input-bg)' }} onChange={(event) => setState((current: any) => ({ ...current, focus: event.target.value }))} value={state.focus}>
              <option value="scattered">Scattered</option>
              <option value="usable">Usable</option>
              <option value="sharp">Sharp</option>
            </select>
          </label>
        </div>

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--panel-border)', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--secondary)', display: 'block', marginBottom: '4px' }}>System Analysis:</strong>
          <span style={{ color: 'var(--text)', fontSize: '0.95rem', fontStyle: 'italic' }}>"{coaching.message}"</span>
          {recoveryMessage && (
            <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255, 122, 89, 0.08)', borderRadius: '12px', border: '1px solid rgba(255, 122, 89, 0.15)' }}>
              <strong style={{ display: 'block', color: 'var(--accent)', fontSize: '0.85rem', marginBottom: '4px' }}>Inactivity Alert</strong>
              <span style={{ fontSize: '0.9rem' }}>{recoveryMessage}</span>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '0.95rem', color: 'var(--text)', margin: '0 0 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Current Streak
          <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{streakLabel}</span>
        </h3>
        <div className="session-log" style={{ border: 'none', padding: 0, background: 'transparent' }}>
          {recentSessions.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No sessions recorded yet.</p>
          ) : (
            <ul style={{ margin: 0 }}>
              {recentSessions.slice(0, 3).map((entry: any, index: number) => (
                <li key={`${entry.date}-${index}`} style={{ borderTop: index === 0 ? 'none' : '1px solid var(--panel-border)', padding: '12px 0' }}>
                  <span style={{ color: 'var(--text)' }}>{entry.date}</span>
                  <span>{entry.minutes} min</span>
                  <span>{outcomeLabel(entry.outcome)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}
