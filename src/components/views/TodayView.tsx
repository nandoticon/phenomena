import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { BellRing } from 'lucide-react';
import { MobileAccordion } from '../common/MobileAccordion';
import { RememberedDisclosure } from '../common/RememberedDisclosure';
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

const TODAY_SETUP_DISMISSED_KEY = 'phenomena-today-setup-dismissed';
const TODAY_RITUAL_COLLAPSED_KEY = 'phenomena-today-ritual-collapsed';
const TODAY_SESSIONS_COLLAPSED_KEY = 'phenomena-today-sessions-collapsed';

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
  activeProject,
  state,
  sessionsByProject,
  setState,
  mode,
  secondsLeft,
  setSecondsLeft,
  startSprint,
  resetTimer,
  completeSession,
  activateRestartMode,
  formatTime,
  updateProject,
  sessionNote,
  setSessionNote,
  restartCue,
  setRestartCue,
  deleteSession,
  updateSession,
  isPaused,
  togglePause,
  toast,
  setToast,
  restoreSession,
  addSession,
  sessionComposerRequest,
  sessionComposerProjectId,
}: TodayViewProps) {
  const safeActiveProject = activeProject ?? state.projects[0];
  const activeProjectSessions = useMemo(() => {
    if (!safeActiveProject) {
      return [];
    }
    return sessionsByProject[safeActiveProject.id] ?? [];
  }, [safeActiveProject, sessionsByProject]);

  const [editingSession, setEditingSession] = useState<SessionRecord | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [setupDismissed, setSetupDismissed] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.localStorage.getItem(TODAY_SETUP_DISMISSED_KEY) === 'true';
  });
  const lastComposerRequest = useRef<number | null>(null);

  useEffect(() => {
    if (editingSession || sessionToDelete || isAddingSession) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
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

  useEffect(() => {
    if (sessionComposerRequest === null || sessionComposerRequest === lastComposerRequest.current) {
      return;
    }
    lastComposerRequest.current = sessionComposerRequest;
    setIsAddingSession(true);
  }, [sessionComposerRequest]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(TODAY_SETUP_DISMISSED_KEY, String(setupDismissed));
    }
  }, [setupDismissed]);

  const recentSessions = useMemo(() => activeProjectSessions.slice(-5).reverse(), [activeProjectSessions]);
  const onboardingProject = safeActiveProject ?? state.projects[0];

  const analytics = useMemo(() => {
    if (!safeActiveProject) {
      return null;
    }
    return getProjectAnalytics(safeActiveProject, activeProjectSessions);
  }, [activeProjectSessions, safeActiveProject]);

  const coaching = useMemo(() => {
    if (!safeActiveProject) {
      return { message: '', evidence: '' };
    }
    return getCoachingInsight(safeActiveProject, { ...state, sessions: activeProjectSessions });
  }, [activeProjectSessions, safeActiveProject, state]);

  const recoveryMessage = useMemo(() => {
    if (!safeActiveProject) {
      return '';
    }
    return getRecoveryMessage(safeActiveProject);
  }, [safeActiveProject]);

  const restart = useMemo(() => {
    if (!safeActiveProject) {
      return { needed: false, daysAway: 0 };
    }
    return getRestartState(safeActiveProject);
  }, [safeActiveProject]);

  const streakLabel = useMemo(() => {
    if (!safeActiveProject) {
      return '';
    }
    return getStreakLabel(safeActiveProject.lastCompletionDate, safeActiveProject.streak);
  }, [safeActiveProject]);

  const dashboard = useMemo(() => getCrossProjectSummary(state.projects, sessionsByProject), [sessionsByProject, state.projects]);

  const ritualPronto = useMemo(() => {
    if (!safeActiveProject) {
      return false;
    }
    return Object.values(safeActiveProject.ritualChecks).every(Boolean);
  }, [safeActiveProject]);

  const hasFirstRun = state.sessions.length === 0;
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(() => {
    if (!hasFirstRun || typeof window === 'undefined') {
      return false;
    }
    return window.localStorage.getItem(ONBOARDING_STORAGE_KEY) !== 'true';
  });

  useEffect(() => {
    if (!hasFirstRun) {
      return;
    }

    if (window.localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true') {
      setShowOnboardingWizard(false);
    }
  }, [hasFirstRun]);

  const handleStartSprint = useCallback(() => {
    setSetupDismissed(true);
    startSprint();
  }, [startSprint]);

  const handleDismissSetup = useCallback(() => {
    setSetupDismissed(true);
  }, []);

  const toggleRitual = (key: string) => {
    updateProject((project) => ({
      ...project,
      ritualChecks: { ...project.ritualChecks, [key]: !project.ritualChecks[key] },
    }));
  };

  const resetRitual = () => {
    updateProject((project) => ({
      ...project,
      ritualChecks: Object.keys(project.ritualChecks).reduce<Record<string, boolean>>((acc, key) => ({ ...acc, [key]: false }), {}),
    }));
  };

  const toggleRestartCheck = (key: string) => {
    updateProject((project) => ({
      ...project,
      restartChecks: { ...project.restartChecks, [key]: !project.restartChecks[key] },
    }));
  };

  return (
    <div className="page-container workspace-today">
      <header className="hero today-hero">
        <div className="hero-content">
          <p className="eyebrow" style={{ color: 'var(--accent)' }}>Active Project</p>
          <h1 style={{ margin: '8px 0' }}>{activeProject?.name || 'No project selected'}</h1>
          <p className="lede">{activeProject ? projectGoal(activeProject) : 'Select a project to start writing.'}</p>

          {activeProject?.restartMode ? (
            <div className="alert" style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BellRing size={18} />
              <span><strong>Restart mode on:</strong> Complete the recovery ritual to unlock the timer.</span>
            </div>
          ) : null}
        </div>

        <div className="hero-stats today-hero-stats">
          <div className="stat-card today-stat-card">
            <span className="summary-label">Weekly Minutes</span>
            <strong className="summary-value">{dashboard.totalWeeklyMinutes}</strong>
          </div>
          <div className="stat-card today-stat-card">
            <span className="summary-label">Streak</span>
            <strong className="summary-value">{activeProject?.streak || 0}d</strong>
          </div>
          <div className="stat-card today-stat-card">
            <span className="summary-label">Active Projects</span>
            <strong className="summary-value">{dashboard.activeCount}</strong>
          </div>
        </div>
      </header>

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
          <TimerPanel
            activeProject={safeActiveProject as Project}
            mode={mode}
            secondsLeft={secondsLeft}
            formatTime={formatTime}
            readyToStart={Boolean(activeProject)}
            isPaused={isPaused}
            togglePause={togglePause}
            startSprint={handleStartSprint}
            resetTimer={resetTimer}
            completeSession={completeSession}
            updateProject={updateProject}
            setSecondsLeft={setSecondsLeft}
            goalLibrary={goalLibrary}
          />

          <div className="today-main-support-grid">
            {hasFirstRun && !setupDismissed && !showOnboardingWizard ? (
              <section
                className="card panel getting-started-panel today-setup-panel"
                style={{ marginBottom: '0', border: '1px solid var(--panel-border)', background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,122,89,0.06))' }}
                aria-label="Getting started"
              >
                <div className="panel-head compact-panel-head" style={{ marginBottom: '10px' }}>
                  <div>
                    <p className="eyebrow" style={{ color: 'var(--accent)' }}>First session setup</p>
                    <h2 style={{ margin: 0 }}>Set up your project</h2>
                  </div>
                  <button className="ghost compact" onClick={handleDismissSetup} type="button" aria-label="Dismiss getting started">Dismiss</button>
                </div>
                <div className="getting-started-grid">
                  <div className="getting-started-copy">
                    <p>Your workspace already has a default project. You can begin immediately and adjust the defaults later.</p>
                    <ul>
                      <li>Run a short focused sprint.</li>
                      <li>Add a return cue after the session.</li>
                      <li>Add another project only when the split is obvious.</li>
                    </ul>
                  </div>
                  <div className="getting-started-actions">
                    <button className="primary" onClick={() => setShowOnboardingWizard(true)} type="button">Open setup</button>
                    <button className="ghost" onClick={handleStartSprint} type="button">Start first sprint</button>
                    <p>Default timers and reminders can be adjusted from Projects and Account once you have a first pass of data.</p>
                  </div>
                </div>
              </section>
            ) : null}

            <div className="today-notes-slot">
              <MobileAccordion title="Session Notes" defaultOpen={true}>
                <NotesPanel
                  setSessionNote={setSessionNote}
                  sessionNote={sessionNote}
                  setRestartCue={setRestartCue}
                  restartCue={restartCue}
                  recentSessions={recentSessions}
                  analytics={analytics}
                />
              </MobileAccordion>
            </div>
          </div>
        </div>

        <div className="today-sidebar-col">
          <RememberedDisclosure
            storageKey={TODAY_RITUAL_COLLAPSED_KEY}
            title="Preparation Ritual"
            description={ritualPronto ? 'Ready to start.' : `${Object.values(safeActiveProject?.ritualChecks ?? {}).filter(Boolean).length}/4 steps complete.`}
            defaultOpen={false}
            className="workspace-disclosure"
          >
            <RitualPanel
              ritualSteps={ritualSteps}
              ritualPronto={ritualPronto}
              resetRitual={resetRitual}
              toggleRitual={toggleRitual}
              activeProject={safeActiveProject as Project}
              restart={restart}
              restartSteps={restartSteps}
              activateRestartMode={activateRestartMode}
              toggleRestartCheck={toggleRestartCheck}
            />
          </RememberedDisclosure>

          <RememberedDisclosure
            storageKey={TODAY_SESSIONS_COLLAPSED_KEY}
            title="Recent Sessions"
            description={recentSessions.length ? `${recentSessions.length} recent entries.` : 'No sessions yet.'}
            defaultOpen={false}
            className="workspace-disclosure"
          >
            <SessionPanel
              outcomeOptions={outcomeOptions}
              activeProject={safeActiveProject}
              updateProject={updateProject}
              state={state}
              setState={setState}
              coaching={coaching}
              recoveryMessage={recoveryMessage}
              streakLabel={streakLabel}
              recentSessions={recentSessions}
              outcomeLabel={outcomeLabel}
              onEditSession={(session) => setEditingSession(session)}
              onDeleteSession={(id) => setSessionToDelete(id)}
              onAddSession={() => setIsAddingSession(true)}
            />
          </RememberedDisclosure>
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
