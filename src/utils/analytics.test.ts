import { describe, expect, it } from 'vitest';
import { getProjectAnalytics, getProjectComparisonSeries } from './analytics';
import type { Project, SessionRecord } from '../types';

const project: Project = {
  id: 'project-1',
  name: 'Novel',
  note: '',
  attachments: [],
  selectedGoal: 'Draft 300 words',
  customGoal: '',
  sprintMinutes: 20,
  breakMinutes: 5,
  streak: 4,
  lastCompletionDate: '2026-03-18',
  reminderEnabled: true,
  reminderTime: '18:00',
  lastReminderDate: null,
  ritualChecks: {},
  soundtrackUrl: '',
  cueTheme: 'embers',
  archived: false,
  restartMode: false,
  restartChecks: {},
  sessionOutcome: 'drafted',
};

const sessions: SessionRecord[] = [
  {
    id: 's1',
    date: '2026-03-17',
    timeOfDay: '09:00',
    minutes: 18,
    mood: 'steady',
    energy: 'medium',
    focus: 'usable',
    goal: 'Draft',
    outcome: 'drafted',
    projectId: 'project-1',
    note: '',
    restartCue: '',
    usedRestartMode: true,
  },
  {
    id: 's2',
    date: '2026-03-18',
    timeOfDay: '20:00',
    minutes: 24,
    mood: 'steady',
    energy: 'high',
    focus: 'sharp',
    goal: 'Revise',
    outcome: 'revised',
    projectId: 'project-1',
    note: '',
    restartCue: '',
    usedRestartMode: false,
  },
];

describe('analytics helpers', () => {
  it('surfaces completion and recovery signals for a project', () => {
    const analytics = getProjectAnalytics(project, sessions);

    expect(analytics.completionRate).toBe(50);
    expect(analytics.bestRecoveryWindow).toBe('1 day');
    expect(analytics.trendAnnotations.length).toBeGreaterThan(0);
  });

  it('adds explanatory notes to comparison series', () => {
    const series = getProjectComparisonSeries([project], sessions, 'sessions', '30d');

    expect(series[0].note).toContain('on-plan');
    expect(series[0].label).toBe('Novel');
  });
});
