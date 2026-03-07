// @ts-nocheck
import { useState, useEffect } from 'react';
import type { Project, SessionRecord } from '../types';

export function useTimer(
  activeProject: Project | undefined,
  updateProject: (updater: (project: Project) => Project) => void,
  state: any,
  setState: any,
  sessionNote: string,
  restartCue: string,
  setSessionNote: any,
  setRestartCue: any,
  getTodayKey: any,
  getTimeKey: any,
  getDayDiff: any,
  createSessionId: any,
  ritualCheckDefaults: any,
  restartCheckDefaults: any
) {
  const [mode, setMode] = useState<'idle' | 'sprint' | 'break'>('idle');
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);

  useEffect(() => {
    if (!activeProject) {
      return;
    }
    if (mode === 'idle') {
      setSecondsLeft(activeProject.sprintMinutes * 60);
    }
  }, [activeProject, mode]);

  useEffect(() => {
    if (mode === 'idle' || !activeProject) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          if (mode === 'sprint') {
            setMode('break');
            return activeProject.breakMinutes * 60;
          }
          setMode('idle');
          return activeProject.sprintMinutes * 60;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activeProject, mode]);

  function startSprint() {
    setMode('sprint');
    setSecondsLeft(activeProject.sprintMinutes * 60);
  }

  function resetTimer() {
    setMode('idle');
    setSecondsLeft(activeProject.sprintMinutes * 60);
  }

  function completeSession() {
    const today = getTodayKey();
    const hadHoje = activeProject.lastCompletionDate === today;
    const previousDate = activeProject.lastCompletionDate;
    const usedRestartMode = activeProject.restartMode;

    let nextSequência = 1;
    if (hadHoje) {
      nextSequência = activeProject.streak;
    } else if (previousDate) {
      nextSequência = getDayDiff(previousDate, today) === 1 ? activeProject.streak + 1 : 1;
    }

    const minutesWorked = mode === 'sprint' ? activeProject.sprintMinutes - Math.floor(secondsLeft / 60) : activeProject.sprintMinutes;
    const record: SessionRecord = {
      id: createSessionId(activeProject.id),
      date: today,
      timeOfDay: getTimeKey(),
      minutes: Math.max(1, minutesWorked),
      mood: state.mood,
      energy: state.energy,
      focus: state.focus,
      goal: activeGoal,
      outcome: activeProject.sessionOutcome,
      projectId: activeProject.id,
      note: sessionNote.trim(),
      restartCue: restartCue.trim(),
      usedRestartMode,
    };

    setState((current) => ({
      ...current,
      sessions: [...current.sessions, record].slice(-240),
      projects: current.projects.map((project) =>
        project.id === current.activeProjectId
          ? {
            ...project,
            streak: nextSequência,
            lastCompletionDate: today,
            lastReminderDate: today,
            ritualChecks: ritualCheckDefaults(),
            restartChecks: restartCheckDefaults(),
            restartMode: false,
          }
          : project,
      ),
    }));

    setSessionNote('');
    setRestartCue('');
    setMode('idle');
    setSecondsLeft(activeProject.sprintMinutes * 60);
  }

  function activateRestartMode() {
    updateProject((project) => ({
      ...project,
      selectedGoal: 'Bater 50 palavras',
      customGoal: 'Re-enter the manuscript with an ugly paragraph.',
      sessionOutcome: 'showed-up',
      sprintMinutes: 10,
      breakMinutes: 3,
      ritualChecks: ritualCheckDefaults(),
      restartChecks: restartCheckDefaults(),
      restartMode: true,
    }));
    setSessionNote('What served as the spark to come today?');
    setRestartCue('Which hook is the easiest to pull on your next start?');
    setMode('idle');
    setSecondsLeft(10 * 60);
  }

  function formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}`;
  }


  return {
    mode, setMode, secondsLeft, setSecondsLeft,
    startSprint, resetTimer, completeSession, activateRestartMode, formatTime
  };
}
