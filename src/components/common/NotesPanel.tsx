import React from 'react';
import { MessageSquare, Anchor } from 'lucide-react';

export function NotesPanel({ setSessionNote, sessionNote, setRestartCue, restartCue, recentSessions, analytics }: any) {
  return (
    <article className="card panel notes-panel workspace-today">
      <div className="panel-head">
        <div>
          <p className="eyebrow"><MessageSquare size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> Session Notes</p>
          <h2>Log your progress and thoughts.</h2>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
        <label className="input-block textarea-block" style={{ padding: 0, background: 'transparent', border: 'none' }}>
          <span style={{ marginBottom: '10px', color: 'var(--text)' }}>What went well today?</span>
          <textarea style={{ background: 'var(--input-bg)', minHeight: '120px' }} onChange={(event) => setSessionNote(event.target.value)} value={sessionNote} placeholder="Example: Focusing on one small scene at a time helped ease the tension..." />
        </label>
        <label className="input-block textarea-block" style={{ padding: 0, background: 'transparent', border: 'none' }}>
          <span style={{ marginBottom: '10px', color: 'var(--text)' }}>What's the starting point for tomorrow?</span>
          <textarea style={{ background: 'var(--input-bg)', minHeight: '120px' }} onChange={(event) => setRestartCue(event.target.value)} value={restartCue} placeholder="Example: Start by reviewing the cut dialogue between the monster and the protagonist." />
        </label>
      </div>
      <div className="coach-note muted" style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
        <Anchor size={20} style={{ color: 'var(--muted)' }} />
        <div>
          <strong>Yesterday's starting point:</strong>
          <p>{recentSessions.find((entry: any) => entry.restartCue)?.restartCue || analytics.noteSeed || "No previous notes."}</p>
        </div>
      </div>
    </article>
  );
}
