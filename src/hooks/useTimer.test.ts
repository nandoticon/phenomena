import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppState, Project } from '../types';
import { createProject } from '../utils/storage';
import { useTimer } from './useTimer';

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('starts a sprint, counts down, and records a completed session', () => {
    const activeProject: Project = createProject('project-a', 'Alpha', 'Focus session');
    let capturedState: AppState = {
      activeProjectId: activeProject.id,
      projects: [activeProject],
      sessions: [],
      mood: 'steady',
      energy: 'medium',
      focus: 'usable',
    };

    const setState = vi.fn((updater: any) => {
      capturedState = typeof updater === 'function' ? updater(capturedState) : updater;
    });
    const updateProject = vi.fn();
    const setSessionNote = vi.fn();
    const setRestartCue = vi.fn();

    const { result } = renderHook(() =>
      useTimer(
        activeProject,
        updateProject,
        capturedState,
        setState,
        '',
        '',
        setSessionNote,
        setRestartCue,
      ),
    );

    act(() => {
      result.current.startSprint();
    });
    expect(result.current.mode).toBe('sprint');

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.secondsLeft).toBe(activeProject.sprintMinutes * 60 - 2);

    act(() => {
      result.current.completeSession();
    });

    expect(capturedState.sessions).toHaveLength(1);
    expect(capturedState.sessions[0].projectId).toBe(activeProject.id);
    expect(setSessionNote).toHaveBeenCalledWith('');
    expect(setRestartCue).toHaveBeenCalledWith('');
    expect(result.current.mode).toBe('idle');
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });
});
