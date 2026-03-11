import React, { memo, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { BellRing } from 'lucide-react';
import { MobileAccordion } from '../common/MobileAccordion';
import { TimerPanel } from '../common/TimerPanel';
import { NotesPanel } from '../common/NotesPanel';
import { RitualPanel } from '../common/RitualPanel';
import { SessionPanel } from '../common/SessionPanel';
import { goalLibrary, ritualSteps, restartSteps, outcomeOptions } from '../../constants';
import { getProjectAnalytics } from '../../utils/analytics';

import { getTodayKey, getTimeKey } from '../../utils/date';

function TodayViewComponent({
  activeProject, state, setState, mode, secondsLeft, setSecondsLeft,
  startSprint, resetTimer, completeSession, activateRestartMode,
  formatTime, updateProject, sessionNote, setSessionNote,
  restartCue, setRestartCue, getStreakLabel, projectGoal,
  getCoachingInsight, getRecoveryMessage, getRestartState, outcomeLabel,
  getCrossProjectSummary, deleteSession, updateSession,
  isPaused, togglePause, toast, setToast, restoreSession, addSession
}: any) {
  const [editingSession, setEditingSession] = React.useState<any>(null);
  const [sessionToDelete, setSessionToDelete] = React.useState<string | null>(null);
  const [isAddingSession, setIsAddingSession] = React.useState(false);
  const [newSession, setNewSession] = React.useState<any>({
    projectId: activeProject?.id || state.projects[0]?.id,
    date: getTodayKey(),
    timeOfDay: getTimeKey(),
    minutes: 30,
    goal: '',
    outcome: 'drafted',
    mood: 'steady',
    energy: 'medium',
    focus: 'usable',
    note: '',
    restartCue: '',
    usedRestartMode: false
  });

  React.useEffect(() => {
    if (editingSession || sessionToDelete || isAddingSession) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditingSession(null);
        setSessionToDelete(null);
        setIsAddingSession(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => { 
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [editingSession, sessionToDelete, isAddingSession]);

  const handleManualAddSession = () => {
    if (!newSession.projectId || !newSession.goal) return;
    addSession({
      ...newSession,
      id: crypto.randomUUID()
    });
    setIsAddingSession(false);
  };

  const recentSessions = useMemo(() => {
    return state.sessions
      .filter((s: any) => s.projectId === activeProject?.id)
      .slice(-5)
      .reverse();
  }, [state.sessions, activeProject?.id]);

  const analytics = useMemo(() => {
    if (!activeProject) return null;
    return getProjectAnalytics(activeProject, state.sessions);
  }, [activeProject, state.sessions, getProjectAnalytics]);

  const coaching = useMemo(() => {
    if (!activeProject) return { message: '', evidence: '' };
    return getCoachingInsight(activeProject, state);
  }, [activeProject, state, getCoachingInsight]);

  const recoveryMessage = useMemo(() => {
    if (!activeProject) return '';
    return getRecoveryMessage(activeProject);
  }, [activeProject, getRecoveryMessage]);

  const restart = useMemo(() => {
    if (!activeProject) return { needed: false, daysAway: 0 };
    return getRestartState(activeProject);
  }, [activeProject, getRestartState]);

  const streakLabel = useMemo(() => {
    if (!activeProject) return '';
    return getStreakLabel(activeProject.lastCompletionDate, activeProject.streak);
  }, [activeProject, getStreakLabel]);

  const dashboard = useMemo(() => getCrossProjectSummary(state.projects, state.sessions), [state.projects, state.sessions, getCrossProjectSummary]);

  const ritualPronto = useMemo(() => {
    if (!activeProject) return false;
    return Object.values(activeProject.ritualChecks).every(Boolean);
  }, [activeProject?.ritualChecks]);

  const readyToStart = useMemo(() => {
    return !!activeProject;
  }, [activeProject]);

  const toggleRitual = (key: string) => {
    updateProject((p: any) => ({
      ...p,
      ritualChecks: { ...p.ritualChecks, [key]: !p.ritualChecks[key] }
    }));
  };

  const resetRitual = () => {
    updateProject((p: any) => ({
      ...p,
      ritualChecks: Object.keys(p.ritualChecks).reduce((acc: any, k) => ({ ...acc, [k]: false }), {})
    }));
  };

  const toggleRestartCheck = (key: string) => {
    updateProject((p: any) => ({
      ...p,
      restartChecks: { ...p.restartChecks, [key]: !p.restartChecks[key] }
    }));
  };

  return (
    <div className="page-container workspace-today">
      <header className="hero">
        <div className="hero-content">
          <p className="eyebrow" style={{ color: 'var(--accent)' }}>Active Project</p>
          <h1 style={{ margin: '8px 0' }}>{activeProject?.name || 'No Project Selected'}</h1>
          <p className="lede">{activeProject ? projectGoal(activeProject) : 'Select a project to start writing.'}</p>

          {activeProject?.restartMode && (
            <div className="alert" style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BellRing size={18} />
              <span><strong>Restart Mode Active:</strong> Complete the recovery ritual to unlock the timer.</span>
            </div>
          )}
        </div>

        <div className="hero-stats">
          <div className="stat-card">
            <span className="summary-label">Week/Min</span>
            <strong className="summary-value">{dashboard.totalWeeklyMinutes}</strong>
          </div>
          <div className="stat-card">
            <span className="summary-label">Streak</span>
            <strong className="summary-value">{activeProject?.streak || 0}d</strong>
          </div>
          <div className="stat-card">
            <span className="summary-label">Active Cases</span>
            <strong className="summary-value">{dashboard.activeCount}</strong>
          </div>
        </div>
      </header>

      <section className="today-two-column-layout">
        <div className="today-main-col">
          <TimerPanel {...{
            activeProject, mode, secondsLeft, formatTime, readyToStart,
            isPaused, togglePause,
            startSprint, resetTimer, completeSession, updateProject,
            setSecondsLeft, goalLibrary
          }} />

          <MobileAccordion title="Session Notes" defaultOpen={true}>
            <NotesPanel {...{
              setSessionNote, sessionNote, setRestartCue, restartCue,
              recentSessions, analytics
            }} />
          </MobileAccordion>
        </div>

        <div className="today-sidebar-col">
          <MobileAccordion title="Preparation Ritual" defaultOpen={true}>
            <RitualPanel {...{
              ritualSteps, ritualPronto, resetRitual, toggleRitual,
              activeProject, restart, restartSteps, activateRestartMode,
              toggleRestartCheck
            }} />
          </MobileAccordion>

          <MobileAccordion title="Session Log" defaultOpen={false}>
            <SessionPanel {...{
              outcomeOptions, activeProject, updateProject, state, setState,
              coaching, recoveryMessage, streakLabel, recentSessions, outcomeLabel,
              onEditSession: (session: any) => setEditingSession(session),
              onDeleteSession: (id: string) => setSessionToDelete(id),
              onAddSession: () => setIsAddingSession(true)
            }} />
          </MobileAccordion>
        </div>
      </section>

      {/* Manual Add Session Modal */}
      {isAddingSession && createPortal(
        <div className="modal-overlay" onClick={() => setIsAddingSession(false)}>
          <div className="modal-content card" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="panel-head">
              <h3>Manual Session Entry</h3>
              <button className="ghost" onClick={() => setIsAddingSession(false)}>✕</button>
            </div>

            <div className="modal-scroll-area" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
              <label className="input-block">
                <span>Project</span>
                <select 
                  value={newSession.projectId}
                  onChange={e => setNewSession({ ...newSession, projectId: e.target.value })}
                  style={{ background: 'var(--input-bg)' }}
                >
                  {state.projects.filter((p: any) => !p.archived).map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
                <label className="input-block">
                  <span>Date</span>
                  <input
                    type="date"
                    value={newSession.date}
                    onChange={e => setNewSession({ ...newSession, date: e.target.value })}
                  />
                </label>
                <label className="input-block">
                  <span>Time</span>
                  <input
                    type="time"
                    value={newSession.timeOfDay}
                    onChange={e => setNewSession({ ...newSession, timeOfDay: e.target.value })}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
                <label className="input-block">
                  <span>Duration (Minutes)</span>
                  <input
                    type="number"
                    value={newSession.minutes}
                    onChange={e => setNewSession({ ...newSession, minutes: Number(e.target.value) })}
                  />
                </label>
                <label className="input-block">
                  <span>Outcome</span>
                  <select 
                    value={newSession.outcome}
                    onChange={e => setNewSession({ ...newSession, outcome: e.target.value })}
                    style={{ background: 'var(--input-bg)' }}
                  >
                    {outcomeOptions.map((opt: any) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="input-block" style={{ marginTop: '12px' }}>
                <span>Goal / Target</span>
                <input
                  type="text"
                  placeholder="What was the intention?"
                  value={newSession.goal}
                  onChange={e => setNewSession({ ...newSession, goal: e.target.value })}
                />
              </label>

              <label className="input-block" style={{ marginTop: '12px' }}>
                <span>Notes</span>
                <textarea
                  placeholder="Reflections from this session..."
                  style={{ width: '100%', minHeight: '80px', background: 'var(--input-bg)', border: '1px solid var(--panel-border)', borderRadius: '14px', padding: '12px', color: 'var(--text)' }}
                  value={newSession.note}
                  onChange={e => setNewSession({ ...newSession, note: e.target.value })}
                />
              </label>
            </div>

            <div className="button-row-modal" style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <button 
                className="primary" 
                onClick={handleManualAddSession} 
                disabled={!newSession.projectId || !newSession.goal}
                style={{ flex: 1 }}
              >
                Save Session
              </button>
              <button className="ghost" onClick={() => setIsAddingSession(false)} style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Glassmorphism Session Edit Modal */}
      {editingSession && createPortal(
        <div className="modal-overlay" onClick={() => setEditingSession(null)}>
          <div className="modal-content card" onClick={e => e.stopPropagation()}>
            <div className="panel-head">
              <h3>Edit Session</h3>
              <button className="ghost" onClick={() => setEditingSession(null)}>✕</button>
            </div>

            <label className="input-block">
              <span>Goal</span>
              <input
                type="text"
                value={editingSession.goal}
                onChange={e => setEditingSession({ ...editingSession, goal: e.target.value })}
              />
            </label>

            <label className="input-block">
              <span>Minutes</span>
              <input
                type="number"
                value={editingSession.minutes}
                onChange={e => setEditingSession({ ...editingSession, minutes: Number(e.target.value) })}
              />
            </label>

            <label className="input-block" style={{ marginTop: '12px' }}>
              <span>Notes</span>
              <textarea
                className="textarea-block"
                style={{ width: '100%', minHeight: '100px', background: 'var(--input-bg)', border: '1px solid var(--panel-border)', borderRadius: '14px', padding: '12px', color: 'var(--text)' }}
                value={editingSession.note}
                onChange={e => setEditingSession({ ...editingSession, note: e.target.value })}
              />
            </label>

            <div className="button-row-modal" style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <button className="primary" onClick={() => {
                updateSession(editingSession.id, editingSession);
                setEditingSession(null);
              }} style={{ flex: 1 }}>Save Changes</button>
              <button className="ghost" onClick={() => setEditingSession(null)} style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Confirmation Modal for Deletion */}
      {sessionToDelete && createPortal(
        <div className="modal-overlay" onClick={() => setSessionToDelete(null)}>
          <div className="modal-content card" style={{ maxWidth: '400px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div className="panel-head" style={{ justifyContent: 'center' }}>
              <h3 style={{ margin: 0 }}>Delete Session?</h3>
            </div>

            <p style={{ color: 'var(--muted)', margin: '16px 0 32px', lineHeight: 1.5 }}>
              This action cannot be undone. This session will be permanently removed from your history.
            </p>

            <div className="button-row-modal">
              <button
                className="primary"
                onClick={() => {
                  deleteSession(sessionToDelete);
                  setSessionToDelete(null);
                }}
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                Yes, Delete
              </button>
              <button className="ghost" onClick={() => setSessionToDelete(null)}>Cancel</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Floating Toast Notification */}
      {toast?.visible && createPortal(
        <div className={`toast-container ${toast.type || ''}`}>
          <div className="toast-content">
            <span className="toast-message">{toast.message}</span>
            {toast.message === 'Session deleted' && (
              <button className="toast-action" onClick={restoreSession}>Undo</button>
            )}
            <button className="toast-close" onClick={() => setToast({ ...toast, visible: false })}>✕</button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export const TodayView = memo(TodayViewComponent);
