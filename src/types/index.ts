export type RitualStep = {
    id: string;
    label: string;
    detail: string;
};

export type Mood = 'foggy' | 'steady' | 'restless' | 'anxious';
export type Energy = 'low' | 'medium' | 'high';
export type Focus = 'scattered' | 'usable' | 'sharp';
export type SessionResultado = 'drafted' | 'revised' | 'outlined' | 'showed-up';
export type NotificationState = NotificationPermission | 'unsupported';
export type CueTheme = 'embers' | 'mist' | 'moonlight';
export type NuvemStatus = 'local' | 'loading' | 'synced' | 'saving' | 'restoring' | 'error';
export type HistoryProjectFilter = 'active' | 'all';
export type HistoryOutcomeFilter = 'all' | SessionResultado;
export type ReminderChannel = 'browser' | 'email' | 'both';
export type AuthView = 'sign-in' | 'sign-up' | 'forgot-password' | 'recovery';
export type ChartRange = '7d' | '30d' | '90d' | 'all';
export type ComparisonMetric = 'minutes' | 'weekly' | 'sessions' | 'streak';
export type WorkspaceView = 'today' | 'projects' | 'insights' | 'account';
export type UiTheme = 'dark' | 'light';
export type ChartPoint = { label: string; value: number; note?: string };

export type ProjectAttachment = {
    id: string;
    label: string;
    url: string;
};

export type SessionRecord = {
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

export type Project = {
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

export type Profile = {
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

export type AppState = {
    activeProjectId: string;
    projects: Project[];
    sessions: SessionRecord[];
    mood: Mood;
    energy: Energy;
    focus: Focus;
};

export type LegacyAppState = {
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
