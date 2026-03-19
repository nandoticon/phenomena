import { AppState, Project, SessionRecord, LegacyAppState, ProjectAttachment, CueTheme, Mood, Energy, Focus, SessionResultado, BackupManifest, BackupPreview, AttachmentRow, ProjectRow, SessionRow } from '../types';
import { DEFAULT_PROJECT_ID, goalLibrary, ambientPresets, restartCheckDefaults, ritualCheckDefaults } from '../constants';
import { getTodayKey, parseDateKey, getDayDiff } from './date';
import { normalizeProject, normalizeSession as normalizeSessionRecord, normalizeAttachment } from './validation';

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
