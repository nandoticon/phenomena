import { describe, expect, it } from 'vitest';
import type { AppState } from '../types';
import { createProject } from './storage';
import { serializeSyncState } from './storage';
import { buildSyncConflict, hasSyncConflict, summarizeState } from './sync';

function makeState(activeProjectId: string, projectName = 'Alpha'): AppState {
  return {
    activeProjectId,
    projects: [createProject(activeProjectId, projectName, 'Keep moving')],
    sessions: [],
    mood: 'steady',
    energy: 'medium',
    focus: 'usable',
  };
}

describe('sync helpers', () => {
  it('summarizes local and cloud copies for recovery UI', () => {
    const state = makeState('project-a');
    state.projects[0].attachments.push({ id: 'attachment-1', label: 'Outline', url: 'https://example.com' });
    state.sessions.push({
      id: 'session-1',
      date: '2026-03-18',
      timeOfDay: '12:00',
      minutes: 15,
      mood: 'steady',
      energy: 'medium',
      focus: 'usable',
      goal: 'Write 50 words',
      outcome: 'drafted',
      projectId: 'project-a',
      note: '',
      restartCue: '',
      usedRestartMode: false,
    });

    expect(summarizeState(state)).toEqual({
      projects: 1,
      sessions: 1,
      attachments: 1,
      activeProjectId: 'project-a',
      activeProjectName: 'Alpha',
    });
  });

  it('detects when local and cloud have diverged since the last sync', () => {
    const base = makeState('project-a');
    const local = makeState('project-a', 'Local copy');
    const cloud = makeState('project-a', 'Cloud copy');

    expect(hasSyncConflict(local, cloud, serializeSyncState(base), serializeSyncState(base))).toBe(true);
    expect(buildSyncConflict(local, cloud).message).toContain('Cloud changes were detected');
  });

  it('does not flag a conflict when only one side changed', () => {
    const base = makeState('project-a');
    const local = makeState('project-a', 'Local copy');

    expect(hasSyncConflict(local, null, serializeSyncState(base), '')).toBe(false);
  });
});
