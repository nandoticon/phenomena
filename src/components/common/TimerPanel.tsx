import React from 'react';
import { Play, RotateCcw, Check, Clock, Target } from 'lucide-react';

export function TimerPanel({
  activeProject, mode, secondsLeft, formatTime, readyToStart,
  startSprint, resetTimer, completeSession, updateProject,
  setSecondsLeft, goalLibrary
}: any) {
  return (
    <article className="card panel sprint-panel workspace-today">
      <div className="panel-head">
        <div>
          <p className="eyebrow"><Clock size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> Focus Timer</p>
          <h2>Start Writing</h2>
        </div>
      </div>

      {/* Embedded Goal Selection */}
      <div style={{ marginBottom: '24px', padding: '24px', borderRadius: '24px', background: 'var(--surface-soft)', border: '1px solid var(--panel-border)' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase' }}><Target size={14} /> Session Goal</strong>
        </div>
        <div className="goal-pills" style={{ marginBottom: '20px' }}>
          {goalLibrary.map((goal: string) => (
            <button className={activeProject.selectedGoal === goal && !activeProject.customGoal ? 'pill active' : 'pill'} key={goal} onClick={() => updateProject((project: any) => ({ ...project, selectedGoal: goal }))} type="button">
              {goal}
            </button>
          ))}
        </div>
        <label className="input-block" style={{ padding: 0, background: 'transparent', border: 'none' }}>
          <input style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProject((project: any) => ({ ...project, customGoal: event.target.value }))} placeholder="Or set a custom goal. Ex: Write the basement scene." type="text" value={activeProject.customGoal} />
        </label>
      </div>

      <div className={`timer-shell ${mode === 'sprint' ? 'is-running' : ''}`} style={{ minHeight: 'clamp(220px, 40vh, 340px)', padding: 'clamp(24px, 4vw, 40px)', borderRadius: '24px' }}>
        <div className={`timer-face ${mode}`} style={{ minHeight: 'clamp(140px, 24vh, 220px)' }}>
          <span style={{ fontSize: '1.05rem', marginBottom: '8px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)' }}>{mode === 'break' ? 'Paused' : mode === 'sprint' ? 'Focusing' : activeProject.restartMode ? 'Restart Ready' : 'Ready'}</span>
          <strong style={{ fontSize: 'clamp(4rem, 12vw, 7rem)', lineHeight: 1, letterSpacing: '-2px' }}>{formatTime(secondsLeft)}</strong>
        </div>
        <div className="timer-controls">
          <label style={{ padding: 0, background: 'transparent', border: 'none' }}>
            <span style={{ marginBottom: '8px', color: 'var(--text)' }}>Focus Duration</span>
            <select style={{ background: 'var(--input-bg)' }} onChange={(event) => {
              const minutes = Number(event.target.value);
              updateProject((project: any) => ({ ...project, sprintMinutes: minutes }));
              if (mode === 'idle') {
                setSecondsLeft(minutes * 60);
              }
            }} value={activeProject.sprintMinutes}>
              <option value={10}>10 min</option>
              <option value={15}>15 min</option>
              <option value={20}>20 min</option>
              <option value={25}>25 min</option>
              <option value={45}>45 min</option>
              <option value={50}>50 min</option>
              <option value={60}>60 min</option>
              <option value={90}>90 min</option>
            </select>
          </label>
          <label style={{ padding: 0, background: 'transparent', border: 'none' }}>
            <span style={{ marginBottom: '8px', color: 'var(--text)' }}>Break Duration</span>
            <select style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProject((project: any) => ({ ...project, breakMinutes: Number(event.target.value) }))} value={activeProject.breakMinutes}>
              <option value={3}>3 min</option>
              <option value={5}>5 min</option>
              <option value={8}>8 min</option>
            </select>
          </label>
        </div>
        <div className="button-row">
          <button className="primary" disabled={!readyToStart || mode === 'sprint'} onClick={startSprint} type="button" style={{ padding: '16px 20px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Play size={18} /> {activeProject.restartMode ? 'Initiate Return' : 'Start Focus'}</button>
          <button className="ghost" onClick={resetTimer} type="button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><RotateCcw size={16} /> Reset Timer</button>
          <button className="success" onClick={completeSession} type="button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={18} /> Complete Session</button>
        </div>
      </div>
    </article>
  );
}
