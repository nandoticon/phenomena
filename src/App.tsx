import { ChangeEvent, useEffect, useMemo, useRef, useState, useCallback, lazy, Suspense } from 'react';
import { Moon, Sun, BookOpen, Activity, LayoutDashboard, Settings, Feather } from 'lucide-react';
import { hasSupabaseConfig, supabase } from './lib/supabase';
import { useAuth } from './hooks/useAuth';
import { useTimer } from './hooks/useTimer';
import { useCloudSync } from './hooks/useCloudSync';

import {
  Mood, Energy, Focus, SessionResultado, SessionRecord,
  CueTheme, WorkspaceView, UiTheme, Project, Profile,
  AppState, ChartPoint, ChartRange, ComparisonMetric,
  HistoryProjectFilter, HistoryOutcomeFilter, NotificationState
} from './types';

import {
  STORAGE_KEY, DEFAULT_PROJECT_ID, THEME_STORAGE_KEY,
  ritualCheckDefaults, restartCheckDefaults, createProfile,
  outcomeOptions, goalLibrary, ambientPresets
} from './constants';

import { getTodayKey, getTimeKey, formatCloudTimestamp } from './utils/date';
import { parseStoredState, serializeSyncState, createProject } from './utils/storage';
import {
  projectGoal, getStreakLabel, getReminderStatus, shouldTriggerReminder,
  getProjectAnalytics, getCrossProjectSummary, getCoachingInsight,
  getRecoveryMessage, getRestartState, outcomeLabel, getProjectAttachmentCount,
  getMoodSeries, getOutcomeSeries, getRecentDaySeries, getProjectComparisonSeries
} from './utils/analytics';

import { TodayViewSkeleton } from './components/common/Skeleton';

const TodayView = lazy(() => import('./components/views/TodayView').then(m => ({ default: m.TodayView })));
const ProjectsView = lazy(() => import('./components/views/ProjectsView').then(m => ({ default: m.ProjectsView })));
const InsightsView = lazy(() => import('./components/views/InsightsView').then(m => ({ default: m.InsightsView })));
const AccountView = lazy(() => import('./components/views/AccountView').then(m => ({ default: m.AccountView })));

export default function App() {
  const [state, setState] = useState<AppState>(() => parseStoredState(localStorage.getItem(STORAGE_KEY)));
  const [hydrated, setHydrated] = useState(false);

  const { session, authView, setAuthView, authEmail, setAuthEmail, authPassword, setAuthPassword, authPasswordConfirm, setAuthPasswordConfirm, authMessage, setAuthMessage, passwordMessage, setSenhaMessage, profile, setProfile, profileLoaded, setProfileLoaded, profileMessage, setProfileMessage, signInWithPassword, signUpWithPassword, sendPasswordReset, updatePassword, signOut } = useAuth(supabase, hasSupabaseConfig, createProfile);
  const { cloudStatus, setNuvemStatus, remoteLoaded, setRemoteLoaded, remoteSnapshot, setRemoteSnapshot, remoteUpdatedAt, setRemoteUpdatedAt, normalizedMessage, setNormalizedMessage, pullCloudState, pushLocalState } = useCloudSync(supabase, hasSupabaseConfig, session, state, setState, hydrated, profile);
  const [notificationState, setNotificationState] = useState<NotificationState>('default');
  const [toast, setToast] = useState<{ message: string; visible: boolean; type?: 'info' | 'success' } | null>(null);
  const [lastDeletedSession, setLastDeletedSession] = useState<SessionRecord | null>(null);
  const [importMessage, setImportMessage] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectNote, setNewProjectNote] = useState('');
  const [sessionNote, setSessionNote] = useState('');
  const [restartCue, setRestartCue] = useState('');
  const [newAttachmentLabel, setNewAttachmentLabel] = useState('');
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');

  const updateProject = useCallback((updater: (project: Project) => Project) => {
    setState((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === current.activeProjectId ? updater(project) : project,
      ),
    }));
  }, []);

  const setActiveProject = useCallback((projectId: string) => {
    setProfile((current) => (current ? { ...current, active_project_id: projectId } : current));
    setState((current) => ({ ...current, activeProjectId: projectId }));
  }, [setProfile]);

  const createNewProject = useCallback(() => {
    if (!newProjectName.trim()) return;
    const project = createProject(crypto.randomUUID(), newProjectName.trim(), newProjectNote.trim());
    setState((current) => ({
      ...current,
      projects: [...current.projects, project],
      activeProjectId: project.id,
    }));
    setToast({ message: `Project "${newProjectName.trim()}" created!`, type: 'success', visible: true });
    setNewProjectName('');
    setNewProjectNote('');
  }, [newProjectName, newProjectNote, setState]);

  const archiveActiveProject = useCallback(() => {
    setState((current) => ({
      ...current,
      projects: current.projects.map((p) => (p.id === current.activeProjectId ? { ...p, archived: true } : p)),
    }));
  }, [setState]);

  const restoreProject = useCallback((projectId: string) => {
    setState((current) => ({
      ...current,
      projects: current.projects.map((p) => (p.id === projectId ? { ...p, archived: false } : p)),
    }));
  }, [setState]);

  const addAttachment = useCallback(() => {
    if (!newAttachmentLabel.trim() || !newAttachmentUrl.trim()) return;
    updateProject((p) => ({
      ...p,
      attachments: [
        ...p.attachments,
        { id: crypto.randomUUID(), label: newAttachmentLabel.trim(), url: newAttachmentUrl.trim() },
      ],
    }));
    setNewAttachmentLabel('');
    setNewAttachmentUrl('');
  }, [newAttachmentLabel, newAttachmentUrl, updateProject]);

  const removeAttachment = useCallback((attachmentId: string) => {
    updateProject((p) => ({
      ...p,
      attachments: p.attachments.filter((a) => a.id !== attachmentId),
    }));
  }, [updateProject]);

  const deleteSession = useCallback((sessionId: string) => {
    setState((current) => {
      const sessionToDelete = current.sessions.find(s => s.id === sessionId);
      if (sessionToDelete) setLastDeletedSession(sessionToDelete);

      return {
        ...current,
        sessions: current.sessions.filter((s) => s.id !== sessionId),
      };
    });
    setToast({ message: 'Session deleted', visible: true });
    setTimeout(() => setToast(current => current?.message === 'Session deleted' ? { ...current, visible: false } : current), 5000);
  }, []);

  const restoreSession = useCallback(() => {
    if (!lastDeletedSession) return;
    setState((current) => ({
      ...current,
      sessions: [...current.sessions, lastDeletedSession].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.timeOfDay}`).getTime();
        const dateB = new Date(`${b.date}T${b.timeOfDay}`).getTime();
        return dateA - dateB; // Sort back to chronological or just push
      }).slice(-240),
    }));
    setLastDeletedSession(null);
    setToast({ message: 'Session restored', visible: true, type: 'success' });
    setTimeout(() => setToast(current => current?.message === 'Session restored' ? { ...current, visible: false } : current), 3000);
  }, [lastDeletedSession]);

  const updateSession = useCallback((sessionId: string, updates: Partial<SessionRecord>) => {
    setState((current) => ({
      ...current,
      sessions: current.sessions.map((s) => (s.id === sessionId ? { ...s, ...updates } : s)),
    }));
  }, []);

  const updateProfile = useCallback((key: string, value: any) => {
    setProfile((current) => (current ? { ...current, [key]: value } : current));
  }, [setProfile]);

  const applyProfileDefaultsToActiveProject = useCallback(() => {
    if (!profile) return;
    updateProject((p) => ({
      ...p,
      sprintMinutes: profile.default_sprint_minutes,
      breakMinutes: profile.default_break_minutes,
      reminderChannel: profile.reminder_channel,
      reminderEnabled: profile.email_reminders_enabled,
      reminderTime: profile.email_reminder_time,
    }));
  }, [profile, updateProject]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
    } else {
      document.exitFullscreen().catch(() => { });
    }
  }, []);

  const { mode, setMode, isPaused, togglePause, secondsLeft, setSecondsLeft, startSprint, resetTimer, completeSession, activateRestartMode, formatTime } = useTimer(
    state.projects.find((project) => project.id === state.activeProjectId) ?? state.projects[0],
    updateProject, state, setState, sessionNote, restartCue, setSessionNote, setRestartCue
  );

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [historyQuery, setHistoryQuery] = useState('');
  const [historyProjectFilter, setHistoryProjectFilter] = useState<HistoryProjectFilter>('active');
  const [historyOutcomeFilter, setHistoryOutcomeFilter] = useState<HistoryOutcomeFilter>('all');
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>('today');
  const [uiTheme, setUiTheme] = useState<UiTheme>('dark');
  const [chartRange, setChartRange] = useState<ChartRange>('30d');
  const [comparisonMetric, setComparisonMetric] = useState<ComparisonMetric>('minutes');
  const [activeChartPoint, setActiveChartPoint] = useState<ChartPoint | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const exportBackup = useCallback(() => {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phenomena-backup-${getTodayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const importBackup = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        setState(parseStoredState(JSON.stringify(parsed)));
        setImportMessage('Backup restored successfully.');
        setTimeout(() => setImportMessage(''), 4000);
      } catch {
        setImportMessage('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  }, [setState]);

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setUiTheme(storedTheme);
    }
    const activeProject = state.projects.find((project) => project.id === state.activeProjectId) ?? state.projects[0];
    setSecondsLeft((activeProject?.sprintMinutes ?? 15) * 60);
    setNotificationState(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission);
    setHydrated(true);
  }, [state.activeProjectId, state.projects, setSecondsLeft]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  useEffect(() => {
    document.body.classList.toggle('theme-light', uiTheme === 'light');
    document.body.classList.toggle('theme-dark', uiTheme === 'dark');
    localStorage.setItem(THEME_STORAGE_KEY, uiTheme);
  }, [uiTheme]);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    setActiveChartPoint(null);
  }, [chartRange, comparisonMetric, state.activeProjectId]);

  const activeProject = useMemo(
    () => state.projects.find((project) => project.id === state.activeProjectId) ?? state.projects[0],
    [state.activeProjectId, state.projects],
  );

  const activeProjetos = useMemo(() => state.projects.filter((project) => !project.archived), [state.projects]);
  const archivedProjetos = useMemo(() => state.projects.filter((project) => project.archived), [state.projects]);

  const historySessions = useMemo(() => {
    return state.sessions
      .filter((session) => {
        if (historyProjectFilter === 'active') {
          const project = state.projects.find((p) => p.id === session.projectId);
          return project && !project.archived;
        }
        if (historyProjectFilter === 'all') {
          return true;
        }
        return session.projectId === state.activeProjectId;
      })
      .filter((session) => {
        if (historyOutcomeFilter === 'all') return true;
        return session.outcome === historyOutcomeFilter;
      })
      .filter((session) => {
        if (!historyQuery.trim()) return true;
        const q = historyQuery.toLowerCase();
        const project = state.projects.find((p) => p.id === session.projectId);
        return (
          project?.name.toLowerCase().includes(q) ||
          session.note.toLowerCase().includes(q) ||
          session.goal.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.timeOfDay}`).getTime();
        const dateB = new Date(`${b.date}T${b.timeOfDay}`).getTime();
        return dateB - dateA;
      });
  }, [state.sessions, state.projects, historyProjectFilter, historyOutcomeFilter, historyQuery, state.activeProjectId]);

  const toggleReminder = useCallback(() => {
    if (!activeProject) return;
    if (!activeProject.reminderEnabled && notificationState === 'default' && typeof Notification !== 'undefined') {
      Notification.requestPermission().then((permission) => {
        setNotificationState(permission);
        if (permission === 'granted') {
          updateProject((p) => ({ ...p, reminderEnabled: true }));
        }
      });
    } else {
      updateProject((p) => ({ ...p, reminderEnabled: !p.reminderEnabled }));
    }
  }, [activeProject, notificationState, updateProject]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      state.projects.forEach((project) => {
        if (shouldTriggerReminder(project)) {
          if (notificationState === 'granted' && typeof Notification !== 'undefined') {
            new Notification('Phenomena', {
              body: `Time to return to ${project.name}. Maintain the momentum.`,
              icon: '/vite.svg',
            });
          } else {
            alert(`Reminder: Time for ${project.name}.`);
          }
          setState((current) => ({
            ...current,
            projects: current.projects.map((p) =>
              p.id === project.id ? { ...p, lastReminderDate: getTodayKey() } : p,
            ),
          }));
        }
      });
    }, 60000);
    return () => window.clearInterval(timer);
  }, [state.projects, notificationState]);

  const projectNameMap = useMemo(() => {
    return state.projects.reduce<Record<string, string>>((acc, project) => {
      acc[project.id] = project.name;
      return acc;
    }, {});
  }, [state.projects]);

  return (
    <div className={`app-container ${isFullscreen ? 'is-fullscreen' : ''} ${uiTheme === 'light' ? 'theme-light' : 'theme-dark'} ${mode === 'sprint' ? 'focus-dim-bg' : ''}`}>
      <main className={`workspace-main ${isFullscreen ? 'fullscreen-mode' : 'shell'}`} style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>
        <Suspense fallback={<TodayViewSkeleton />}>
          {workspaceView === 'today' && (
            <TodayView
              key="today"
              activeProject={activeProject}
              state={state}
              setState={setState}
              mode={mode}
              secondsLeft={secondsLeft}
              setSecondsLeft={setSecondsLeft}
              isPaused={isPaused}
              togglePause={togglePause}
              startSprint={startSprint}
              resetTimer={resetTimer}
              completeSession={completeSession}
              activateRestartMode={activateRestartMode}
              formatTime={formatTime}
              updateProject={updateProject}
              sessionNote={sessionNote}
              setSessionNote={setSessionNote}
              restartCue={restartCue}
              setRestartCue={setRestartCue}
              getStreakLabel={getStreakLabel}
              projectGoal={projectGoal}
              getCoachingInsight={getCoachingInsight}
              getRecoveryMessage={getRecoveryMessage}
              getRestartState={getRestartState}
              outcomeLabel={outcomeLabel}
              getCrossProjectSummary={getCrossProjectSummary}
              deleteSession={deleteSession}
              updateSession={updateSession}
              toast={toast}
              setToast={setToast}
              restoreSession={restoreSession}
            />
          )}

          {workspaceView === 'projects' && (
            <ProjectsView
              key="projects"
              activeProjetos={activeProjetos}
              activeProject={activeProject}
              setActiveProject={setActiveProject}
              setMode={setMode}
              setSecondsLeft={setSecondsLeft}
              updateProject={updateProject}
              createNewProject={createNewProject}
              archiveActiveProject={archiveActiveProject}
              newProjectName={newProjectName}
              setNewProjectName={setNewProjectName}
              newProjectNote={newProjectNote}
              setNewProjectNote={setNewProjectNote}
              removeAttachment={removeAttachment}
              newAttachmentLabel={newAttachmentLabel}
              setNewAttachmentLabel={setNewAttachmentLabel}
              newAttachmentUrl={newAttachmentUrl}
              setNewAttachmentUrl={setNewAttachmentUrl}
              addAttachment={addAttachment}
              archivedProjetos={archivedProjetos}
              restoreProject={restoreProject}
              ambientPresets={ambientPresets}
              toggleFullscreen={toggleFullscreen}
              isFullscreen={isFullscreen}
              toggleReminder={toggleReminder}
              notificationState={notificationState}
              getReminderStatus={getReminderStatus}
            />
          )}

          {workspaceView === 'insights' && (
            <InsightsView
              key="insights"
              state={state}
              activeProject={activeProject}
              historySessions={historySessions}
              historyQuery={historyQuery}
              setHistoryQuery={setHistoryQuery}
              historyProjectFilter={historyProjectFilter}
              setHistoryProjectFilter={setHistoryProjectFilter}
              historyOutcomeFilter={historyOutcomeFilter}
              setHistoryOutcomeFilter={setHistoryOutcomeFilter}
              chartRange={chartRange}
              setChartRange={setChartRange}
              comparisonMetric={comparisonMetric}
              setComparisonMetric={setComparisonMetric}
              activeChartPoint={activeChartPoint}
              setActiveChartPoint={setActiveChartPoint}
              getCrossProjectSummary={getCrossProjectSummary}
              getProjectAnalytics={getProjectAnalytics}
              getRecentDaySeries={getRecentDaySeries}
              getOutcomeSeries={getOutcomeSeries}
              getMoodSeries={getMoodSeries}
              getProjectComparisonSeries={getProjectComparisonSeries}
              outcomeLabel={outcomeLabel}
              projectNameMap={projectNameMap}
            />
          )}

          {workspaceView === 'account' && (
            <AccountView
              key="account"
              session={session}
              authView={authView}
              setAuthView={setAuthView}
              authEmail={authEmail}
              setAuthEmail={setAuthEmail}
              authPassword={authPassword}
              setAuthPassword={setAuthPassword}
              authPasswordConfirm={authPasswordConfirm}
              setAuthPasswordConfirm={setAuthPasswordConfirm}
              authMessage={authMessage}
              passwordMessage={passwordMessage}
              profile={profile}
              profileMessage={profileMessage}
              setProfile={setProfile}
              signInWithPassword={signInWithPassword}
              signUpWithPassword={signUpWithPassword}
              sendPasswordReset={sendPasswordReset}
              updatePassword={updatePassword}
              signOut={signOut}
              cloudStatus={cloudStatus}
              remoteLoaded={remoteLoaded}
              remoteSnapshot={remoteSnapshot}
              getProjectAttachmentCount={getProjectAttachmentCount}
              remoteUpdatedAt={remoteUpdatedAt}
              normalizedMessage={normalizedMessage}
              pullCloudState={pullCloudState}
              pushLocalState={pushLocalState}
              uiTheme={uiTheme}
              setUiTheme={setUiTheme}
              importMessage={importMessage}
              setImportMessage={setImportMessage}
              activeProject={activeProject}
              updateProject={updateProject}
              reminderStatus={getReminderStatus(notificationState, activeProject?.reminderEnabled || false)}
              enableNotifications={toggleReminder}
              fileInputRef={fileInputRef}
              state={state}
              setState={setState}
              updateProfile={updateProfile}
              applyProfileDefaultsToActiveProject={applyProfileDefaultsToActiveProject}
              hasSupabaseConfig={hasSupabaseConfig}
              formatCloudTimestamp={formatCloudTimestamp}
              exportBackup={exportBackup}
              importBackup={importBackup}
            />
          )}
        </Suspense>
      </main>

      <nav className="workspace-nav">
        <div className="nav-content">
          <button
            className={`nav-item ${workspaceView === 'today' ? 'active' : ''}`}
            onClick={() => setWorkspaceView('today')}
            aria-label="Today"
          >
            <Feather size={20} />
            <span>Today</span>
          </button>
          <button
            className={`nav-item ${workspaceView === 'projects' ? 'active' : ''}`}
            onClick={() => setWorkspaceView('projects')}
            aria-label="Projects"
          >
            <BookOpen size={20} />
            <span>Projects</span>
          </button>
          <button
            className={`nav-item ${workspaceView === 'insights' ? 'active' : ''}`}
            onClick={() => setWorkspaceView('insights')}
            aria-label="Insights"
          >
            <Activity size={20} />
            <span>Insights</span>
          </button>
          <button
            className={`nav-item ${workspaceView === 'account' ? 'active' : ''}`}
            onClick={() => setWorkspaceView('account')}
            aria-label="Account"
          >
            <Settings size={20} />
            <span>Account</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
