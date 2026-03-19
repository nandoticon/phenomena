import type { AppState } from '../types';
import { serializeSyncState } from './storage';
import { getProjectAttachmentCount } from './analytics';

export interface SyncSummary {
  projects: number;
  sessions: number;
  attachments: number;
  activeProjectId: string;
  activeProjectName: string;
}

export interface SyncConflict {
  message: string;
  local: SyncSummary;
  cloud: SyncSummary;
}

export function summarizeState(state: AppState | null): SyncSummary | null {
  if (!state) {
    return null;
  }
  const activeProject = state.projects.find((project) => project.id === state.activeProjectId) ?? state.projects[0] ?? null;
  return {
    projects: state.projects.length,
    sessions: state.sessions.length,
    attachments: getProjectAttachmentCount(state.projects),
    activeProjectId: activeProject?.id ?? state.activeProjectId,
    activeProjectName: activeProject?.name ?? 'No active project',
  };
}

export function hasSyncConflict(local: AppState, cloud: AppState | null, lastSyncedSerialized: string, lastCloudSerialized: string): boolean {
  if (!cloud) {
    return false;
  }
  const localSerialized = serializeSyncState(local);
  const cloudSerialized = serializeSyncState(cloud);
  const localChanged = localSerialized !== lastSyncedSerialized;
  const cloudChanged = cloudSerialized !== lastCloudSerialized;
  return localChanged && cloudChanged && localSerialized !== cloudSerialized;
}

export function buildSyncConflict(local: AppState, cloud: AppState): SyncConflict {
  const localSummary = summarizeState(local);
  const cloudSummary = summarizeState(cloud);
  if (!localSummary || !cloudSummary) {
    throw new Error('Cannot build sync conflict summary from empty state.');
  }

  return {
    message: 'Cloud changes were detected from another device or tab. Choose which copy should win.',
    local: localSummary,
    cloud: cloudSummary,
  };
}
