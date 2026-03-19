import type { SessionRecord } from '../types';
import { getTodayKey, getTimeKey } from './date';
import { normalizeSession } from './validation';

export function createSessionDraft(projectId: string, overrides: Partial<SessionRecord> = {}): SessionRecord {
  return normalizeSession(
    {
      projectId,
      date: getTodayKey(),
      timeOfDay: getTimeKey(),
      minutes: 30,
      goal: '',
      outcome: 'drafted',
      mood: 'steady',
      energy: 'medium',
      focus: 'usable',
      note: '',
      restartCue: '',
      usedRestartMode: false,
      ...overrides,
    },
    projectId,
  );
}
