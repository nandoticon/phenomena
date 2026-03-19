import { describe, expect, it } from 'vitest';
import { createBackupManifest, parseBackupPreview, parseBackupHistory, compareBackupState, restoreBackupState, defaultBackupRestoreSelection } from './storage';
import { defaultState } from './storage';

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
});
