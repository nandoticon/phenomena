import { describe, expect, it } from 'vitest';
import { createBackupManifest, parseBackupPreview, parseBackupHistory, compareBackupState, compareBackupItems, restoreBackupState, restoreSelectedBackupItems, defaultBackupRestoreSelection, defaultBackupItemSelection, pruneSessionsOlderThan, pruneBackupHistory } from './storage';
import { defaultState } from './storage';
import type { SessionRecord } from '../types';

describe('backup storage helpers', () => {
  it('round-trips the structured backup manifest with metadata', () => {
    const manifest = createBackupManifest(defaultState, 'Evening archive');
    const preview = parseBackupPreview(JSON.stringify(manifest));

    expect(preview?.name).toBe('Evening archive');
    expect(preview?.summary.projects).toBe(defaultState.projects.length);
    expect(preview?.summary.sessions).toBe(defaultState.sessions.length);
    expect(preview?.format).toBe('phenomena-backup-v2');
  });

  it('still previews legacy backups', () => {
    const preview = parseBackupPreview(JSON.stringify(defaultState));

    expect(preview?.name).toBe('Legacy Phenomena Backup');
    expect(preview?.state.activeProjectId).toBe(defaultState.activeProjectId);
  });

  it('parses backup history and supports selective restore', () => {
    const manifest = createBackupManifest(defaultState, 'Recent snapshot');
    const history = parseBackupHistory(JSON.stringify([manifest]));
    const diff = compareBackupState(defaultState, manifest.state);
    const restored = restoreBackupState(defaultState, manifest.state, defaultBackupRestoreSelection());

    expect(history).toHaveLength(1);
    expect(history[0].name).toBe('Recent snapshot');
    expect(diff.notes.length).toBeGreaterThanOrEqual(0);
    expect(restored.activeProjectId).toBe(defaultState.activeProjectId);
  });

  it('compares and restores individual backup items', () => {
    const current = defaultState;
    const imported = {
      ...current,
      projects: current.projects.map((project) => (
        project.id === current.projects[0].id
          ? { ...project, name: `${project.name} v2`, note: 'Updated from backup' }
          : project
      )),
      sessions: [
        ...current.sessions,
        {
          id: 'session-1',
          date: '2026-03-18',
          timeOfDay: '10:00',
          minutes: 20,
          mood: 'steady',
          energy: 'medium',
          focus: 'usable',
          goal: 'Write',
          outcome: 'drafted',
          projectId: current.projects[0].id,
          note: 'Backup session',
          restartCue: '',
          usedRestartMode: false,
        } as SessionRecord,
      ],
    };

    const comparison = compareBackupItems(current, imported);
    const selection = defaultBackupItemSelection(imported);
    const restored = restoreSelectedBackupItems(current, imported, defaultBackupRestoreSelection(), {
      ...selection,
      sessions: Object.fromEntries(imported.sessions.map((session) => [session.id, false])),
    });

    expect(comparison.projectChanges.length).toBeGreaterThan(0);
    expect(comparison.sessionChanges.length).toBeGreaterThan(0);
    expect(restored.projects[0].name).toContain('v2');
    expect(restored.sessions).toHaveLength(current.sessions.length);
  });

  it('prunes old sessions and backup history by retention rules', () => {
    const current = {
      ...defaultState,
      sessions: [
        {
          id: 'old-session',
          date: '2025-01-01',
          timeOfDay: '09:00',
          minutes: 15,
          mood: 'steady',
          energy: 'medium',
          focus: 'usable',
          goal: 'Draft',
          outcome: 'drafted',
          projectId: defaultState.projects[0].id,
          note: '',
          restartCue: '',
          usedRestartMode: false,
        } as SessionRecord,
        {
          id: 'recent-session',
          date: '2026-03-18',
          timeOfDay: '10:00',
          minutes: 20,
          mood: 'steady',
          energy: 'high',
          focus: 'sharp',
          goal: 'Revise',
          outcome: 'revised',
          projectId: defaultState.projects[0].id,
          note: '',
          restartCue: '',
          usedRestartMode: false,
        } as SessionRecord,
      ],
    };

    const sessionCleanup = pruneSessionsOlderThan(current, 30);
    expect(sessionCleanup.removedSessions).toBe(1);
    expect(sessionCleanup.nextState.sessions).toHaveLength(1);
    expect(sessionCleanup.nextState.sessions[0].id).toBe('recent-session');

    const recentBackup = createBackupManifest(defaultState, 'Recent backup');
    const oldBackup = createBackupManifest(defaultState, 'Old backup');
    oldBackup.exportedAt = '2025-01-01T00:00:00.000Z';
    recentBackup.exportedAt = '2026-03-18T12:00:00.000Z';

    const backupCleanup = pruneBackupHistory([recentBackup, oldBackup], 30, 1);
    expect(backupCleanup.removedBackups).toBe(1);
    expect(backupCleanup.nextHistory).toHaveLength(1);
    expect(backupCleanup.nextHistory[0].name).toBe('Recent backup');
  });
});
