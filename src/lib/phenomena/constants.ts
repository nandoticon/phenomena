import type { RitualStep, SessionOutcome } from './types';

export const STORAGE_KEY = 'phenomena-writing-rhythm';
export const THEME_STORAGE_KEY = 'phenomena-ui-theme';
export const DEFAULT_PROJECT_ID = 'project-main';

export const ambientPresets = [
  { label: 'Brown noise', url: 'https://www.youtube.com/results?search_query=brown+noise' },
  { label: 'Rain at night', url: 'https://www.youtube.com/results?search_query=rain+at+night+ambience' },
  { label: 'Dark ambient', url: 'https://www.youtube.com/results?search_query=dark+ambient+writing+music' },
];

export const ritualSteps: RitualStep[] = [
  { id: 'water', label: 'Ground the body', detail: 'Water, stretching, and a deep breath.' },
  { id: 'draft', label: 'Open the text', detail: 'No tabs, no inbox, just the scene.' },
  { id: 'sound', label: 'Set the trigger', detail: 'Playlist, rain, silence, anything that repeats daily.' },
  { id: 'promise', label: 'Keep it small', detail: 'Today only requires one small, achievable step.' },
];

export const goalLibrary = [
  'Write 50 words',
  'Finish a paragraph',
  'Draft an unsettling image',
  'Revise one page',
  'Name the fear in your scene',
  'Structure the next beat',
];

export const outcomeOptions: Array<{ value: SessionOutcome; label: string; detail: string }> = [
  { value: 'drafted', label: 'Drafted', detail: 'New words, messy pages, forward motion.' },
  { value: 'revised', label: 'Revised', detail: 'Trimmed, reworked, clarified.' },
  { value: 'outlined', label: 'Outlined', detail: 'Planned beats, scenes, and structure.' },
  { value: 'showed-up', label: 'Showed Up', detail: 'You opened the file and kept the ritual alive.' },
];

export const restartSteps = [
  'Rename the day: this is a return, not a failure.',
  'Reduce the task until it feels almost silly.',
  'Leave a sentence or scene note for tomorrow.',
] as const;
