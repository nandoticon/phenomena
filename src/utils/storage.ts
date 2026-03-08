import { AppState, Project, SessionRecord, LegacyAppState, ProjectAttachment, CueTheme, Mood, Energy, Focus, SessionResultado } from '../types';
import { DEFAULT_PROJECT_ID, goalLibrary, ambientPresets, restartCheckDefaults, ritualCheckDefaults } from '../constants';
import { getTodayKey, parseDateKey, getDayDiff } from './date';

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
  return {
    id: session.id ?? `session-${session.projectId ?? fallbackProjectId}-${session.date ?? getTodayKey()}-${session.timeOfDay ?? '19:00'}-${session.minutes ?? 10}-${Math.random().toString(36).slice(2, 6)}`,
    date: session.date ?? getTodayKey(),
    timeOfDay: session.timeOfDay ?? '19:00',
    minutes: session.minutes ?? 10,
    mood: session.mood ?? 'steady',
    energy: session.energy ?? 'medium',
    focus: session.focus ?? 'usable',
    goal: session.goal ?? 'Write 50 words',
    outcome: session.outcome ?? 'drafted',
    projectId: session.projectId ?? fallbackProjectId,
    note: session.note ?? '',
    restartCue: session.restartCue ?? '',
    usedRestartMode: session.usedRestartMode ?? false,
  };
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

export function hydrateProject(project: Partial<Project>, fallbackId: string, fallbackName: string, fallbackNote: string): Project {
  const base = createProject(project.id || fallbackId, project.name || fallbackName, project.note || fallbackNote);
  return {
    ...base,
    ...project,
    attachments: Array.isArray(project.attachments)
      ? project.attachments
        .filter((attachment): attachment is ProjectAttachment => Boolean(attachment?.id && attachment?.label && attachment?.url))
      : base.attachments,
    ritualChecks: {
      ...base.ritualChecks,
      ...project.ritualChecks,
    },
    restartChecks: {
      ...base.restartChecks,
      ...project.restartChecks,
    },
  };
}

export const defaultState: AppState = {
  activeProjectId: DEFAULT_PROJECT_ID,
  projects: [createProject(DEFAULT_PROJECT_ID, 'Main Project', 'Your primary focus at the moment.')],
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
        hydrateProject(project, `project-${index + 1}`, `Case ${index + 1}`, ''),
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
        name: 'Main Project',
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
      'Main Project',
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

export function buildStateFromNormalizedTables(
  projectRows: Array<Record<string, any>>,
  sessionRows: Array<Record<string, any>>,
  attachmentRows: Array<Record<string, any>>,
  activeProjectId?: string | null,
): AppState {
  const attachmentsByProject = attachmentRows.reduce<Record<string, ProjectAttachment[]>>((acc, row) => {
    const projectId = String(row.project_id ?? '');
    if (!projectId) {
      return acc;
    }
    const next = {
      id: String(row.attachment_id ?? `attachment-${crypto.randomUUID?.() ?? Math.random()}`),
      label: String(row.label ?? 'Anexo'),
      url: String(row.url ?? ''),
    };
    acc[projectId] = [...(acc[projectId] ?? []), next];
    return acc;
  }, {});

  const projects = projectRows.map((row, index) =>
    hydrateProject(
      {
        id: String(row.project_id ?? `project-${index + 1}`),
        name: String(row.name ?? `Case ${index + 1}`),
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
        ritualChecks: (row.ritual_checks as Record<string, boolean> | undefined),
        soundtrackUrl: String(row.soundtrack_url ?? ambientPresets[0].url),
        cueTheme: (String(row.cue_theme ?? 'embers') as CueTheme),
        archived: Boolean(row.archived),
        restartMode: Boolean(row.restart_mode),
        restartChecks: (row.restart_checks as Record<string, boolean> | undefined),
        sessionOutcome: row.session_outcome ? String(row.session_outcome) as SessionResultado : undefined,
      } as Partial<Project>,
      `project-${index + 1}`,
      `Case ${index + 1}`,
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
