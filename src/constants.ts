import { RitualStep, SessionResultado, Profile, ReminderChannel } from './types';

export const STORAGE_KEY = 'phenomena-writing-rhythm';
export const THEME_STORAGE_KEY = 'phenomena-ui-theme';
export const DEFAULT_PROJECT_ID = 'project-main';

export const ambientPresets = [
  { label: 'Brown Noise', url: 'https://www.youtube.com/results?search_query=brown+noise' },
  { label: 'Rain at Night', url: 'https://www.youtube.com/results?search_query=rain+at+night+ambience' },
  { label: 'Dark Ambient', url: 'https://www.youtube.com/results?search_query=dark+ambient+writing+music' },
];

export const ritualSteps: RitualStep[] = [
  { id: 'water', label: 'Prepare Your Environment', detail: 'Get water, stretch, take a breath.' },
  { id: 'draft', label: 'Clear Distractions', detail: 'Close unnecessary tabs and mute notifications.' },
  { id: 'sound', label: 'Set Ambient Audio', detail: 'Start your chosen ambient sound or background noise.' },
  { id: 'promise', label: 'Commit to a Goal', detail: 'Commit to one small, achievable step for this session.' },
];

export const goalLibrary = [
  'Write 50 words',
  'Finish one paragraph',
  'Draft a strong opening',
  'Edit one page',
  'Work on a difficult scene',
  'Plan tomorrow\'s task',
];

export const outcomeOptions: Array<{ value: SessionResultado; label: string; detail: string }> = [
  { value: 'drafted', label: 'Drafted Text', detail: 'Wrote new words and pushed the draft forward.' },
  { value: 'revised', label: 'Revised Text', detail: 'Edited and refined existing prose.' },
  { value: 'outlined', label: 'Outlined Ideas', detail: 'Planned the structure of future scenes.' },
  { value: 'showed-up', label: 'Showed Up', detail: 'Was present at the desk but didn\'t write much.' },
];

export const restartSteps = [
  'Shift perspective: This is a restart, not a failure.',
  'Shrink the task until it feels easy.',
  'Leave a sentence unfinished for tomorrow.',
] as const;

export function restartCheckDefaults() {
  return Object.fromEntries(restartSteps.map((step) => [step, false])) as Record<string, boolean>;
}

export function ritualCheckDefaults() {
  return Object.fromEntries(ritualSteps.map((step) => [step.id, false]));
}

export function createProfile(userId: string, timezone: string): Profile {
  return {
    user_id: userId,
    display_name: null,
    timezone,
    active_project_id: DEFAULT_PROJECT_ID,
    default_sprint_minutes: 15,
    default_break_minutes: 3,
    reminder_channel: 'browser' as ReminderChannel,
    email_reminders_enabled: false,
    email_reminder_time: '18:00',
  };
}
