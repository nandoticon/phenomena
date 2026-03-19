import { AppState, Project, SessionRecord, LegacyAppState, ProjectAttachment, CueTheme, Mood, Energy, Focus, SessionResultado, BackupManifest, BackupPreview, AttachmentRow, ProjectRow, SessionRow, BackupRestoreSelection, BackupDiffSummary, BackupItemSelection, BackupComparison, BackupProjectChange, BackupSessionChange } from '../types';
import { DEFAULT_PROJECT_ID, goalLibrary, ambientPresets, restartCheckDefaults, ritualCheckDefaults } from '../constants';
import { getTodayKey, parseDateKey, getDayDiff } from './date';
import { normalizeProject, normalizeSession as normalizeSessionRecord, normalizeAttachment } from './validation';

export const BACKUP_HISTORY_KEY = 'phenomena-backup-history';
export const BACKUP_HISTORY_LIMIT = 100;

export function defaultBackupRestoreSelection(): BackupRestoreSelection {
  return {
    projects: true,
    sessions: true,
    workspace: true,
  };
}

export function defaultBackupItemSelection(state: AppState): BackupItemSelection {
  return {
    projects: Object.fromEntries(state.projects.map((project) => [project.id, true])),
    sessions: Object.fromEntries(state.sessions.map((session) => [session.id, true])),
  };
}

export function parseBackupHistory(raw: string | null): BackupManifest[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((entry): entry is BackupManifest => Boolean(entry) && typeof entry === 'object' && (entry as BackupManifest).format === 'phenomena-backup-v2')
      .slice(0, BACKUP_HISTORY_LIMIT);
  } catch {
    return [];
  }
}

export function serializeBackupHistory(history: BackupManifest[]): string {
  return JSON.stringify(history.slice(0, BACKUP_HISTORY_LIMIT));
}

export function compareBackupState(current: AppState, imported: AppState): BackupDiffSummary {
  const currentProjectMap = new Map(current.projects.map((project) => [project.id, project]));
  const importedProjectMap = new Map(imported.projects.map((project) => [project.id, project]));
  const allProjectIds = new Set([...currentProjectMap.keys(), ...importedProjectMap.keys()]);

  let projectsChanged = 0;
  let sessionsChanged = Math.abs(imported.sessions.length - current.sessions.length);
  let attachmentsChanged = 0;
  const notes: string[] = [];

  for (const id of allProjectIds) {
    const currentProject = currentProjectMap.get(id);
    const importedProject = importedProjectMap.get(id);

    if (!currentProject || !importedProject) {
      projectsChanged += 1;
      attachmentsChanged += importedProject?.attachments.length ?? currentProject?.attachments.length ?? 0;
      continue;
    }

    const projectChanged =
      currentProject.name !== importedProject.name ||
      currentProject.note !== importedProject.note ||
      currentProject.selectedGoal !== importedProject.selectedGoal ||
      currentProject.customGoal !== importedProject.customGoal ||
      currentProject.sprintMinutes !== importedProject.sprintMinutes ||
      currentProject.breakMinutes !== importedProject.breakMinutes ||
      currentProject.reminderEnabled !== importedProject.reminderEnabled ||
      currentProject.reminderTime !== importedProject.reminderTime ||
      currentProject.archived !== importedProject.archived ||
      currentProject.restartMode !== importedProject.restartMode ||
      currentProject.cueTheme !== importedProject.cueTheme ||
      currentProject.soundtrackUrl !== importedProject.soundtrackUrl ||
      JSON.stringify(currentProject.ritualChecks) !== JSON.stringify(importedProject.ritualChecks) ||
      JSON.stringify(currentProject.restartChecks) !== JSON.stringify(importedProject.restartChecks);

    if (projectChanged) {
      projectsChanged += 1;
    }

    attachmentsChanged += Math.abs(currentProject.attachments.length - importedProject.attachments.length);
  }

  const workspaceChanged =
    current.activeProjectId !== imported.activeProjectId ||
    current.mood !== imported.mood ||
    current.energy !== imported.energy ||
    current.focus !== imported.focus;

  if (workspaceChanged) {
    notes.push('Workspace defaults differ between the current copy and the backup.');
  }
  if (projectsChanged > 0) {
    notes.push(`${projectsChanged} project${projectsChanged === 1 ? '' : 's'} will change.`);
  }
  if (sessionsChanged > 0) {
    notes.push(`${sessionsChanged} session${sessionsChanged === 1 ? '' : 's'} differ.`);
  }
  if (attachmentsChanged > 0) {
    notes.push(`${attachmentsChanged} attachment${attachmentsChanged === 1 ? '' : 's'} differ.`);
  }

  return {
    projectsChanged,
    sessionsChanged,
    attachmentsChanged,
    workspaceChanged,
    notes,
  };
}

function compareProjectSnapshot(current: Project | undefined, imported: Project | undefined): BackupProjectChange | null {
  if (!current && !imported) {
    return null;
  }

  const label = imported?.name ?? current?.name ?? 'Project';
  if (!current) {
    return {
      id: imported!.id,
      label,
      status: 'added',
      notes: [`Will add ${label}.`],
      imported,
    };
  }

  if (!imported) {
    return {
      id: current.id,
      label,
      status: 'removed',
      notes: [`Will remove ${label} from the restored snapshot.`],
      current,
    };
  }

  const notes: string[] = [];
  const changedFields: string[] = [];
  if (current.name !== imported.name) changedFields.push('name');
  if (current.note !== imported.note) changedFields.push('note');
  if (current.selectedGoal !== imported.selectedGoal) changedFields.push('goal');
  if (current.customGoal !== imported.customGoal) changedFields.push('custom goal');
  if (current.sprintMinutes !== imported.sprintMinutes || current.breakMinutes !== imported.breakMinutes) changedFields.push('timing');
  if (current.reminderEnabled !== imported.reminderEnabled || current.reminderTime !== imported.reminderTime) changedFields.push('reminders');
  if (current.archived !== imported.archived) changedFields.push(imported.archived ? 'archive state' : 'active state');
  if (current.restartMode !== imported.restartMode) changedFields.push('restart mode');
  if (current.cueTheme !== imported.cueTheme) changedFields.push('theme');
  if (current.soundtrackUrl !== imported.soundtrackUrl) changedFields.push('audio');
  if (JSON.stringify(current.attachments) !== JSON.stringify(imported.attachments)) changedFields.push('attachments');
  if (JSON.stringify(current.ritualChecks) !== JSON.stringify(imported.ritualChecks)) changedFields.push('ritual checklist');
  if (JSON.stringify(current.restartChecks) !== JSON.stringify(imported.restartChecks)) changedFields.push('restart checklist');
  if (current.sessionOutcome !== imported.sessionOutcome) changedFields.push('session outcome');
  if (current.streak !== imported.streak) changedFields.push('streak');

  if (changedFields.length === 0) {
    return null;
  }

  notes.push(`Will update ${changedFields.join(', ')}.`);
  return {
    id: current.id,
    label,
    status: 'updated',
    notes,
    current,
    imported,
  };
}

function compareSessionSnapshot(current: SessionRecord | undefined, imported: SessionRecord | undefined, projectNameLookup: Record<string, string>): BackupSessionChange | null {
  if (!current && !imported) {
    return null;
  }

  const label = imported
    ? `${imported.date} ${imported.timeOfDay} · ${projectNameLookup[imported.projectId] || imported.projectId}`
    : `${current!.date} ${current!.timeOfDay} · ${projectNameLookup[current!.projectId] || current!.projectId}`;

  if (!current) {
    return {
      id: imported!.id,
      label,
      status: 'added',
      notes: [`Will add session from ${imported!.date} at ${imported!.timeOfDay}.`],
      imported,
    };
  }

  if (!imported) {
    return {
      id: current.id,
      label,
      status: 'removed',
      notes: [`Will remove the session on ${current.date} at ${current.timeOfDay}.`],
      current,
    };
  }

  const notes: string[] = [];
  const changedFields: string[] = [];
  if (current.date !== imported.date) changedFields.push('date');
  if (current.timeOfDay !== imported.timeOfDay) changedFields.push('time');
  if (current.minutes !== imported.minutes) changedFields.push('minutes');
  if (current.mood !== imported.mood) changedFields.push('mood');
  if (current.energy !== imported.energy) changedFields.push('energy');
  if (current.focus !== imported.focus) changedFields.push('focus');
  if (current.goal !== imported.goal) changedFields.push('goal');
  if (current.outcome !== imported.outcome) changedFields.push('outcome');
  if (current.projectId !== imported.projectId) changedFields.push('project');
  if (current.note !== imported.note) changedFields.push('note');
  if (current.restartCue !== imported.restartCue) changedFields.push('restart cue');
  if (current.usedRestartMode !== imported.usedRestartMode) changedFields.push('restart mode');

  if (changedFields.length === 0) {
    return null;
  }

  notes.push(`Will update ${changedFields.join(', ')}.`);
  return {
    id: current.id,
    label,
    status: 'updated',
    notes,
    current,
    imported,
  };
}

export function compareBackupItems(current: AppState, imported: AppState): BackupComparison {
  const currentProjectMap = new Map(current.projects.map((project) => [project.id, project]));
  const importedProjectMap = new Map(imported.projects.map((project) => [project.id, project]));
  const projectNameLookup = Object.fromEntries([
    ...current.projects.map((project) => [project.id, project.name]),
    ...imported.projects.map((project) => [project.id, project.name]),
  ]);

  const projectChanges = [...new Set([...currentProjectMap.keys(), ...importedProjectMap.keys()])]
    .map((id) => compareProjectSnapshot(currentProjectMap.get(id), importedProjectMap.get(id)))
    .filter((change): change is BackupProjectChange => Boolean(change));

  const currentSessionMap = new Map(current.sessions.map((session) => [session.id, session]));
  const importedSessionMap = new Map(imported.sessions.map((session) => [session.id, session]));

  const sessionChanges = [...new Set([...currentSessionMap.keys(), ...importedSessionMap.keys()])]
    .map((id) => compareSessionSnapshot(currentSessionMap.get(id), importedSessionMap.get(id), projectNameLookup))
    .filter((change): change is BackupSessionChange => Boolean(change));

  return {
    projectChanges,
    sessionChanges,
  };
}

export function restoreBackupState(current: AppState, imported: AppState, selection: BackupRestoreSelection): AppState {
  const nextProjects = selection.projects ? imported.projects : current.projects;
  const nextSessions = selection.sessions ? imported.sessions : current.sessions;
  const nextWorkspace = selection.workspace
    ? {
        activeProjectId: imported.activeProjectId,
        mood: imported.mood,
        energy: imported.energy,
        focus: imported.focus,
      }
    : {
        activeProjectId: current.activeProjectId,
        mood: current.mood,
        energy: current.energy,
        focus: current.focus,
      };

  const activeCandidates = nextProjects.filter((project) => !project.archived);
  const validActiveProjectId =
    nextProjects.some((project) => project.id === nextWorkspace.activeProjectId && !project.archived)
      ? nextWorkspace.activeProjectId
      : activeCandidates[0]?.id ?? nextProjects[0]?.id ?? current.activeProjectId;

  return {
    activeProjectId: validActiveProjectId,
    projects: nextProjects,
    sessions: nextSessions,
    mood: nextWorkspace.mood,
    energy: nextWorkspace.energy,
    focus: nextWorkspace.focus,
  };
}

export function restoreSelectedBackupItems(current: AppState, imported: AppState, selection: BackupRestoreSelection, itemSelection: BackupItemSelection): AppState {
  const selectedProjects = selection.projects
    ? imported.projects.filter((project) => itemSelection.projects[project.id] !== false)
    : [];
  const nextProjectsById = new Map(current.projects.map((project) => [project.id, project]));

  for (const project of selectedProjects) {
    nextProjectsById.set(project.id, project);
  }

  const nextProjects = [...nextProjectsById.values()];
  const selectedProjectIds = new Set(nextProjects.map((project) => project.id));

  const selectedSessions = selection.sessions
    ? imported.sessions.filter((session) => itemSelection.sessions[session.id] !== false)
    : [];
  const nextSessionsById = new Map(current.sessions.map((session) => [session.id, session]));

  for (const session of selectedSessions) {
    if (!selectedProjectIds.has(session.projectId)) {
      const matchingProject = current.projects.find((project) => project.id === session.projectId) || selectedProjects.find((project) => project.id === session.projectId);
      if (!matchingProject) {
        continue;
      }
    }
    nextSessionsById.set(session.id, session);
  }

  const nextSessions = [...nextSessionsById.values()].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.timeOfDay}`).getTime();
    const dateB = new Date(`${b.date}T${b.timeOfDay}`).getTime();
    return dateA - dateB;
  });

  const nextState = restoreBackupState(current, imported, selection);
  const validActiveProjectId =
    nextProjects.some((project) => project.id === nextState.activeProjectId && !project.archived)
      ? nextState.activeProjectId
      : nextProjects.find((project) => !project.archived)?.id ?? nextProjects[0]?.id ?? current.activeProjectId;

  return {
    ...nextState,
    activeProjectId: validActiveProjectId,
    projects: nextProjects,
    sessions: nextSessions,
  };
}

function normalizeRetentionDays(value: number): number | null {
  const normalized = Math.floor(Number(value));
  if (!Number.isFinite(normalized) || normalized <= 0) {
    return null;
  }
  return Math.min(normalized, 3650);
}

function normalizeRetentionCount(value: number): number {
  const normalized = Math.floor(Number(value));
  if (!Number.isFinite(normalized) || normalized <= 0) {
    return 1;
  }
  return Math.min(normalized, 100);
}

export function pruneSessionsOlderThan(state: AppState, olderThanDays: number): { nextState: AppState; removedSessions: number } {
  const threshold = normalizeRetentionDays(olderThanDays);
  if (!threshold) {
    return { nextState: state, removedSessions: 0 };
  }

  const today = getTodayKey();
  const nextSessions = state.sessions.filter((session) => getDayDiff(session.date, today) < threshold);
  const removedSessions = state.sessions.length - nextSessions.length;

  if (!removedSessions) {
    return { nextState: state, removedSessions: 0 };
  }

  return {
    nextState: {
      ...state,
      sessions: nextSessions,
    },
    removedSessions,
  };
}

export function pruneBackupHistory(history: BackupManifest[], olderThanDays: number, keepRecentCount: number): { nextHistory: BackupManifest[]; removedBackups: number } {
  const threshold = normalizeRetentionDays(olderThanDays);
  const limit = normalizeRetentionCount(keepRecentCount);
  const now = Date.now();
  const cutoff = threshold ? now - (threshold * 86400000) : null;

  const retainedByAge = cutoff === null
    ? [...history]
    : history.filter((entry) => {
        const exportedAt = Date.parse(entry.exportedAt);
        return Number.isNaN(exportedAt) || exportedAt >= cutoff;
      });

  const nextHistory = retainedByAge.slice(0, Math.min(limit, BACKUP_HISTORY_LIMIT));
  return {
    nextHistory,
    removedBackups: history.length - nextHistory.length,
  };
}

export function createProject(id: string, name: string, note: string, defaults?: Partial<Pick<Project, 'sprintMinutes' | 'breakMinutes'>>): Project {
  return {
    id,
    name,
    note,
    attachments: [],
    selectedGoal: goalLibrary[0],
    customGoal: '',
    sprintMinutes: defaults?.sprintMinutes ?? 15,
    breakMinutes: defaults?.breakMinutes ?? 3,
    streak: 0,
    lastCompletionDate: null,
    reminderEnabled: false,
    reminderTime: '18:00',
    lastReminderDate: null,
    ritualChecks: ritualCheckDefaults(),
    soundtrackUrl: ambientPresets[0].url,
    cueTheme: 'embers' as CueTheme,
    archived: false,
    restartMode: false,
    restartChecks: restartCheckDefaults(),
    sessionOutcome: 'drafted',
  };
}

export function normalizeSession(session: Partial<SessionRecord>, fallbackProjectId: string): SessionRecord {
  return normalizeSessionRecord(session, fallbackProjectId);
}

export function createSessionId(projectId: string): string {
  return `session-${projectId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function serializeSyncState(state: AppState): string {
  return JSON.stringify({
    activeProjectId: state.activeProjectId,
    projects: state.projects,
    sessions: state.sessions,
  });
}

export function createBackupManifest(state: AppState, name: string): BackupManifest {
  return {
    format: 'phenomena-backup-v2',
    name,
    exportedAt: new Date().toISOString(),
    summary: {
      projects: state.projects.length,
      sessions: state.sessions.length,
      attachments: state.projects.reduce((count, project) => count + project.attachments.length, 0),
    },
    state,
  };
}

export function parseBackupPreview(raw: string | null): BackupPreview | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<BackupManifest> & { state?: unknown };
    if (parsed.format === 'phenomena-backup-v2' && parsed.state && typeof parsed.state === 'object') {
      const state = parseStoredState(JSON.stringify(parsed.state));
      return {
        name: typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name : 'Phenomena Backup',
        exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : null,
        summary: {
          projects: parsed.summary?.projects ?? state.projects.length,
          sessions: parsed.summary?.sessions ?? state.sessions.length,
          attachments: parsed.summary?.attachments ?? state.projects.reduce((count, project) => count + project.attachments.length, 0),
        },
        state,
        format: parsed.format,
      };
    }

    const state = parseStoredState(raw);
    return {
      name: 'Legacy Phenomena Backup',
      exportedAt: null,
      summary: {
        projects: state.projects.length,
        sessions: state.sessions.length,
        attachments: state.projects.reduce((count, project) => count + project.attachments.length, 0),
      },
      state,
      format: 'legacy',
    };
  } catch {
    return null;
  }
}

export function hydrateProject(project: Partial<Project>, fallbackId: string, fallbackName: string, fallbackNote: string): Project {
  const base = createProject(project.id || fallbackId, project.name || fallbackName, project.note || fallbackNote);
  return normalizeProject(project, base);
}

export const defaultState: AppState = {
  activeProjectId: DEFAULT_PROJECT_ID,
  projects: [createProject(DEFAULT_PROJECT_ID, 'Primary Project', 'Your primary focus at the moment.')],
  sessions: [],
  mood: 'steady',
  energy: 'medium',
  focus: 'usable',
};

export function parseStoredState(raw: string | null): AppState {
  if (!raw) {
    return defaultState;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppState> & LegacyAppState;

    if (Array.isArray(parsed.projects)) {
      const projects = parsed.projects.map((project, index) =>
        hydrateProject(project, `project-${index + 1}`, `Project ${index + 1}`, ''),
      );
      const activeCandidates = projects.filter((project) => !project.archived);
      const activeProjectId = activeCandidates.some((project) => project.id === parsed.activeProjectId)
        ? (parsed.activeProjectId as string)
        : activeCandidates[0]?.id || projects[0]?.id || DEFAULT_PROJECT_ID;

      return {
        activeProjectId,
        projects,
        sessions: Array.isArray(parsed.sessions) ? parsed.sessions.map((session) => normalizeSession(session, activeProjectId)) : [],
        mood: parsed.mood ?? defaultState.mood,
        energy: parsed.energy ?? defaultState.energy,
        focus: parsed.focus ?? defaultState.focus,
      };
    }

    const migratedProject = hydrateProject(
      {
        id: DEFAULT_PROJECT_ID,
        name: 'Primary Project',
        note: 'Imported from your previous configuration.',
        selectedGoal: parsed.selectedGoal ?? goalLibrary[0],
        customGoal: parsed.customGoal ?? '',
        sprintMinutes: parsed.sprintMinutes ?? 15,
        breakMinutes: parsed.breakMinutes ?? 3,
        streak: parsed.streak ?? 0,
        lastCompletionDate: parsed.lastCompletionDate ?? null,
        reminderEnabled: parsed.reminderEnabled ?? false,
        reminderTime: parsed.reminderTime ?? '18:00',
        lastReminderDate: parsed.lastReminderDate ?? null,
        ritualChecks: parsed.ritualChecks,
      },
      DEFAULT_PROJECT_ID,
      'Primary Project',
      'Imported from your previous configuration.',
    );

    return {
      activeProjectId: DEFAULT_PROJECT_ID,
      projects: [migratedProject],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions.map((session) => normalizeSession(session, DEFAULT_PROJECT_ID)) : [],
      mood: parsed.mood ?? defaultState.mood,
      energy: parsed.energy ?? defaultState.energy,
      focus: parsed.focus ?? defaultState.focus,
    };
  } catch {
    return defaultState;
  }
}

export function parseImportedState(raw: string | null): AppState | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const looksLikeStructuredState = Array.isArray(parsed.projects) || Array.isArray(parsed.sessions);
    const looksLikeLegacyState =
      'selectedGoal' in parsed ||
      'customGoal' in parsed ||
      'sprintMinutes' in parsed ||
      'breakMinutes' in parsed ||
      'streak' in parsed ||
      'lastCompletionDate' in parsed ||
      'reminderEnabled' in parsed ||
      'reminderTime' in parsed ||
      'lastReminderDate' in parsed ||
      'ritualChecks' in parsed ||
      'mood' in parsed ||
      'energy' in parsed ||
      'focus' in parsed;

    if (!looksLikeStructuredState && !looksLikeLegacyState) {
      return null;
    }

    return parseStoredState(raw);
  } catch {
    return null;
  }
}

export function buildStateFromNormalizedTables(
  projectRows: ProjectRow[],
  sessionRows: SessionRow[],
  attachmentRows: AttachmentRow[],
  activeProjectId?: string | null,
): AppState {
  const attachmentsByProject = attachmentRows.reduce<Record<string, ProjectAttachment[]>>((acc, row) => {
    const projectId = String(row.project_id ?? '');
    if (!projectId) {
      return acc;
    }
    const next = normalizeAttachment({
      id: String(row.attachment_id ?? ''),
      label: String(row.label ?? ''),
      url: String(row.url ?? ''),
    });
    if (!next) {
      return acc;
    }
    acc[projectId] = [...(acc[projectId] ?? []), next];
    return acc;
  }, {});

  const projects = projectRows.map((row, index) =>
    hydrateProject(
      {
        id: String(row.project_id ?? `project-${index + 1}`),
        name: String(row.name ?? `Project ${index + 1}`),
        note: String(row.note ?? ''),
        attachments: attachmentsByProject[String(row.project_id ?? '')] ?? [],
        selectedGoal: String(row.selected_goal ?? goalLibrary[0]),
        customGoal: String(row.custom_goal ?? ''),
        sprintMinutes: Number(row.sprint_minutes ?? 15),
        breakMinutes: Number(row.break_minutes ?? 3),
        streak: Number(row.streak ?? 0),
        lastCompletionDate: row.last_completion_date ? String(row.last_completion_date) : null,
        reminderEnabled: Boolean(row.reminder_enabled),
        reminderTime: String(row.reminder_time ?? '18:00'),
        lastReminderDate: row.last_reminder_date ? String(row.last_reminder_date) : null,
        ritualChecks: row.ritual_checks ?? undefined,
        soundtrackUrl: String(row.soundtrack_url ?? ambientPresets[0].url),
        cueTheme: (String(row.cue_theme ?? 'embers') as CueTheme),
        archived: Boolean(row.archived),
        restartMode: Boolean(row.restart_mode),
        restartChecks: row.restart_checks ?? undefined,
        sessionOutcome: row.session_outcome ? String(row.session_outcome) as SessionResultado : undefined,
      } as Partial<Project>,
      `project-${index + 1}`,
      `Project ${index + 1}`,
      '',
    ),
  );

  const validActiveId =
    projects.find((project) => project.id === activeProjectId && !project.archived)?.id ??
    projects.find((project) => !project.archived)?.id ??
    projects[0]?.id ??
    DEFAULT_PROJECT_ID;

  return {
    activeProjectId: validActiveId,
    projects,
    sessions: sessionRows.map((row) =>
      normalizeSession(
        {
          date: String(row.session_date ?? getTodayKey()),
          timeOfDay: String(row.time_of_day ?? '19:00'),
          minutes: Number(row.minutes ?? 10),
          mood: String(row.mood ?? 'steady') as Mood,
          energy: String(row.energy ?? 'medium') as Energy,
          focus: String(row.focus ?? 'usable') as Focus,
          goal: String(row.goal ?? goalLibrary[0]),
          outcome: String(row.outcome ?? 'drafted') as SessionResultado,
          projectId: String(row.project_id ?? validActiveId),
          note: String(row.note ?? ''),
          restartCue: String(row.restart_cue ?? ''),
          usedRestartMode: Boolean(row.used_restart_mode),
          id: String(row.client_session_id ?? `legacy-${row.id ?? Math.random()}`),
        },
        validActiveId,
      ),
    ),
    mood: defaultState.mood,
    energy: defaultState.energy,
    focus: defaultState.focus,
  };
}
