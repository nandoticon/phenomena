import React, { memo, useMemo } from 'react';
import { BellRing } from 'lucide-react';
import { MobileAccordion } from '../common/MobileAccordion';
import { TimerPanel } from '../common/TimerPanel';
import { NotesPanel } from '../common/NotesPanel';
import { RitualPanel } from '../common/RitualPanel';
import { SessionPanel } from '../common/SessionPanel';
import { goalLibrary, ritualSteps, restartSteps, outcomeOptions } from '../../constants';
import { getProjectAnalytics } from '../../utils/analytics';

function TodayViewComponent({
  activeProject, state, setState, mode, secondsLeft, setSecondsLeft,
  startSprint, resetTimer, completeSession, activateRestartMode,
  formatTime, updateProject, sessionNote, setSessionNote,
  restartCue, setRestartCue, getStreakLabel, projectGoal,
  getCoachingInsight, getRecoveryMessage, getRestartState, outcomeLabel,
  getCrossProjectSummary
}: any) {
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
    if (!activeProject) return false;
    if (activeProject.restartMode) {
      return Object.values(activeProject.restartChecks).every(Boolean);
    }
    return ritualPronto;
  }, [activeProject, ritualPronto]);

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
      <header className="hero card">
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
              coaching, recoveryMessage, streakLabel, recentSessions, outcomeLabel
            }} />
          </MobileAccordion>
        </div>
      </section>
    </div>
  );
}

export const TodayView = memo(TodayViewComponent);
