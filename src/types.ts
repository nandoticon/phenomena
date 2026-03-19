import type { Session } from '@supabase/supabase-js';

export interface RitualStep {
  id: string;
  label: string;
  detail: string;
}

export type Mood = 'foggy' | 'steady' | 'restless' | 'anxious';
export type Energy = 'low' | 'medium' | 'high';
export type Focus = 'scattered' | 'usable' | 'sharp';
export type SessionResultado = 'drafted' | 'revised' | 'outlined' | 'showed-up';
export type NotificationState = NotificationPermission | 'unsupported';
export type CueTheme = 'embers' | 'mist' | 'moonlight';
export type NuvemStatus = 'local' | 'loading' | 'synced' | 'saving' | 'restoring' | 'queued' | 'offline' | 'error';
export type HistoryProjectFilter = 'active' | 'all';
export type HistoryOutcomeFilter = 'all' | SessionResultado;
export type ReminderChannel = 'browser' | 'email' | 'both';
export type AuthView = 'sign-in' | 'sign-up' | 'forgot-password' | 'recovery';
export type ChartRange = '7d' | '30d' | '90d' | 'all';
export type ComparisonMetric = 'minutes' | 'weekly' | 'sessions' | 'streak';
export type WorkspaceView = 'today' | 'projects' | 'insights' | 'account';
export type UiTheme = 'dark' | 'light';

export interface ChartPoint {
  label: string;
  value: number;
  note?: string;
}

export interface ProjectAttachment {
  id: string;
  label: string;
  url: string;
}

export interface SessionRecord {
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
}

export interface Project {
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
  reminderEnabled: boolean;
  reminderTime: string;
  lastReminderDate: string | null;
  ritualChecks: Record<string, boolean>;
  soundtrackUrl: string;
  cueTheme: CueTheme;
  archived: boolean;
  restartMode: boolean;
  restartChecks: Record<string, boolean>;
  sessionOutcome?: SessionResultado;
}

export interface Profile {
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
}

export type ProfileEditableKey =
  | 'display_name'
  | 'timezone'
  | 'default_sprint_minutes'
  | 'default_break_minutes'
  | 'reminder_channel'
  | 'email_reminders_enabled'
  | 'email_reminder_time';

export type ProfileEditableValue<K extends ProfileEditableKey> = Profile[K];

export interface AppState {
  activeProjectId: string;
  projects: Project[];
  sessions: SessionRecord[];
  mood: Mood;
  energy: Energy;
  focus: Focus;
}

export interface SessionEditorValues extends Omit<SessionRecord, 'id'> {
  id?: string;
}

export interface SyncQueueState {
  pending: boolean;
  snapshot: string | null;
  queuedAt: string | null;
  attempts: number;
  lastError: string | null;
  lastAttemptAt: string | null;
  reason: string | null;
}

export interface ReminderEvent {
  id: string;
  user_id: string;
  project_id: string;
  title: string;
  body: string;
  channel: ReminderChannel;
  status: 'pending' | 'seen' | 'dismissed';
  scheduled_for: string;
  due_at: string;
  seen_at: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BackupManifest {
  format: 'phenomena-backup-v2';
  name: string;
  exportedAt: string;
  summary: {
    projects: number;
    sessions: number;
    attachments: number;
  };
  state: AppState;
}

export interface BackupPreview {
  name: string;
  exportedAt: string | null;
  summary: {
    projects: number;
    sessions: number;
    attachments: number;
  };
  state: AppState;
  format: string;
}

export interface ProjectRow {
  user_id: string;
  project_id: string;
  name: string | null;
  note: string | null;
  selected_goal: string | null;
  custom_goal: string | null;
  sprint_minutes: number | null;
  break_minutes: number | null;
  streak: number | null;
  last_completion_date: string | null;
  reminder_enabled: boolean | null;
  reminder_time: string | null;
  last_reminder_date: string | null;
  ritual_checks: Record<string, boolean> | null;
  soundtrack_url: string | null;
  cue_theme: CueTheme | string | null;
  archived: boolean | null;
  restart_mode: boolean | null;
  restart_checks: Record<string, boolean> | null;
  session_outcome: SessionResultado | string | null;
  updated_at?: string | null;
}

export interface SessionRow {
  user_id: string;
  client_session_id: string;
  id?: string | number;
  project_id: string;
  session_date: string | null;
  time_of_day: string | null;
  minutes: number | null;
  mood: Mood | string | null;
  energy: Energy | string | null;
  focus: Focus | string | null;
  goal: string | null;
  outcome: SessionResultado | string | null;
  note: string | null;
  restart_cue: string | null;
  used_restart_mode: boolean | null;
  created_at?: string | null;
}

export interface AttachmentRow {
  user_id: string;
  project_id: string;
  attachment_id: string;
  label: string | null;
  url: string | null;
  position: number | null;
  updated_at?: string | null;
}

export interface LegacyAppState {
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
  reminderEnabled?: boolean;
  reminderTime?: string;
  lastReminderDate?: string | null;
  date: string;
  minutes: number;
  goal: string;
  outcome?: SessionResultado;
  sessionOutcome?: SessionResultado;
}
