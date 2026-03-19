import type { Project, ProjectAttachment, SessionRecord, SessionResultado, CueTheme } from '../types';
import { ambientPresets, goalLibrary, restartCheckDefaults, ritualCheckDefaults } from '../constants';
import { getTodayKey } from './date';

export const PROJECT_NAME_MAX_LENGTH = 80;
export const PROJECT_NOTE_MAX_LENGTH = 240;
export const GOAL_MAX_LENGTH = 120;
export const SESSION_NOTE_MAX_LENGTH = 400;
export const ATTACHMENT_LABEL_MAX_LENGTH = 120;
export const MIN_SPRINT_MINUTES = 5;
export const MAX_SPRINT_MINUTES = 180;
export const MIN_BREAK_MINUTES = 1;
export const MAX_BREAK_MINUTES = 60;
export const MIN_SESSION_MINUTES = 1;
export const MAX_SESSION_MINUTES = 480;

const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.round(numeric)));
}

export function sanitizeText(value: unknown, maxLength: number, fallback = ''): string {
  const text = typeof value === 'string' ? value : String(value ?? '');
  const trimmed = text.trim();
  return trimmed.slice(0, maxLength) || fallback;
}

export function normalizeTime(value: unknown, fallback = '18:00'): string {
  const text = sanitizeText(value, 5);
  return timePattern.test(text) ? text : fallback;
}

export function normalizeDate(value: unknown, fallback = getTodayKey()): string {
  const text = sanitizeText(value, 10);
  if (!datePattern.test(text)) {
    return fallback;
  }
  const date = new Date(`${text}T12:00:00`);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString().slice(0, 10) === text ? text : fallback;
}

export function normalizeUrl(value: unknown, fallback = ''): string {
  const text = sanitizeText(value, 2048);
  if (!text) {
    return fallback;
  }
  try {
    const url = new URL(text);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

export function normalizeCueTheme(value: unknown, fallback: CueTheme = 'embers'): CueTheme {
  return value === 'embers' || value === 'mist' || value === 'moonlight' ? value : fallback;
}

export function normalizeOutcome(value: unknown, fallback: SessionResultado = 'drafted'): SessionResultado {
  return value === 'drafted' || value === 'revised' || value === 'outlined' || value === 'showed-up' ? value : fallback;
}

export function normalizeGoalChoice(value: unknown, fallback = goalLibrary[0]): string {
  const text = sanitizeText(value, GOAL_MAX_LENGTH);
  return goalLibrary.includes(text) ? text : fallback;
}

export function normalizeAttachment(attachment: Partial<ProjectAttachment>): ProjectAttachment | null {
  const label = sanitizeText(attachment.label, ATTACHMENT_LABEL_MAX_LENGTH);
  const url = normalizeUrl(attachment.url);
  if (!label || !url) {
    return null;
  }
  return {
    id: sanitizeText(attachment.id, 120, crypto.randomUUID()),
    label,
    url,
  };
}

export function normalizeProject(project: Partial<Project>, base?: Project): Project {
  const fallback = base ?? {
    id: sanitizeText(project.id, 120, crypto.randomUUID()),
    name: 'Project',
    note: '',
    attachments: [],
    selectedGoal: goalLibrary[0],
    customGoal: '',
    sprintMinutes: 15,
    breakMinutes: 3,
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
    sessionOutcome: 'drafted' as SessionResultado,
  };

  const attachments = Array.isArray(project.attachments)
    ? project.attachments.map((attachment) => normalizeAttachment(attachment)).filter(Boolean) as ProjectAttachment[]
    : fallback.attachments;

  return {
    ...fallback,
    ...project,
    id: sanitizeText(project.id, 120, fallback.id),
    name: sanitizeText(project.name, PROJECT_NAME_MAX_LENGTH, fallback.name),
    note: sanitizeText(project.note, PROJECT_NOTE_MAX_LENGTH, fallback.note),
    attachments,
    selectedGoal: normalizeGoalChoice(project.selectedGoal, fallback.selectedGoal),
    customGoal: sanitizeText(project.customGoal, GOAL_MAX_LENGTH, fallback.customGoal),
    sprintMinutes: clampNumber(project.sprintMinutes ?? fallback.sprintMinutes, MIN_SPRINT_MINUTES, MAX_SPRINT_MINUTES, fallback.sprintMinutes),
    breakMinutes: clampNumber(project.breakMinutes ?? fallback.breakMinutes, MIN_BREAK_MINUTES, MAX_BREAK_MINUTES, fallback.breakMinutes),
    streak: clampNumber(project.streak ?? fallback.streak, 0, 9999, fallback.streak),
    lastCompletionDate: project.lastCompletionDate ?? fallback.lastCompletionDate,
    reminderEnabled: typeof project.reminderEnabled === 'boolean' ? project.reminderEnabled : fallback.reminderEnabled,
    reminderTime: normalizeTime(project.reminderTime, fallback.reminderTime),
    lastReminderDate: project.lastReminderDate ?? fallback.lastReminderDate,
    ritualChecks: {
      ...fallback.ritualChecks,
      ...(project.ritualChecks ?? {}),
    },
    soundtrackUrl: normalizeUrl(project.soundtrackUrl, fallback.soundtrackUrl),
    cueTheme: normalizeCueTheme(project.cueTheme, fallback.cueTheme),
    archived: typeof project.archived === 'boolean' ? project.archived : fallback.archived,
    restartMode: typeof project.restartMode === 'boolean' ? project.restartMode : fallback.restartMode,
    restartChecks: {
      ...fallback.restartChecks,
      ...(project.restartChecks ?? {}),
    },
    sessionOutcome: normalizeOutcome(project.sessionOutcome, fallback.sessionOutcome ?? 'drafted'),
  };
}

export function normalizeSession(session: Partial<SessionRecord>, fallbackProjectId: string, base?: SessionRecord): SessionRecord {
  const fallback = base ?? {
    id: `session-${fallbackProjectId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: getTodayKey(),
    timeOfDay: '19:00',
    minutes: 10,
    mood: 'steady',
    energy: 'medium',
    focus: 'usable',
    goal: goalLibrary[0],
    outcome: 'drafted',
    projectId: fallbackProjectId,
    note: '',
    restartCue: '',
    usedRestartMode: false,
  };

  const projectId = sanitizeText(session.projectId, 120, fallback.projectId || fallbackProjectId);
  return {
    ...fallback,
    ...session,
    id: sanitizeText(session.id, 120, fallback.id),
    date: normalizeDate(session.date, fallback.date),
    timeOfDay: normalizeTime(session.timeOfDay, fallback.timeOfDay),
    minutes: clampNumber(session.minutes ?? fallback.minutes, MIN_SESSION_MINUTES, MAX_SESSION_MINUTES, fallback.minutes),
    mood: (session.mood ?? fallback.mood) as SessionRecord['mood'],
    energy: (session.energy ?? fallback.energy) as SessionRecord['energy'],
    focus: (session.focus ?? fallback.focus) as SessionRecord['focus'],
    goal: sanitizeText(session.goal, GOAL_MAX_LENGTH, fallback.goal),
    outcome: normalizeOutcome(session.outcome, fallback.outcome as SessionResultado),
    projectId,
    note: sanitizeText(session.note, SESSION_NOTE_MAX_LENGTH, fallback.note),
    restartCue: sanitizeText(session.restartCue, SESSION_NOTE_MAX_LENGTH, fallback.restartCue),
    usedRestartMode: typeof session.usedRestartMode === 'boolean' ? session.usedRestartMode : fallback.usedRestartMode,
  };
}
