import React from 'react';
import { Play, RotateCcw, Check, Clock, Target, Pause, Square } from 'lucide-react';
import type { Project } from '../../types';

interface TimerPanelProps {
  activeProject: Project;
  mode: 'idle' | 'sprint' | 'break';
  secondsLeft: number;
  formatTime: (seconds: number) => string;
  readyToStart: boolean;
  isPaused: boolean;
  togglePause: () => void;
  startSprint: () => void;
  resetTimer: () => void;
  completeSession: () => void;
  updateProject: (updater: (project: Project) => Project) => void;
  setSecondsLeft: (value: number) => void;
  goalLibrary: string[];
}

export function TimerPanel({
  activeProject, mode, secondsLeft, formatTime, readyToStart,
  isPaused, togglePause,
  startSprint, resetTimer, completeSession, updateProject,
  setSecondsLeft, goalLibrary
}: TimerPanelProps) {
  return (
    <article className="card panel sprint-panel workspace-today">
      <div className="panel-head">
        <div>
          <p className="eyebrow"><Clock size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> Focus Timer</p>
          <h2>Start Writing</h2>
        </div>
      </div>

      {/* Embedded Goal Selection */}
      <div style={{ marginBottom: '16px', padding: '16px', borderRadius: '20px', background: 'var(--surface-soft)', border: '1px solid var(--panel-border)' }}>
        <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase' }}><Target size={14} /> Session Goal</strong>
        </div>
        <div className="goal-pills" style={{ marginBottom: '12px' }}>
          {goalLibrary.map((goal) => (
            <button className={activeProject.selectedGoal === goal && !activeProject.customGoal ? 'pill active' : 'pill'} key={goal} onClick={() => updateProject((project) => ({ ...project, selectedGoal: goal }))} type="button">
              {goal}
            </button>
          ))}
        </div>
        <label className="input-block" style={{ padding: 0, background: 'transparent', border: 'none' }}>
          <input
            style={{ background: 'var(--input-bg)' }}
            onChange={(event) => updateProject((project) => ({
              ...project,
              customGoal: event.target.value,
              selectedGoal: event.target.value ? '' : project.selectedGoal,
            }))}
            placeholder="Or set a custom goal. Ex: Write the basement scene."
            type="text"
            value={activeProject.customGoal}
          />
        </label>
      </div>

      <div className={`timer-shell ${mode === 'sprint' ? 'is-running' : ''}`}>
        <div className={`timer-face ${mode}`}>
          <span style={{ fontSize: '1.05rem', marginBottom: '8px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)' }}>
            {isPaused ? 'Paused' : mode === 'break' ? 'Break' : mode === 'sprint' ? 'Focusing' : activeProject.restartMode ? 'Restart Ready' : 'Ready'}
          </span>
          <strong style={{ fontSize: 'clamp(4rem, 12vw, 7rem)', lineHeight: 1, letterSpacing: '-2px' }}>{formatTime(secondsLeft)}</strong>
        </div>
        <div className="timer-controls">
          <label style={{ padding: 0, background: 'transparent', border: 'none' }}>
            <span style={{ marginBottom: '8px', color: 'var(--text)' }}>Focus Duration</span>
            <select style={{ background: 'var(--input-bg)' }} onChange={(event) => {
              const minutes = Number(event.target.value);
              updateProject((project) => ({ ...project, sprintMinutes: minutes }));
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
            <select style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProject((project) => ({ ...project, breakMinutes: Number(event.target.value) }))} value={activeProject.breakMinutes}>
              <option value={3}>3 min</option>
              <option value={5}>5 min</option>
              <option value={8}>8 min</option>
            </select>
          </label>
        </div>
        <div className="button-row">
          {mode === 'idle' ? (
            <>
              <button className="primary" disabled={!readyToStart} onClick={startSprint} type="button" style={{ padding: '16px 20px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Play size={18} /> {activeProject.restartMode ? 'Initiate Return' : 'Start Focus'}
              </button>
              <button className="ghost" onClick={resetTimer} type="button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RotateCcw size={16} /> Reset
              </button>
            </>
          ) : (
            <>
              <button className="ghost" onClick={togglePause} type="button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isPaused ? <><Play size={18} /> Resume</> : <><Pause size={18} /> Pause</>}
              </button>
              <button className="ghost" onClick={resetTimer} type="button" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)' }}>
                <Square size={16} /> Stop
              </button>
            </>
          )}
          {(mode === 'sprint' || mode === 'break') && (
            <button className="success" onClick={completeSession} type="button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={18} /> Complete
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
