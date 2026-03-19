import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { Project, RitualStep } from '../../types';

interface RitualPanelProps {
  ritualSteps: RitualStep[];
  ritualPronto: boolean;
  resetRitual: () => void;
  toggleRitual: (stepId: string) => void;
  activeProject: Project;
  restart: { needed: boolean; daysAway: number };
  restartSteps: readonly string[];
  activateRestartMode: () => void;
  toggleRestartCheck: (step: string) => void;
}

export function RitualPanel({ ritualSteps, ritualPronto, resetRitual, toggleRitual, activeProject, restart, restartSteps, activateRestartMode, toggleRestartCheck }: RitualPanelProps) {
  return (
    <article className="card panel ritual-panel workspace-today">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Preparation Ritual</p>
          <h2>Complete these steps before starting.</h2>
        </div>
        <button className="ghost" onClick={resetRitual} type="button" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>Reset steps</button>
      </div>

      <div className="ritual-list">
        {ritualSteps.map((step) => (
          <label className={`ritual-item ${activeProject.ritualChecks[step.id] ? 'checked' : ''}`} key={step.id}>
            <input checked={activeProject.ritualChecks[step.id]} onChange={() => toggleRitual(step.id)} type="checkbox" />
            <span>
              <strong>{step.label}</strong>
              <small>{step.detail}</small>
            </span>
          </label>
        ))}
      </div>

      <div className={`status ${ritualPronto ? 'ready' : ''}`} style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {ritualPronto ? <><CheckCircle2 size={16} /> <span>Ritual complete. You are ready to start.</span></> : <span>Complete the steps below to prepare.</span>}
      </div>

      {(activeProject.restartMode || restart.needed) && (
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px dashed var(--panel-border)' }}>
          <div className="panel-head" style={{ marginBottom: '16px' }}>
            <div>
              <p className="eyebrow">Return Protocol</p>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'Georgia, "Times New Roman", serif' }}>Force Return</h3>
            </div>
            <button className="primary" disabled={!restart.needed && !activeProject.restartMode} onClick={activateRestartMode} style={{ padding: '8px 14px', fontSize: '0.85rem' }} type="button">{activeProject.restartMode ? 'Return Protocol Active' : 'Force Return'}</button>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '18px', lineHeight: 1.5 }}>
            {activeProject.restartMode
              ? 'Return sequence initiated. Complete these lightweight steps.'
              : `${activeProject.name} remained untouched for ${restart.daysAway} days. Use the return protocol to ease back into it.`}
          </p>
          <div className="restart-list">
            {restartSteps.map((step) => (
              <label className={`restart-item ${activeProject.restartChecks[step] ? 'checked' : ''}`} key={step}>
                <input checked={activeProject.restartChecks[step]} onChange={() => toggleRestartCheck(step)} type="checkbox" />
                <span>{step}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
