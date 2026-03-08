import { ChangeEvent, useEffect, useMemo, useRef, useState, useCallback, lazy, Suspense } from 'react';
import { Moon, Sun, BookOpen, Activity, LayoutDashboard, Settings, Feather } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { hasSupabaseConfig, supabase } from './lib/supabase';
import { useAuth } from './hooks/useAuth';
import { useTimer } from './hooks/useTimer';
import { useCloudSync } from './hooks/useCloudSync';

const TodayView = lazy(() => import('./components/views/TodayView').then(m => ({ default: m.TodayView })));
const ProjectsView = lazy(() => import('./components/views/ProjectsView').then(m => ({ default: m.ProjectsView })));
const InsightsView = lazy(() => import('./components/views/InsightsView').then(m => ({ default: m.InsightsView })));
const AccountView = lazy(() => import('./components/views/AccountView').then(m => ({ default: m.AccountView })));

type RitualStep = {
  id: string;
  label: string;
  detail: string;
};

type Mood = 'foggy' | 'steady' | 'restless' | 'anxious';
type Energy = 'low' | 'medium' | 'high';
type Focus = 'scattered' | 'usable' | 'sharp';
type SessionResultado = 'drafted' | 'revised' | 'outlined' | 'showed-up';
type NotificationState = NotificationPermission | 'unsupported';
type CueTheme = 'embers' | 'mist' | 'moonlight';
type NuvemStatus = 'local' | 'loading' | 'synced' | 'saving' | 'restoring' | 'error';
type HistoryProjectFilter = 'active' | 'all';
type HistoryOutcomeFilter = 'all' | SessionResultado;
type ReminderChannel = 'browser' | 'email' | 'both';
type AuthView = 'sign-in' | 'sign-up' | 'forgot-password' | 'recovery';
type ChartRange = '7d' | '30d' | '90d' | 'all';
type ComparisonMetric = 'minutes' | 'weekly' | 'sessions' | 'streak';
type WorkspaceView = 'today' | 'projects' | 'insights' | 'account';
type UiTheme = 'dark' | 'light';
type ChartPoint = { label: string; value: number; note?: string };

type ProjectAttachment = {
  id: string;
  label: string;
  url: string;
};

type SessionRecord = {
  id: string;
  date: string;
  timeOfDay: string;
  minutes: number;
  mood: Mood;
  energy: Energy;
  focus: Focus;
  goal: string;
  outcome: SessionResultado;
  projectId: string;
  note: string;
  restartCue: string;
  usedRestartMode: boolean;
};

type Project = {
  id: string;
  name: string;
  note: string;
  attachments: ProjectAttachment[];
  selectedGoal: string;
  customGoal: string;
  sprintMinutes: number;
  breakMinutes: number;
  streak: number;
  lastCompletionDate: string | null;
  sessionOutcome: SessionResultado;
  reminderEnabled: boolean;
  reminderTime: string;
  lastReminderDate: string | null;
  ritualChecks: Record<string, boolean>;
  soundtrackUrl: string;
  cueTheme: CueTheme;
  archived: boolean;
  restartMode: boolean;
  restartChecks: Record<string, boolean>;
};

type Profile = {
  user_id: string;
  display_name: string | null;
  timezone: string;
  active_project_id?: string | null;
  default_sprint_minutes: number;
  default_break_minutes: number;
  reminder_channel: ReminderChannel;
  email_reminders_enabled: boolean;
  email_reminder_time: string;
  created_at?: string;
  updated_at?: string;
};

type AppState = {
  activeProjectId: string;
  projects: Project[];
  sessions: SessionRecord[];
  mood: Mood;
  energy: Energy;
  focus: Focus;
};

type LegacyAppState = {
  ritualChecks?: Record<string, boolean>;
  mood?: Mood;
  energy?: Energy;
  focus?: Focus;
  selectedGoal?: string;
  customGoal?: string;
  sprintMinutes?: number;
  breakMinutes?: number;
  streak?: number;
  lastCompletionDate?: string | null;
  sessions?: Array<Partial<SessionRecord> & { date: string; minutes: number; goal: string; outcome?: SessionResultado }>;
  sessionOutcome?: SessionResultado;
  reminderEnabled?: boolean;
  reminderTime?: string;
  lastReminderDate?: string | null;
};

const STORAGE_KEY = 'phenomena-writing-rhythm';
const THEME_STORAGE_KEY = 'phenomena-ui-theme';
const DEFAULT_PROJECT_ID = 'project-main';
const ambientPresets = [
  { label: 'Brown Noise', url: 'https://www.youtube.com/results?search_query=brown+noise' },
  { label: 'Rain at Night', url: 'https://www.youtube.com/results?search_query=rain+at+night+ambience' },
  { label: 'Dark Ambient', url: 'https://www.youtube.com/results?search_query=dark+ambient+writing+music' },
];

const ritualSteps: RitualStep[] = [
  { id: 'water', label: 'Prepare Your Environment', detail: 'Get water, stretch, take a breath.' },
  { id: 'draft', label: 'Clear Distractions', detail: 'Close unnecessary tabs and mute notifications.' },
  { id: 'sound', label: 'Set Ambient Audio', detail: 'Start your chosen ambient sound or background noise.' },
  { id: 'promise', label: 'Commit to a Goal', detail: 'Commit to one small, achievable step for this session.' },
];

const goalLibrary = [
  'Write 50 words',
  'Finish one paragraph',
  'Draft a strong opening',
  'Edit one page',
  'Work on a difficult scene',
  'Plan tomorrow\'s task',
];

const outcomeOptions: Array<{ value: SessionResultado; label: string; detail: string }> = [
  { value: 'drafted', label: 'Drafted Text', detail: 'Wrote new words and pushed the draft forward.' },
  { value: 'revised', label: 'Revised Text', detail: 'Edited and refined existing prose.' },
  { value: 'outlined', label: 'Outlined Ideas', detail: 'Planned the structure of future scenes.' },
  { value: 'showed-up', label: 'Showed Up', detail: 'Was present at the desk but didn\'t write much.' },
];

const restartSteps = [
  'Shift perspective: This is a restart, not a failure.',
  'Shrink the task until it feels easy.',
  'Leave a sentence unfinished for tomorrow.',
] as const;

function restartCheckDefaults() {
  return Object.fromEntries(restartSteps.map((step) => [step, false])) as Record<string, boolean>;
}

function ritualCheckDefaults() {
  return Object.fromEntries(ritualSteps.map((step) => [step.id, false]));
}

function createProfile(userId: string, timezone: string): Profile {
  return {
    user_id: userId,
    display_name: null,
    timezone,
    active_project_id: DEFAULT_PROJECT_ID,
    default_sprint_minutes: 15,
    default_break_minutes: 3,
    reminder_channel: 'browser',
    email_reminders_enabled: false,
    email_reminder_time: '18:00',
  };
}

function createProject(id: string, name: string, note: string, defaults?: Partial<Pick<Project, 'sprintMinutes' | 'breakMinutes'>>) {
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
    sessionOutcome: 'drafted' as SessionResultado,
    reminderEnabled: false,
    reminderTime: '18:00',
    lastReminderDate: null,
    ritualChecks: ritualCheckDefaults(),
    soundtrackUrl: ambientPresets[0].url,
    cueTheme: 'embers' as CueTheme,
    archived: false,
    restartMode: false,
    restartChecks: restartCheckDefaults(),
  };
}

const defaultState: AppState = {
  activeProjectId: DEFAULT_PROJECT_ID,
  projects: [createProject(DEFAULT_PROJECT_ID, 'Main Project', 'Your primary focus at the moment.')],
  sessions: [],
  mood: 'steady',
  energy: 'medium',
  focus: 'usable',
};

function getTodayKey() {
  return new Intl.DateTimeFormat('en-CA').format(new Date());
}

function getTimeKey() {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
}

function parseDateKey(dateKey: string) {
  return new Date(`${dateKey}T12:00:00`);
}

function getDayDiff(from: string, to: string) {
  return Math.floor((parseDateKey(to).getTime() - parseDateKey(from).getTime()) / 86400000);
}

function normalizeSession(session: Partial<SessionRecord>, fallbackProjectId: string): SessionRecord {
  return {
    id: session.id ?? `legacy-${session.projectId ?? fallbackProjectId}-${session.date ?? getTodayKey()}-${session.timeOfDay ?? '19:00'}-${session.minutes ?? 10}`,
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

function createSessionId(projectId: string) {
  return `session-${projectId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function serializeSyncState(state: AppState) {
  return JSON.stringify({
    activeProjectId: state.activeProjectId,
    projects: state.projects,
    sessions: state.sessions,
  });
}

function hydrateProject(project: Partial<Project>, fallbackId: string, fallbackName: string, fallbackNote: string): Project {
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

function parseStoredState(raw: string | null): AppState {
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
        sessionOutcome: parsed.sessionOutcome ?? 'drafted',
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

function getRangeDays(range: ChartRange) {
  if (range === '7d') return 7;
  if (range === '30d') return 30;
  if (range === '90d') return 90;
  return null;
}

function filterSessionsByRange(sessions: SessionRecord[], range: ChartRange) {
  const days = getRangeDays(range);
  if (!days) {
    return sessions;
  }
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (days - 1));
  return sessions.filter((session) => parseDateKey(session.date).getTime() >= cutoff.getTime());
}

function projectGoal(project: Project) {
  return project.customGoal.trim() || project.selectedGoal;
}

function getStreakLabel(lastCompletionDate: string | null, streak: number) {
  const today = getTodayKey();
  if (!lastCompletionDate) {
    return 'No streak yet. Start a quick session to get on the board.';
  }
  if (lastCompletionDate === today) {
    return `You've worked today. Current streak: ${streak} day${streak === 1 ? '' : 's'}.`;
  }
  if (getDayDiff(lastCompletionDate, today) === 1) {
    return `Yesterday was good. Keep the momentum today: ${streak} days.`;
  }
  return 'The streak can be saved. Start a short session today.';
}

function getReminderStatus(notificationState: NotificationState, reminderEnabled: boolean) {
  if (!reminderEnabled) {
    return 'Daily alarms disabled.';
  }
  if (notificationState === 'unsupported') {
    return 'Browser notifications blocked. Alerts will only show inside the app.';
  }
  if (notificationState === 'granted') {
    return 'Browser notifications enabled.';
  }
  if (notificationState === 'denied') {
    return 'Browser notifications are blocked. The app uses internal alerts.';
  }
  return 'Enable notifications to receive daily reminders.';
}

function shouldTriggerReminder(project: Project) {
  const today = getTodayKey();
  if (!project.reminderEnabled || project.lastCompletionDate === today || project.lastReminderDate === today || project.archived) {
    return false;
  }
  const [hours, minutes] = project.reminderTime.split(':').map(Number);
  const now = new Date();
  const reminderMoment = new Date(now);
  reminderMoment.setHours(hours, minutes, 0, 0);
  return now.getTime() >= reminderMoment.getTime();
}

function outcomeLabel(outcome: SessionResultado) {
  return outcomeOptions.find((option) => option.value === outcome)?.label ?? 'Drafted Text';
}

function getProjectSessions(projectId: string, sessions: SessionRecord[]) {
  return sessions.filter((session) => session.projectId === projectId);
}

function getProjectAttachmentCount(projects: Project[]) {
  return projects.reduce((count, project) => count + project.attachments.length, 0);
}

function getWeeklyMinutes(projectId: string, sessions: SessionRecord[]) {
  return getProjectSessions(projectId, sessions)
    .filter((session) => Date.now() - parseDateKey(session.date).getTime() <= 6 * 86400000)
    .reduce((total, session) => total + session.minutes, 0);
}

function groupCount<T extends string>(items: T[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] ?? 0) + 1;
    return acc;
  }, {});
}

function topKey(counts: Record<string, number>, fallback: string) {
  const entries = Object.entries(counts);
  if (!entries.length) {
    return fallback;
  }
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

function getTimeBucket(timeOfDay: string) {
  const hour = Number(timeOfDay.split(':')[0]);
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Night';
}

function getProjectAnalytics(project: Project, sessions: SessionRecord[]) {
  const projectSessions = getProjectSessions(project.id, sessions);
  const averageSprint = projectSessions.length
    ? Math.round(projectSessions.reduce((total, session) => total + session.minutes, 0) / projectSessions.length)
    : project.sprintMinutes;
  const totalMinutes = projectSessions.reduce((total, session) => total + session.minutes, 0);
  const timeCounts = groupCount(projectSessions.map((session) => getTimeBucket(session.timeOfDay)));
  const bestTime = topKey(timeCounts, 'Noite');
  const moodMinutos = projectSessions.reduce<Record<string, number>>((acc, session) => {
    acc[session.mood] = (acc[session.mood] ?? 0) + session.minutes;
    return acc;
  }, {});
  const bestMood = topKey(moodMinutos, 'steady');
  const outcomeCounts = groupCount(projectSessions.map((session) => session.outcome));
  const bestOutcome = topKey(outcomeCounts, 'drafted') as SessionResultado;
  const patternCounts = groupCount(projectSessions.map((session) => `${session.mood}:${session.outcome}`));
  const dominantMoodPattern = topKey(patternCounts, 'steady:drafted').split(':');
  const longestGap = projectSessions.length > 1
    ? projectSessions
      .slice()
      .sort((a, b) => parseDateKey(a.date).getTime() - parseDateKey(b.date).getTime())
      .reduce((maxGap, session, index, arr) => {
        if (index === 0) return maxGap;
        return Math.max(maxGap, getDayDiff(arr[index - 1].date, session.date) - 1);
      }, 0)
    : 0;
  const noteSeed = projectSessions.find((session) => session.restartCue.trim())?.restartCue || 'Leave a one-line note to return after each session.';
  const restartSessions = projectSessions.filter((session) => session.usedRestartMode);
  const restartRecoveries = restartSessions.filter((session) => {
    const later = projectSessions.find(
      (candidate) => parseDateKey(candidate.date).getTime() > parseDateKey(session.date).getTime(),
    );
    return later ? getDayDiff(session.date, later.date) <= 2 : false;
  }).length;
  const restartRecoveryRate = restartSessions.length ? Math.round((restartRecoveries / restartSessions.length) * 100) : 0;

  return {
    bestTime,
    bestMood,
    bestOutcome,
    averageSprint,
    totalMinutes,
    restartSessions: restartSessions.length,
    restartRecoveryRate,
    streakStability: longestGap === 0 ? 'Stable' : longestGap <= 2 ? 'Shaky' : 'Fragile',
    dominantMoodPattern,
    noteSeed,
    totalSessions: projectSessions.length,
  };
}

function getCrossProjectSummary(projects: Project[], sessions: SessionRecord[]) {
  const activeProjetos = projects.filter((project) => !project.archived);
  const totalWeeklyMinutes = activeProjetos.reduce((sum, project) => sum + getWeeklyMinutes(project.id, sessions), 0);
  const topStreakProject = activeProjetos.slice().sort((a, b) => b.streak - a.streak)[0];
  const timeCounts = groupCount(
    activeProjetos.flatMap((project) => getProjectSessions(project.id, sessions).map((session) => getTimeBucket(session.timeOfDay))),
  );
  const strongestTime = topKey(timeCounts, 'Noite');
  return {
    activeCount: activeProjetos.length,
    archivedCount: projects.length - activeProjetos.length,
    attachmentCount: getProjectAttachmentCount(projects),
    totalWeeklyMinutes,
    topStreakProject: topStreakProject?.name ?? 'No active case yet',
    strongestTime,
  };
}

function getRecentDaySeries(projectId: string, sessions: SessionRecord[], range: ChartRange): ChartPoint[] {
  const filteredSessions = filterSessionsByRange(getProjectSessions(projectId, sessions), range);
  const days = getRangeDays(range) ?? Math.min(
    30,
    Math.max(
      7,
      filteredSessions.length
        ? getDayDiff(
          filteredSessions.reduce((min, session) => (session.date < min ? session.date : min), filteredSessions[0].date),
          getTodayKey(),
        ) + 1
        : 7,
    ),
  );
  const byDay = filteredSessions.reduce<Record<string, number>>((acc, session) => {
    acc[session.date] = (acc[session.date] ?? 0) + session.minutes;
    return acc;
  }, {});

  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - index));
    const key = new Intl.DateTimeFormat('en-CA').format(date);
    const label = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
    return { label, value: byDay[key] ?? 0, note: key };
  });
}

function getOutcomeSeries(projectId: string, sessions: SessionRecord[], range: ChartRange) {
  const counts = groupCount(filterSessionsByRange(getProjectSessions(projectId, sessions), range).map((session) => session.outcome));
  return outcomeOptions.map((option) => ({
    label: option.label,
    value: counts[option.value] ?? 0,
  }));
}

function getMoodSeries(projectId: string, sessions: SessionRecord[], range: ChartRange) {
  const moodMinutos = filterSessionsByRange(getProjectSessions(projectId, sessions), range).reduce<Record<string, number>>((acc, session) => {
    acc[session.mood] = (acc[session.mood] ?? 0) + session.minutes;
    return acc;
  }, {});

  return ['foggy', 'steady', 'restless', 'anxious'].map((mood) => ({
    label: mood,
    value: moodMinutos[mood] ?? 0,
  }));
}

function getProjectComparisonSeries(projects: Project[], sessions: SessionRecord[], metric: ComparisonMetric, range: ChartRange): ChartPoint[] {
  return projects
    .filter((project) => !project.archived)
    .map((project) => ({
      label: project.name,
      value:
        metric === 'minutes'
          ? filterSessionsByRange(getProjectSessions(project.id, sessions), range).reduce((total, session) => total + session.minutes, 0)
          : metric === 'weekly'
            ? getWeeklyMinutes(project.id, sessions)
            : metric === 'sessions'
              ? filterSessionsByRange(getProjectSessions(project.id, sessions), range).length
              : project.streak,
      note:
        metric === 'streak'
          ? `${project.streak} continuous days`
          : metric === 'sessions'
            ? `${filterSessionsByRange(getProjectSessions(project.id, sessions), range).length} sessions`
            : `${getWeeklyMinutes(project.id, sessions)} min this week`,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

function buildStateFromNormalizedTables(
  projectRows: Array<Record<string, unknown>>,
  sessionRows: Array<Record<string, unknown>>,
  attachmentRows: Array<Record<string, unknown>>,
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
        sessionOutcome: (String(row.session_outcome ?? 'drafted') as SessionResultado),
        reminderEnabled: Boolean(row.reminder_enabled),
        reminderTime: String(row.reminder_time ?? '18:00'),
        lastReminderDate: row.last_reminder_date ? String(row.last_reminder_date) : null,
        ritualChecks: (row.ritual_checks as Record<string, boolean> | undefined),
        soundtrackUrl: String(row.soundtrack_url ?? ambientPresets[0].url),
        cueTheme: (String(row.cue_theme ?? 'embers') as CueTheme),
        archived: Boolean(row.archived),
        restartMode: Boolean(row.restart_mode),
        restartChecks: (row.restart_checks as Record<string, boolean> | undefined),
      },
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

export function LineChart({
  title,
  points,
  accent = 'var(--accent)',
  activePoint,
  onPointFocus,
}: {
  title: string;
  points: ChartPoint[];
  accent?: string;
  activePoint?: ChartPoint | null;
  onPointFocus?: (point: ChartPoint) => void;
}) {
  const max = Math.max(...points.map((point) => point.value), 1);
  const path = points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * 100;
      const y = 100 - (point.value / max) * 100;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div className="chart-card">
      <div className="chart-head">
        <strong>{title}</strong>
        <span>Pico {max} min</span>
      </div>
      <svg className="line-chart" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={title}>
        <path className="line-chart-area" d={`${path} L 100 100 L 0 100 Z`} />
        <path className="line-chart-path" d={path} style={{ stroke: accent }} />
        {points.map((point, index) => {
          const x = (index / Math.max(points.length - 1, 1)) * 100;
          const y = 100 - (point.value / max) * 100;
          return (
            <circle
              cx={x}
              cy={y}
              key={`${point.label}-${index}`}
              r="2.8"
              style={{ fill: accent }}
              onMouseEnter={() => onPointFocus?.(point)}
              onFocus={() => onPointFocus?.(point)}
              tabIndex={0}
            />
          );
        })}
      </svg>
      {activePoint ? (
        <div className="chart-detail">
          <strong>{activePoint.label}</strong>
          <span>{activePoint.value} min</span>
          {activePoint.note ? <small>{activePoint.note}</small> : null}
        </div>
      ) : null}
      <div className="chart-axis">
        {points.map((point) => (
          <div key={point.label}>
            <strong>{point.value}</strong>
            <span>{point.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BarChart({
  title,
  points,
  accent = 'var(--secondary)',
  activePoint,
  onPointFocus,
}: {
  title: string;
  points: ChartPoint[];
  accent?: string;
  activePoint?: ChartPoint | null;
  onPointFocus?: (point: ChartPoint) => void;
}) {
  const max = Math.max(...points.map((point) => point.value), 1);
  return (
    <div className="chart-card">
      <div className="chart-head">
        <strong>{title}</strong>
        <span>{points.reduce((sum, point) => sum + point.value, 0)} total</span>
      </div>
      <div className="bar-chart">
        {points.map((point) => (
          <div className="bar-row" key={`${title}-${point.label}`}>
            <div className="bar-labels">
              <strong>{point.label}</strong>
              <span>{point.note ?? `${point.value}`}</span>
            </div>
            <div className="bar-track" onMouseEnter={() => onPointFocus?.(point)} onFocus={() => onPointFocus?.(point)} tabIndex={0}>
              <div className="bar-fill" style={{ width: `${(point.value / max) * 100}%`, background: accent }} />
            </div>
            <span className="bar-value">{point.value}</span>
          </div>
        ))}
      </div>
      {activePoint ? (
        <div className="chart-detail">
          <strong>{activePoint.label}</strong>
          <span>{activePoint.value}</span>
          {activePoint.note ? <small>{activePoint.note}</small> : null}
        </div>
      ) : null}
    </div>
  );
}

function getCoachingInsight(project: Project, state: AppState) {
  const sessions = getProjectSessions(project.id, state.sessions);
  const weeklyMinutos = getWeeklyMinutes(project.id, state.sessions);
  const sameMood = sessions.filter((session) => session.mood === state.mood);
  const sameFocus = sessions.filter((session) => session.focus === state.focus);
  const sameEnergy = sessions.filter((session) => session.energy === state.energy);
  const analytics = getProjectAnalytics(project, state.sessions);
  const averageMinutos = analytics.averageSprint;
  const dominantResultado = analytics.bestOutcome;
  const bestSprint = [10, 15, 25]
    .map((minutes) => ({
      minutes,
      count: sessions.filter((session) => Math.abs(session.minutes - minutes) <= 2).length,
    }))
    .sort((a, b) => b.count - a.count)[0]?.minutes ?? project.sprintMinutes;

  let message = '';
  if (state.energy === 'low') {
    message = sameFocus.length >= 2 && dominantResultado
      ? `You survive these low-tide days by playing it safe (${outcomeLabel(dominantResultado)}). Keep your goals manageable today. Don't push too hard.`
      : 'Set very small goals. Edit a single sentence if you have to.';
  } else if (state.focus === 'scattered') {
    message = sameEnergy.length >= 2 && dominantResultado
      ? `When your focus is low, you often rely on (${outcomeLabel(dominantResultado)}). Start with the easiest task and remove distractions.`
      : 'Try a focused 15-minute sprint and leave a clear starting point for tomorrow.';
  } else if (state.mood === 'anxious') {
    message = sameFocus.length >= 2
      ? `Anxious days on this project respond better to low-pressure work. Your history leans towards ${outcomeLabel(dominantResultado)} sessions; lower the target and stay close to the text.`
      : 'Focus on light tasks: clean a paragraph or list three scene ideas. Work without forcing it.';
  } else if (project.streak >= 4 && weeklyMinutos >= 60) {
    message = `Your pacing is strong in ${project.name}. With ${weeklyMinutos} minutes this week, you can manage a ${bestSprint}-minute sprint today.`;
  } else {
    message = `Tackle one small piece of the project. Focus on that entirely. Start the timer.`;
  }

  const evidence = sessions.length
    ? `Based on ${sessions.length} recorded session${sessions.length === 1 ? '' : 's'} on this file, your strongest mood is ${analytics.bestMood}, your most common victory is ${outcomeLabel(dominantResultado)}, your best writing hour is ${analytics.bestTime}, and ${analytics.restartRecoveryRate}% of restart sessions recovered within two days.`
    : 'No deep history on this project yet. Insights will improve as you log more sessions.';

  return { message, evidence };
}

function getRecoveryMessage(project: Project) {
  const today = getTodayKey();
  if (!project.lastCompletionDate || project.lastCompletionDate === today) {
    return 'No recovery needed. Protect the rhythm with one more simple dive.';
  }
  const diff = getDayDiff(project.lastCompletionDate, today);
  if (diff === 1) {
    return 'You only missed one day. Prepare normally and keep the target small.';
  }
  return `You haven't worked on ${project.name} for ${diff} days. Return to it and log a small win.`;
}

function getRestartState(project: Project) {
  const today = getTodayKey();
  if (!project.lastCompletionDate || project.lastCompletionDate === today) {
    return { needed: false, daysAway: 0 };
  }
  const daysAway = getDayDiff(project.lastCompletionDate, today);
  return { needed: daysAway > 1, daysAway };
}

export function formatCloudTimestamp(timestamp: string | null) {
  if (!timestamp) {
    return 'Never';
  }
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

export default function App() {
  const [state, setState] = useState<AppState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  const { session, setSession, authView, setAuthView, authEmail, setAuthEmail, authPassword, setAuthPassword, authPasswordConfirm, setAuthPasswordConfirm, authMessage, setAuthMessage, passwordMessage, setSenhaMessage, profile, setProfile, profileLoaded, setProfileLoaded, profileMessage, setProfileMessage, signInWithPassword, signUpWithPassword, sendPasswordReset, updatePassword, signOut } = useAuth(supabase, hasSupabaseConfig, createProfile);
  const { cloudStatus, setNuvemStatus, remoteLoaded, setRemoteLoaded, remoteSnapshot, setRemoteSnapshot, remoteUpdatedAt, setRemoteUpdatedAt, normalizedMessage, setNormalizedMessage, pullCloudState, pushLocalState } = useCloudSync(supabase, hasSupabaseConfig, session, state, setState, hydrated, profile, buildStateFromNormalizedTables, serializeSyncState);
  const [notificationState, setNotificationState] = useState<NotificationState>('default');
  const [importMessage, setImportMessage] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectNote, setNewProjectNote] = useState('');
  const [sessionNote, setSessionNote] = useState('');
  const [restartCue, setRestartCue] = useState('');

  const updateProject = useCallback((updater: (project: Project) => Project) => {
    setState((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === current.activeProjectId ? updater(project) : project,
      ),
    }));
  }, []);

  const updateProfile = useCallback(<K extends keyof Profile>(key: K, value: Profile[K]) => {
    setProfile((current) => (current ? { ...current, [key]: value } : current));
  }, [setProfile]);

  const setActiveProject = useCallback((projectId: string) => {
    setProfile((current) => (current ? { ...current, active_project_id: projectId } : current));
    setState((current) => ({ ...current, activeProjectId: projectId }));
  }, [setProfile]);

  const { mode, setMode, secondsLeft, setSecondsLeft, startSprint, resetTimer, completeSession, activateRestartMode, formatTime } = useTimer(
    state.projects.find((project) => project.id === state.activeProjectId) ?? state.projects[0],
    updateProject, state, setState, sessionNote, restartCue, setSessionNote, setRestartCue, getTodayKey, getTimeKey, getDayDiff, createSessionId, ritualCheckDefaults, restartCheckDefaults
  );

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [historyQuery, setHistoryQuery] = useState('');
  const [historyProjectFilter, setHistoryProjectFilter] = useState<HistoryProjectFilter>('active');
  const [historyOutcomeFilter, setHistoryOutcomeFilter] = useState<HistoryOutcomeFilter>('all');
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>('today');
  const [uiTheme, setUiTheme] = useState<UiTheme>('dark');
  const [chartRange, setChartRange] = useState<ChartRange>('30d');
  const [comparisonMetric, setComparisonMetric] = useState<ComparisonMetric>('minutes');
  const [activeChartPoint, setActiveChartPoint] = useState<ChartPoint | null>(null);
  const [newAttachmentLabel, setNewAttachmentLabel] = useState('');
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const nextState = parseStoredState(localStorage.getItem(STORAGE_KEY));
    setState(nextState);
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setUiTheme(storedTheme);
    }
    const activeProject = nextState.projects.find((project) => project.id === nextState.activeProjectId) ?? nextState.projects[0];
    setSecondsLeft((activeProject?.sprintMinutes ?? 15) * 60);
    setNotificationState(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission);
    setHydrated(true);
  }, []);


  useEffect(() => {
    if (!hydrated) {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  useEffect(() => {
    document.body.classList.toggle('theme-light', uiTheme === 'light');
    document.body.classList.toggle('theme-dark', uiTheme === 'dark');
    localStorage.setItem(THEME_STORAGE_KEY, uiTheme);
  }, [uiTheme]);




  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    setActiveChartPoint(null);
  }, [chartRange, comparisonMetric, state.activeProjectId]);

  const activeProject = useMemo(
    () => state.projects.find((project) => project.id === state.activeProjectId) ?? state.projects[0],
    [state.activeProjectId, state.projects],
  );
  const activeProjetos = useMemo(() => state.projects.filter((project) => !project.archived), [state.projects]);
  const archivedProjetos = useMemo(() => state.projects.filter((project) => project.archived), [state.projects]);
  const projectNameMap = useMemo(
    () => Object.fromEntries(state.projects.map((project) => [project.id, project.name])),
    [state.projects],
  );



  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const maybeTriggerReminder = () => {
      setState((current) => {
        const project = current.projects.find((entry) => entry.id === current.activeProjectId) ?? current.projects[0];
        if (!project || !shouldTriggerReminder(project)) {
          return current;
        }

        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('Phenomena', {
            body: `Time for your daily session on ${project.name}. Today's target: ${projectGoal(project)}`,
          });
        }

        return {
          ...current,
          projects: current.projects.map((entry) =>
            entry.id === project.id ? { ...entry, lastReminderDate: getTodayKey() } : entry,
          ),
        };
      });
    };

    maybeTriggerReminder();
    const interval = window.setInterval(maybeTriggerReminder, 60000);
    return () => window.clearInterval(interval);
  }, [hydrated]);

  if (!activeProject) {
    return null;
  }

  const ritualPronto = useMemo(() => ritualSteps.every((step) => activeProject.ritualChecks[step.id]), [activeProject.ritualChecks]);
  const restartPronto = useMemo(() => restartSteps.every((step) => activeProject.restartChecks[step]), [activeProject.restartChecks]);
  const readyToStart = ritualPronto && (!activeProject.restartMode || restartPronto);
  const activeGoal = useMemo(() => projectGoal(activeProject), [activeProject]);
  const streakLabel = useMemo(() => getStreakLabel(activeProject.lastCompletionDate, activeProject.streak), [activeProject.lastCompletionDate, activeProject.streak]);
  const reminderStatus = useMemo(() => getReminderStatus(notificationState, activeProject.reminderEnabled), [notificationState, activeProject.reminderEnabled]);
  const reminderDue = useMemo(() => shouldTriggerReminder(activeProject), [activeProject]);
  const recentSessions = useMemo(() => getProjectSessions(activeProject.id, state.sessions).slice(-5).reverse(), [activeProject.id, state.sessions]);
  const coaching = useMemo(() => getCoachingInsight(activeProject, state), [activeProject, state.sessions, state.mood, state.energy, state.focus]);
  const recoveryMessage = useMemo(() => getRecoveryMessage(activeProject), [activeProject]);
  const restart = useMemo(() => getRestartState(activeProject), [activeProject]);
  const weeklyMinutos = useMemo(() => getWeeklyMinutes(activeProject.id, state.sessions), [activeProject.id, state.sessions]);
  const analytics = useMemo(() => getProjectAnalytics(activeProject, state.sessions), [activeProject, state.sessions]);
  const dashboard = useMemo(() => getCrossProjectSummary(state.projects, state.sessions), [state.projects, state.sessions]);
  const recentDaySeries = useMemo(() => getRecentDaySeries(activeProject.id, state.sessions, chartRange), [activeProject.id, state.sessions, chartRange]);
  const outcomeSeries = useMemo(() => getOutcomeSeries(activeProject.id, state.sessions, chartRange), [activeProject.id, state.sessions, chartRange]);
  const moodSeries = useMemo(() => getMoodSeries(activeProject.id, state.sessions, chartRange), [activeProject.id, state.sessions, chartRange]);
  const projectComparisonSeries = useMemo(() => getProjectComparisonSeries(state.projects, state.sessions, comparisonMetric, chartRange), [state.projects, state.sessions, comparisonMetric, chartRange]);

  const filteredHistory = useMemo(() => {
    return state.sessions
      .slice()
      .reverse()
      .filter((entry) => (historyProjectFilter === 'active' ? entry.projectId === activeProject.id : true))
      .filter((entry) => (historyOutcomeFilter === 'all' ? true : entry.outcome === historyOutcomeFilter))
      .filter((entry) => {
        const q = historyQuery.trim().toLowerCase();
        if (!q) {
          return true;
        }
        return [entry.goal, entry.note, entry.restartCue, projectNameMap[entry.projectId] ?? '']
          .join(' ')
          .toLowerCase()
          .includes(q);
      });
  }, [state.sessions, historyProjectFilter, activeProject.id, historyOutcomeFilter, historyQuery, projectNameMap]);

  const addAttachment = useCallback(() => {
    const label = newAttachmentLabel.trim();
    const url = newAttachmentUrl.trim();
    if (!label || !url) {
      return;
    }

    updateProject((project) => ({
      ...project,
      attachments: [
        ...project.attachments,
        {
          id: `attachment-${Date.now()}`,
          label,
          url,
        },
      ],
    }));
    setNewAttachmentLabel('');
    setNewAttachmentUrl('');
  }, [newAttachmentLabel, newAttachmentUrl, updateProject]);

  const removeAttachment = useCallback((attachmentId: string) => {
    updateProject((project) => ({
      ...project,
      attachments: project.attachments.filter((attachment) => attachment.id !== attachmentId),
    }));
  }, [updateProject]);

  const toggleRitual = useCallback((id: string) => {
    updateProject((project) => ({
      ...project,
      ritualChecks: {
        ...project.ritualChecks,
        [id]: !project.ritualChecks[id],
      },
    }));
  }, [updateProject]);

  const toggleRestartCheck = useCallback((step: string) => {
    updateProject((project) => ({
      ...project,
      restartChecks: {
        ...project.restartChecks,
        [step]: !project.restartChecks[step],
      },
    }));
  }, [updateProject]);

  const resetRitual = useCallback(() => {
    updateProject((project) => ({
      ...project,
      ritualChecks: ritualCheckDefaults(),
    }));
  }, [updateProject]);


  const enableNotifications = useCallback(async () => {
    if (typeof Notification === 'undefined') {
      setNotificationState('unsupported');
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationState(permission);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }, []);

  const archiveActiveProject = useCallback(() => {
    if (activeProjetos.length <= 1) {
      return;
    }
    const nextActive = activeProjetos.find((project) => project.id !== activeProject.id);
    setState((current) => ({
      ...current,
      activeProjectId: nextActive?.id ?? current.activeProjectId,
      projects: current.projects.map((project) =>
        project.id === current.activeProjectId ? { ...project, archived: true, restartMode: false } : project,
      ),
    }));
  }, [activeProjetos, activeProject.id]);

  const restoreProject = useCallback((projectId: string) => {
    setProfile((current) => (current ? { ...current, active_project_id: projectId } : current));
    setState((current) => ({
      ...current,
      activeProjectId: projectId,
      projects: current.projects.map((project) =>
        project.id === projectId ? { ...project, archived: false } : project,
      ),
    }));
  }, [setProfile]);


  function exportBackup() {
    const payload = JSON.stringify(state, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `phenomena-backup-${getTodayKey()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const nextState = parseStoredState(String(reader.result));
        setState(nextState);
        const project = nextState.projects.find((entry) => entry.id === nextState.activeProjectId) ?? nextState.projects[0];
        setSecondsLeft((project?.sprintMinutes ?? 15) * 60);
        setImportMessage('Backup imported. Your project rhythms e session history were restored.');
      } catch {
        setImportMessage('This file could not be decoded. Use a valid JSON backup archive from Phenomena.');
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  }

  const createNewProject = useCallback(() => {
    const name = newProjectName.trim();
    if (!name) {
      return;
    }
    const id = `project-${Date.now()}`;
    const project = createProject(id, name, newProjectNote.trim(), profile ? {
      sprintMinutes: profile.default_sprint_minutes,
      breakMinutes: profile.default_break_minutes,
    } : undefined);
    setState((current) => ({
      ...current,
      activeProjectId: id,
      projects: [...current.projects, project],
    }));
    setProfile((current) => (current ? { ...current, active_project_id: id } : current));
    setNewProjectName('');
    setNewProjectNote('');
    setMode('idle');
    setSecondsLeft(project.sprintMinutes * 60);
  }, [newProjectName, newProjectNote, profile, setProfile, setMode, setSecondsLeft]);

  const applyProfileDefaultsToActiveProject = useCallback(() => {
    if (!profile) {
      return;
    }
    updateProject((project) => ({
      ...project,
      sprintMinutes: profile.default_sprint_minutes,
      breakMinutes: profile.default_break_minutes,
    }));
    setSecondsLeft(profile.default_sprint_minutes * 60);
  }, [profile, updateProject, setSecondsLeft]);


  const shellClassName = `shell theme-${activeProject.cueTheme} ui-${uiTheme} ${isFullscreen ? 'fullscreen-mode' : ''} ${mode === 'sprint' ? 'focus-dim-bg' : ''}`;
  const cloudLabel = session
    ? cloudStatus === 'loading'
      ? 'Connecting to the satellite'
      : cloudStatus === 'saving'
        ? 'Uploading to the dark'
        : cloudStatus === 'restoring'
          ? 'Recovering lost files'
          : cloudStatus === 'synced'
            ? 'Vault sealed and synced'
            : 'Satellite unreachable'
    : 'Local isolation only';


  return (
    <main className={shellClassName} data-workspace={workspaceView}>

      <section className="hero card">
        <div className="hero-content">
          <p className="eyebrow">Phenomena</p>
          <h1>Organized whispers in the dark.</h1>
          <p className="lede">
            Isolate the noise. Embrace the rhythm of the text. A silent mechanism designed for scattered minds seeking focus on the next page.
          </p>
        </div>
        <div className="hero-stats">
          <div className="summary-card">
            <span className="summary-label">Active Case</span>
            <strong className="summary-value" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', display: 'block' }}>{activeProject.name}</strong>
          </div>
          <div className="summary-card">
            <span className="summary-label">Surviving Line</span>
            <strong className="summary-value status-sprint">
              {activeProject.streak} <span className="summary-label" style={{ display: 'inline', margin: 0 }}>days</span>
            </strong>
          </div>
          <div className="summary-card">
            <span className="summary-label">This Week</span>
            <strong className="summary-value timer-value">
              {weeklyMinutos} <span className="summary-label" style={{ display: 'inline', margin: 0 }}>min</span>
            </strong>
          </div>
        </div>
      </section>

      <section className="workspace-nav">
        <div className="nav-tabs">
          {[
            { id: 'today', label: 'Desk', icon: <Feather size={20} /> },
            { id: 'projects', label: 'Arch', icon: <BookOpen size={20} /> },
            { id: 'insights', label: 'Echo', icon: <Activity size={20} /> },
            { id: 'account', label: 'Core', icon: <Settings size={20} /> },
          ].map((tab) => (
            <button
              className={`nav-pill ${workspaceView === tab.id ? 'active' : ''}`}
              key={tab.id}
              onClick={() => setWorkspaceView(tab.id as WorkspaceView)}
              type="button"
              aria-label={`Open ${tab.label}`}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="theme-toggle">
          <button
            aria-label="Switch to Dark Mode"
            className={`nav-pill ${uiTheme === 'dark' ? 'active' : ''}`}
            onClick={() => setUiTheme('dark')}
            type="button"
          >
            <Moon size={14} /> Shadows
          </button>
          <button
            aria-label="Switch to Light Mode"
            className={`nav-pill ${uiTheme === 'light' ? 'active' : ''}`}
            onClick={() => setUiTheme('light')}
            type="button"
          >
            <Sun size={14} /> Light
          </button>
        </div>
      </section>

      <section className="summary-strip">
        <div className="summary-grid">
          <div className="summary-card">
            <span className="summary-label">Current Target</span>
            <strong className="summary-value">{activeGoal}</strong>
          </div>
          <div className="summary-card">
            <span className="summary-label">Clock</span>
            <strong className="summary-value timer-value">{formatTime(secondsLeft)}</strong>
          </div>
          <div className="summary-card">
            <span className="summary-label">State</span>
            <strong className={`summary-value status-${mode}`}>{mode === 'idle' ? 'Lurking' : mode === 'sprint' ? 'Hunting' : 'Breathing'}</strong>
          </div>
          <div className="summary-card">
            <span className="summary-label">Radar</span>
            <strong className="summary-value">{session ? cloudLabel : 'Local isolation'}</strong>
          </div>
        </div>
        {!session ? (
          <div className="summary-actions">
            <div className="coach-note muted compact-note">
              <strong>Black Box Recorder</strong>
              <p>Working in the shadows. Connect your account to endure beyond this machine's death.</p>
            </div>
            <button className="ghost" onClick={() => setWorkspaceView('account')} type="button">Open File</button>
          </div>
        ) : null}
      </section>

      <Suspense fallback={<div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'var(--muted)', fontSize: '0.9rem' }}>Aligning the stars...</div>}>
        {workspaceView === 'today' && <TodayView {...{
          activeProject, ritualPronto, readyToStart, activeGoal, streakLabel,
          reminderDue, recentSessions, coaching, recoveryMessage, restart, analytics,
          updateProject, state, setState, resetRitual, toggleRitual,
          mode, secondsLeft, formatTime, startSprint, resetTimer, completeSession,
          sessionNote, setSessionNote, restartCue, setRestartCue, activateRestartMode,
          toggleRestartCheck, goalLibrary, ritualSteps, restartSteps, outcomeOptions, outcomeLabel
        }} />}
        {workspaceView === 'projects' && <ProjectsView {...{
          activeProjetos, activeProject, setActiveProject, setMode, setSecondsLeft,
          updateProject, createNewProject, archiveActiveProject, newProjectName, setNewProjectName,
          newProjectNote, setNewProjectNote, removeAttachment, newAttachmentLabel, setNewAttachmentLabel,
          newAttachmentUrl, setNewAttachmentUrl, addAttachment, archivedProjetos, restoreProject,
          ambientPresets, toggleFullscreen, isFullscreen
        }} />}
        {workspaceView === 'insights' && <InsightsView {...{
          dashboard, chartRange, setChartRange, comparisonMetric, setComparisonMetric,
          projectComparisonSeries, activeChartPoint, setActiveChartPoint, recentDaySeries,
          activeProject, analytics, outcomeLabel, outcomeSeries, moodSeries,
          historyQuery, setHistoryQuery, historyProjectFilter, setHistoryProjectFilter,
          historyOutcomeFilter, setHistoryOutcomeFilter, outcomeOptions, filteredHistory,
          projectNameMap
        }} />}
        {workspaceView === 'account' && <AccountView {...{
          hasSupabaseConfig, cloudLabel, session, remoteUpdatedAt, authView, setAuthView,
          authEmail, setAuthEmail, authPassword, setAuthPassword, authPasswordConfirm, setAuthPasswordConfirm,
          signInWithPassword, signUpWithPassword, sendPasswordReset, updatePassword, signOut,
          authMessage, remoteSnapshot, getProjectAttachmentCount, normalizedMessage,
          profile, updateProfile, applyProfileDefaultsToActiveProject, profileMessage, passwordMessage,
          activeProject, updateProject, reminderStatus, enableNotifications, exportBackup, fileInputRef,
          importBackup, importMessage, setSenhaMessage, formatCloudTimestamp
        }} />}
      </Suspense>















    </main>
  );
}
