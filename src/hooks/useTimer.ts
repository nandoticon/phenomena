import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Project, SessionRecord, AppState } from '../types';
import { ritualCheckDefaults, restartCheckDefaults } from '../constants';
import { getTodayKey, getTimeKey, getDayDiff } from '../utils/date';
import { createSessionId } from '../utils/storage';

export function useTimer(
  activeProject: Project | undefined,
  updateProject: (updater: (project: Project) => Project) => void,
  state: AppState,
  setState: React.Dispatch<React.SetStateAction<AppState>>,
  sessionNote: string,
  restartCue: string,
  setSessionNote: (val: string) => void,
  setRestartCue: (val: string) => void,
) {
  const secondsLeftRef = useRef(15 * 60);
  const [mode, setMode] = useState<'idle' | 'sprint' | 'break'>('idle');
  const [isPaused, setIsPaused] = useState(false);
  const [secondsLeft, setSecondsLeftState] = useState(15 * 60);

  const setSecondsLeft = useCallback((val: number | ((prev: number) => number)) => {
    setSecondsLeftState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      secondsLeftRef.current = next;
      return next;
    });
  }, []);

  useEffect(() => {
    if (!activeProject) {
      return;
    }
    if (mode === 'idle') {
      setSecondsLeft(activeProject.sprintMinutes * 60);
    }
  }, [activeProject, mode, setSecondsLeft]);

  useEffect(() => {
    if (mode === 'idle' || isPaused || !activeProject) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          if (mode === 'sprint') {
            setMode('break');
            return (activeProject?.breakMinutes ?? 5) * 60;
          }
          setMode('idle');
          return (activeProject?.sprintMinutes ?? 25) * 60;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activeProject, activeProject?.id, mode, isPaused, setSecondsLeft]);

  const startSprint = useCallback(() => {
    if (!activeProject) return;
    setMode('sprint');
    setIsPaused(false);
    setSecondsLeft(activeProject.sprintMinutes * 60);
  }, [activeProject, setSecondsLeft]);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    if (!activeProject) return;
    setMode('idle');
    setIsPaused(false);
    setSecondsLeft(activeProject.sprintMinutes * 60);
  }, [activeProject, setSecondsLeft]);

  const completeSession = useCallback(() => {
    if (!activeProject) return;
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

    const minutesWorked = mode === 'sprint' ? activeProject.sprintMinutes - Math.floor(secondsLeftRef.current / 60) : activeProject.sprintMinutes;
    const currentGoal = activeProject.customGoal.trim() || activeProject.selectedGoal;

    const record: SessionRecord = {
      id: createSessionId(activeProject.id),
      date: today,
      timeOfDay: getTimeKey(),
      minutes: Math.max(1, minutesWorked),
      mood: state.mood,
      energy: state.energy,
      focus: state.focus,
      goal: currentGoal,
      outcome: activeProject.sessionOutcome || 'drafted',
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
    setIsPaused(false);
    setSecondsLeft(activeProject.sprintMinutes * 60);
  }, [activeProject, mode, state.mood, state.energy, state.focus, sessionNote, restartCue, setState, setSessionNote, setRestartCue, setSecondsLeft]);

  const activateRestartMode = useCallback(() => {
    if (!activeProject) return;
    updateProject((project) => ({
      ...project,
      selectedGoal: 'Write 50 words',
      customGoal: 'Re-entry the manuscript with an ugly paragraph.',
      sprintMinutes: 10,
      breakMinutes: 3,
      ritualChecks: ritualCheckDefaults(),
      restartChecks: restartCheckDefaults(),
      restartMode: true,
    }));
    setSessionNote('What served as the spark to come today?');
    setRestartCue('Which hook is the easiest to pull on your next start?');
    setMode('idle');
    setIsPaused(false);
    setSecondsLeft(10 * 60);
  }, [activeProject, updateProject, setSessionNote, setRestartCue, setSecondsLeft]);

  const formatTime = useCallback((totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, []);

  return {
    mode, setMode, isPaused, setIsPaused, secondsLeft, setSecondsLeft,
    startSprint, togglePause, resetTimer, completeSession, activateRestartMode, formatTime
  };
}
