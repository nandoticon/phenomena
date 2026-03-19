import { describe, expect, it } from 'vitest';
import { ambientPresets } from '../constants';
import { createProject } from './storage';
import { normalizeProject, normalizeSession } from './validation';
import { getTodayKey } from './date';
import type { SessionRecord } from '../types';

describe('validation helpers', () => {
  it('clamps and sanitizes project updates at the boundary', () => {
    const base = createProject('project-1', 'Existing project', 'Keep this note');
    const next = normalizeProject({
      name: '   ',
      note: '  Updated note with spaces  ',
      sprintMinutes: 999,
      breakMinutes: 0,
      reminderTime: '99:99',
      soundtrackUrl: 'ftp://bad-link.example',
      selectedGoal: 'Not a real goal',
      customGoal: '  Focus on the first paragraph  ',
      attachments: [
        { id: 'bad-1', label: '   ', url: 'https://example.com' },
        { id: 'bad-2', label: 'Notes', url: 'javascript:alert(1)' },
        { id: 'good-1', label: 'Docs', url: 'https://example.com/docs' },
      ],
    }, base);

    expect(next.name).toBe('Existing project');
    expect(next.note).toBe('Updated note with spaces');
    expect(next.sprintMinutes).toBe(180);
    expect(next.breakMinutes).toBe(1);
    expect(next.reminderTime).toBe('18:00');
    expect(next.soundtrackUrl).toBe(ambientPresets[0].url);
    expect(next.selectedGoal).toBe(base.selectedGoal);
    expect(next.customGoal).toBe('Focus on the first paragraph');
    expect(next.attachments).toEqual([{ id: 'good-1', label: 'Docs', url: 'https://example.com/docs' }]);
  });

  it('normalizes imported sessions before they enter app state', () => {
    const baseSession = {
      id: 'session-1',
      date: '2026-03-18',
      timeOfDay: '12:00',
      minutes: 30,
      mood: 'steady' as const,
      energy: 'medium' as const,
      focus: 'usable' as const,
      goal: 'Original goal',
      outcome: 'drafted' as const,
      projectId: 'project-1',
      note: 'Original note',
      restartCue: 'Original cue',
      usedRestartMode: false,
    };

    const next = normalizeSession({
      minutes: 999,
      date: '2026-99-99',
      timeOfDay: '25:61',
      goal: '   ',
      note: '  Tighten the prose  ',
      restartCue: '  Re-enter from the first sentence  ',
      outcome: 'not-real' as unknown as SessionRecord['outcome'],
      usedRestartMode: true,
      projectId: 'project-2',
    }, 'fallback-project', baseSession);

    expect(next.minutes).toBe(480);
    expect(next.date).toBe(baseSession.date);
    expect(next.timeOfDay).toBe(baseSession.timeOfDay);
    expect(next.goal).toBe('Original goal');
    expect(next.note).toBe('Tighten the prose');
    expect(next.restartCue).toBe('Re-enter from the first sentence');
    expect(next.outcome).toBe('drafted');
    expect(next.usedRestartMode).toBe(true);
    expect(next.projectId).toBe('project-2');
  });

  it('falls back to today when no valid date is supplied', () => {
    const next = normalizeSession({ date: 'invalid-date' }, 'project-1');
    expect(next.date).toBe(getTodayKey());
  });
});
