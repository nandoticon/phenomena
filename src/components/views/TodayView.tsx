import React, { memo, useMemo } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { BellRing } from 'lucide-react';
import { MobileAccordion } from '../common/MobileAccordion';
import { TimerPanel } from '../common/TimerPanel';
import { NotesPanel } from '../common/NotesPanel';
import { RitualPanel } from '../common/RitualPanel';
import { SessionPanel } from '../common/SessionPanel';
import { SessionEditorModal } from '../common/SessionEditorModal';
import { SessionDeleteModal } from '../common/SessionDeleteModal';
import { OnboardingWizard, ONBOARDING_STORAGE_KEY } from '../common/OnboardingWizard';
import { ToastNotification } from '../common/ToastNotification';
import { goalLibrary, ritualSteps, restartSteps, outcomeOptions } from '../../constants';
import {
  getCrossProjectSummary,
  getCoachingInsight,
  getRecoveryMessage,
  getRestartState,
  getStreakLabel,
  outcomeLabel,
  projectGoal,
  getProjectAnalytics,
} from '../../utils/analytics';
import { createSessionDraft } from '../../utils/session';
import type { SessionsByProjectId } from '../../utils/analytics';
import type { AppState, Project, SessionRecord } from '../../types';

interface TodayViewProps {
  activeProject: Project | undefined;
  state: AppState;
  sessionsByProject: SessionsByProjectId;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  mode: 'idle' | 'sprint' | 'break';
  secondsLeft: number;
  setSecondsLeft: (value: number | ((prev: number) => number)) => void;
  startSprint: () => void;
  resetTimer: () => void;
  completeSession: () => void;
  activateRestartMode: () => void;
  formatTime: (seconds: number) => string;
  updateProject: (updater: (project: Project) => Project) => void;
  sessionNote: string;
  setSessionNote: Dispatch<SetStateAction<string>>;
  restartCue: string;
  setRestartCue: Dispatch<SetStateAction<string>>;
  deleteSession: (sessionId: string) => void;
  updateSession: (sessionId: string, updates: Partial<SessionRecord>) => void;
  isPaused: boolean;
  togglePause: () => void;
  toast: { message: string; visible: boolean; type?: 'info' | 'success' } | null;
  setToast: React.Dispatch<React.SetStateAction<{ message: string; visible: boolean; type?: 'info' | 'success' } | null>>;
  restoreSession: () => void;
  addSession: (session: SessionRecord) => void;
  sessionComposerRequest: number | null;
  sessionComposerProjectId: string | null;
}

function TodayViewComponent({
  activeProject, state, sessionsByProject, setState, mode, secondsLeft, setSecondsLeft,
  startSprint, resetTimer, completeSession, activateRestartMode,
  formatTime, updateProject, sessionNote, setSessionNote,
  restartCue, setRestartCue, deleteSession, updateSession,
  isPaused, togglePause, toast, setToast, restoreSession, addSession
  , sessionComposerRequest, sessionComposerProjectId
}: TodayViewProps) {
  const safeActiveProject = activeProject ?? state.projects[0];
  const activeProjectSessions = useMemo(() => {
    if (!safeActiveProject) return [];
    return sessionsByProject[safeActiveProject.id] ?? [];
  }, [safeActiveProject, sessionsByProject]);
  const [editingSession, setEditingSession] = React.useState<SessionRecord | null>(null);
  const [sessionToDelete, setSessionToDelete] = React.useState<string | null>(null);
  const [isAddingSession, setIsAddingSession] = React.useState(false);
  const lastComposerRequest = React.useRef<number | null>(null);

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

  React.useEffect(() => {
    if (sessionComposerRequest === null || sessionComposerRequest === lastComposerRequest.current) {
      return;
    }
    lastComposerRequest.current = sessionComposerRequest;
    setIsAddingSession(true);
  }, [sessionComposerRequest]);

  const recentSessions = useMemo(() => {
    return activeProjectSessions.slice(-5).reverse();
  }, [activeProjectSessions]);
  const onboardingProject = safeActiveProject ?? state.projects[0];

  const analytics = useMemo(() => {
    if (!safeActiveProject) return null;
    return getProjectAnalytics(safeActiveProject, activeProjectSessions);
  }, [activeProjectSessions, safeActiveProject]);

  const coaching = useMemo(() => {
    if (!safeActiveProject) return { message: '', evidence: '' };
    return getCoachingInsight(safeActiveProject, { ...state, sessions: activeProjectSessions });
  }, [activeProjectSessions, safeActiveProject, state]);

  const recoveryMessage = useMemo(() => {
    if (!safeActiveProject) return '';
    return getRecoveryMessage(safeActiveProject);
  }, [safeActiveProject]);

  const restart = useMemo(() => {
    if (!safeActiveProject) return { needed: false, daysAway: 0 };
    return getRestartState(safeActiveProject);
  }, [safeActiveProject]);

  const streakLabel = useMemo(() => {
    if (!safeActiveProject) return '';
    return getStreakLabel(safeActiveProject.lastCompletionDate, safeActiveProject.streak);
  }, [safeActiveProject]);

  const dashboard = useMemo(() => getCrossProjectSummary(state.projects, sessionsByProject), [sessionsByProject, state.projects]);

  const ritualPronto = useMemo(() => {
    if (!safeActiveProject) return false;
    return Object.values(safeActiveProject.ritualChecks).every(Boolean);
  }, [safeActiveProject]);

  const readyToStart = useMemo(() => {
    return !!activeProject;
  }, [activeProject]);
  const hasFirstRun = state.sessions.length === 0;
  const [showOnboardingWizard, setShowOnboardingWizard] = React.useState(() => {
    if (!hasFirstRun || typeof window === 'undefined') {
      return false;
    }
    return window.localStorage.getItem(ONBOARDING_STORAGE_KEY) !== 'true';
  });

  React.useEffect(() => {
    if (!hasFirstRun) {
      return;
    }

    if (window.localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true') {
      setShowOnboardingWizard(false);
    }
  }, [hasFirstRun]);

  const toggleRitual = (key: string) => {
    updateProject((p) => ({
      ...p,
      ritualChecks: { ...p.ritualChecks, [key]: !p.ritualChecks[key] }
    }));
  };

  const resetRitual = () => {
    updateProject((p) => ({
      ...p,
      ritualChecks: Object.keys(p.ritualChecks).reduce<Record<string, boolean>>((acc, k) => ({ ...acc, [k]: false }), {})
    }));
  };

  const toggleRestartCheck = (key: string) => {
    updateProject((p) => ({
      ...p,
      restartChecks: { ...p.restartChecks, [key]: !p.restartChecks[key] }
    }));
  };

  return (
    <div className="page-container workspace-today">
      <header className="hero">
        <div className="hero-content">
          <p className="eyebrow" style={{ color: 'var(--accent)' }}>Active Project</p>
          <h1 style={{ margin: '8px 0' }}>{activeProject?.name || 'No project selected'}</h1>
          <p className="lede">{activeProject ? projectGoal(activeProject) : 'Select a project to start writing.'}</p>

          {activeProject?.restartMode && (
            <div className="alert" style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BellRing size={18} />
              <span><strong>Restart mode on:</strong> Complete the recovery ritual to unlock the timer.</span>
            </div>
          )}
        </div>

        <div className="hero-stats">
          <div className="stat-card">
            <span className="summary-label">Weekly Minutes</span>
            <strong className="summary-value">{dashboard.totalWeeklyMinutes}</strong>
          </div>
          <div className="stat-card">
            <span className="summary-label">Streak</span>
            <strong className="summary-value">{activeProject?.streak || 0}d</strong>
          </div>
          <div className="stat-card">
            <span className="summary-label">Active Projects</span>
            <strong className="summary-value">{dashboard.activeCount}</strong>
          </div>
        </div>
      </header>

      {hasFirstRun && !showOnboardingWizard ? (
        <section
          className="card panel"
          style={{ marginBottom: '24px', border: '1px solid var(--panel-border)', background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,122,89,0.06))' }}
          aria-label="Getting started"
        >
          <div className="panel-head" style={{ marginBottom: '12px' }}>
            <div>
              <p className="eyebrow" style={{ color: 'var(--accent)' }}>First session setup</p>
              <h2 style={{ margin: 0 }}>Set up your project</h2>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '16px', alignItems: 'start' }}>
            <div style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
              <p style={{ marginTop: 0 }}>Your workspace already has a default project. You can begin immediately and adjust the defaults later.</p>
              <ul style={{ margin: 0, paddingLeft: '18px' }}>
                <li>Run a short focused sprint.</li>
                <li>Add a return cue after the session.</li>
                <li>Add another project only when the split is obvious.</li>
              </ul>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="primary" onClick={() => setShowOnboardingWizard(true)} type="button">Open setup</button>
              <button className="ghost" onClick={startSprint} type="button">Start first sprint</button>
              <p style={{ margin: 0, color: 'var(--secondary)', fontSize: '0.9rem' }}>
                Default timers and reminders can be adjusted from Projects and Account once you have a first pass of data.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {onboardingProject ? (
        <OnboardingWizard
          open={showOnboardingWizard}
          project={onboardingProject}
          onApply={(updates) => updateProject((project) => ({ ...project, ...updates }))}
          onClose={() => setShowOnboardingWizard(false)}
        />
      ) : null}

      <section className="today-two-column-layout">
        <div className="today-main-col">
          <TimerPanel {...{
            activeProject: safeActiveProject, mode, secondsLeft, formatTime, readyToStart,
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
              activeProject: safeActiveProject, restart, restartSteps, activateRestartMode,
              toggleRestartCheck
            }} />
          </MobileAccordion>

          <MobileAccordion title="Recent Sessions" defaultOpen={false}>
            <SessionPanel {...{
              outcomeOptions, activeProject: safeActiveProject, updateProject, state, setState,
              coaching, recoveryMessage, streakLabel, recentSessions, outcomeLabel,
              onEditSession: (session: SessionRecord) => setEditingSession(session),
              onDeleteSession: (id: string) => setSessionToDelete(id),
              onAddSession: () => setIsAddingSession(true)
            }} />
          </MobileAccordion>
        </div>
      </section>

      <SessionEditorModal
        open={isAddingSession || Boolean(editingSession)}
        mode={editingSession ? 'edit' : 'create'}
        session={editingSession || (isAddingSession ? createSessionDraft(sessionComposerProjectId || activeProject?.id || state.projects[0]?.id || '') : null)}
        projects={state.projects}
        onSubmit={(session) => {
          if (editingSession) {
            updateSession(editingSession.id, session);
            setEditingSession(null);
          } else {
            addSession(session);
            setIsAddingSession(false);
          }
        }}
        onClose={() => {
          setEditingSession(null);
          setIsAddingSession(false);
        }}
      />

      <SessionDeleteModal
        open={Boolean(sessionToDelete)}
        titleId="delete-session-title"
        onConfirm={() => {
          if (sessionToDelete) {
            deleteSession(sessionToDelete);
            setSessionToDelete(null);
          }
        }}
        onCancel={() => setSessionToDelete(null)}
      />

      {toast?.visible ? (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onUndo={toast.message === 'Session deleted' ? restoreSession : undefined}
          onClose={() => setToast({ ...toast, visible: false })}
        />
      ) : null}
    </div>
  );
}

export const TodayView = memo(TodayViewComponent);
