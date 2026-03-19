import { Project, SessionRecord, SessionResultado, ChartPoint, ChartRange, NotificationState, ComparisonMetric } from '../types';
import { outcomeOptions } from '../constants';
import { getTodayKey, getDayDiff, parseDateKey } from './date';
import { getTimeBucket } from './formatters';

export interface TrendAnnotation {
  title: string;
  detail: string;
}

export interface TrendDriver {
  title: string;
  direction: 'up' | 'down' | 'flat';
  detail: string;
  evidence: string;
}

export interface TrendModel {
  recentWindowLabel: string;
  previousWindowLabel: string;
  recentMinutes: number;
  previousMinutes: number;
  recentSessions: number;
  previousSessions: number;
  recentCompletionRate: number;
  previousCompletionRate: number;
  recentAverageGap: number | null;
  previousAverageGap: number | null;
  recentPeakTime: string;
  previousPeakTime: string;
  drivers: TrendDriver[];
}

export type SessionsByProjectId = Record<string, SessionRecord[]>;

export function groupSessionsByProject(sessions: SessionRecord[]): SessionsByProjectId {
  return sessions.reduce<SessionsByProjectId>((acc, session) => {
    const bucket = acc[session.projectId] ?? [];
    bucket.push(session);
    acc[session.projectId] = bucket;
    return acc;
  }, {});
}

export function projectGoal(project: Project): string {
  return project.customGoal.trim() || project.selectedGoal;
}

export function getStreakLabel(lastCompletionDate: string | null, streak: number): string {
  const today = getTodayKey();
  if (!lastCompletionDate) {
    return 'No streak yet. Start a quick session to get on the board.';
  }
  if (lastCompletionDate === today) {
    return `You've worked today. Streak: ${streak} day${streak === 1 ? '' : 's'}.`;
  }
  if (getDayDiff(lastCompletionDate, today) === 1) {
    return `You worked yesterday. Streak: ${streak} day${streak === 1 ? '' : 's'}.`;
  }
  return 'Streak paused. Start a short session today.';
}

export function getReminderStatus(notificationState: NotificationState, reminderEnabled: boolean): string {
  if (!reminderEnabled) {
    return 'Daily reminders disabled.';
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

export function shouldTriggerReminder(project: Project): boolean {
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

export function outcomeLabel(outcome: SessionResultado): string {
  return outcomeOptions.find((option) => option.value === outcome)?.label ?? 'Drafted Text';
}

export function getProjectSessions(projectId: string, sessions: SessionRecord[] | SessionsByProjectId): SessionRecord[] {
  return Array.isArray(sessions) ? sessions.filter((session) => session.projectId === projectId) : sessions[projectId] ?? [];
}

export function getProjectAttachmentCount(projects: Project[]): number {
  return projects.reduce((count, project) => count + project.attachments.length, 0);
}

export function getWeeklyMinutes(projectId: string, sessions: SessionRecord[] | SessionsByProjectId): number {
  return getProjectSessions(projectId, sessions)
    .filter((session) => Date.now() - parseDateKey(session.date).getTime() <= 6 * 86400000)
    .reduce((total, session) => total + session.minutes, 0);
}

export function groupCount<T extends string>(items: T[]): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] ?? 0) + 1;
    return acc;
  }, {});
}

function getDayOffset(date: string): number {
  const today = parseDateKey(getTodayKey()).getTime();
  const sessionDate = parseDateKey(date).getTime();
  return Math.floor((today - sessionDate) / 86400000);
}

function getAverageGapDays(sessions: SessionRecord[]): number | null {
  if (sessions.length < 2) {
    return null;
  }

  const ordered = sessions
    .slice()
    .sort((a, b) => parseDateKey(a.date).getTime() - parseDateKey(b.date).getTime());

  const gaps = ordered.slice(1).map((session, index) => getDayDiff(ordered[index].date, session.date));
  return Math.round(gaps.reduce((total, gap) => total + gap, 0) / gaps.length);
}

function getWindowSessions(sessions: SessionRecord[], startOffset: number, endOffset: number) {
  return sessions.filter((session) => {
    const offset = getDayOffset(session.date);
    return offset >= startOffset && offset <= endOffset;
  });
}

function summarizeWindowTrend(
  recentSessions: SessionRecord[],
  previousSessions: SessionRecord[],
  project: Project,
): TrendDriver[] {
  const recentMinutes = recentSessions.reduce((total, session) => total + session.minutes, 0);
  const previousMinutes = previousSessions.reduce((total, session) => total + session.minutes, 0);
  const recentCompletionRate = recentSessions.length
    ? Math.round((recentSessions.filter((session) => session.minutes >= project.sprintMinutes).length / recentSessions.length) * 100)
    : 0;
  const previousCompletionRate = previousSessions.length
    ? Math.round((previousSessions.filter((session) => session.minutes >= project.sprintMinutes).length / previousSessions.length) * 100)
    : 0;

  const recentTimeCounts = groupCount(recentSessions.map((session) => getTimeBucket(session.timeOfDay)));
  const previousTimeCounts = groupCount(previousSessions.map((session) => getTimeBucket(session.timeOfDay)));
  const recentPeakTime = topKey(recentTimeCounts, 'Noite');
  const previousPeakTime = topKey(previousTimeCounts, 'Noite');

  const recentGap = getAverageGapDays(recentSessions);
  const previousGap = getAverageGapDays(previousSessions);
  const minuteDelta = recentMinutes - previousMinutes;
  const sessionDelta = recentSessions.length - previousSessions.length;
  const completionDelta = recentCompletionRate - previousCompletionRate;

  const momentumDirection: TrendDriver['direction'] =
    minuteDelta > 0 || sessionDelta > 0 || completionDelta > 0 ? 'up' : minuteDelta < 0 || sessionDelta < 0 || completionDelta < 0 ? 'down' : 'flat';

  const momentumDetail = minuteDelta === 0 && sessionDelta === 0
    ? 'Your recent rhythm is steady.'
    : minuteDelta > 0 && sessionDelta > 0
      ? `You are showing up more often and spending more time at the desk.`
      : minuteDelta > 0
        ? 'Recent gains come mostly from longer sessions, not more sessions.'
        : sessionDelta > 0
          ? 'You are showing up more often, even though total minutes dipped a little.'
          : 'Recent output has softened compared with the previous window.';

  const timingDirection: TrendDriver['direction'] =
    recentPeakTime === previousPeakTime ? 'flat' : 'up';
  const timingDetail = recentPeakTime === previousPeakTime
    ? `The strongest time block stayed anchored at ${recentPeakTime}, which suggests consistency is doing the work.`
    : `The strongest time block moved from ${previousPeakTime} to ${recentPeakTime}, so recent progress is likely coming from a shifted daily rhythm.`;

  const cadenceDirection: TrendDriver['direction'] = recentGap === null || previousGap === null
    ? 'flat'
    : recentGap > previousGap
      ? 'down'
      : recentGap < previousGap
        ? 'up'
        : 'flat';
  const cadenceDetail = recentGap === null || previousGap === null
    ? 'There are not enough sessions to compare cadence yet.'
    : recentGap < previousGap
        ? `Your spacing tightened from about ${previousGap} day${previousGap === 1 ? '' : 's'} between sessions to ${recentGap} day${recentGap === 1 ? '' : 's'}.`
        : recentGap > previousGap
          ? `Session spacing widened from about ${previousGap} day${previousGap === 1 ? '' : 's'} to ${recentGap} day${recentGap === 1 ? '' : 's'}.`
        : `Session spacing stayed steady at about ${recentGap} day${recentGap === 1 ? '' : 's'} between sessions.`;

  const qualityDirection: TrendDriver['direction'] =
    completionDelta > 0 ? 'up' : completionDelta < 0 ? 'down' : 'flat';
  const qualityDetail = completionDelta === 0
    ? 'The share of on-plan sessions held steady.'
    : completionDelta > 0
      ? `Follow-through improved by ${Math.abs(completionDelta)} points, so the trend is not just about more time, but cleaner sessions.`
      : `Follow-through slipped by ${Math.abs(completionDelta)} points, which suggests sessions are getting looser even if the desk time is there.`;

  return [
    {
      title: 'Momentum',
      direction: momentumDirection,
      detail: momentumDetail,
      evidence: `${recentSessions.length} recent session${recentSessions.length === 1 ? '' : 's'} vs ${previousSessions.length} in the prior window, ${recentMinutes} recent minutes vs ${previousMinutes}.`,
    },
    {
      title: 'Cadence',
      direction: cadenceDirection,
      detail: cadenceDetail,
      evidence: recentGap === null || previousGap === null
        ? 'Cadence comparison needs at least two sessions in each window.'
        : `Average gap: ${previousGap} day${previousGap === 1 ? '' : 's'} before, ${recentGap} day${recentGap === 1 ? '' : 's'} now.`,
    },
    {
      title: 'Timing',
      direction: timingDirection,
      detail: timingDetail,
      evidence: `Strongest window shifted from ${previousPeakTime} to ${recentPeakTime}.`,
    },
    {
      title: 'Follow-through',
      direction: qualityDirection,
      detail: qualityDetail,
      evidence: `Completion rate changed from ${previousCompletionRate}% to ${recentCompletionRate}% in the latest window.`,
    },
  ];
}

export function topKey(counts: Record<string, number>, fallback: string): string {
  const entries = Object.entries(counts);
  if (!entries.length) {
    return fallback;
  }
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

export function getProjectAnalytics(project: Project, sessions: SessionRecord[] | SessionsByProjectId) {
  const projectSessions = getProjectSessions(project.id, sessions);
  const recentSessions = getWindowSessions(projectSessions, 0, 6);
  const previousSessions = getWindowSessions(projectSessions, 7, 13);
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
  const completionRate = projectSessions.length
    ? Math.round((projectSessions.filter((session) => session.minutes >= project.sprintMinutes).length / projectSessions.length) * 100)
    : 0;
  const recoveryWindows = restartSessions
    .map((session) => {
      const later = projectSessions
        .filter((candidate) => parseDateKey(candidate.date).getTime() > parseDateKey(session.date).getTime())
        .sort((a, b) => parseDateKey(a.date).getTime() - parseDateKey(b.date).getTime())[0];
      return later ? getDayDiff(session.date, later.date) : null;
    })
    .filter((value): value is number => value !== null);
  const bestRecoveryWindow = recoveryWindows.length ? `${Math.min(...recoveryWindows)} day${Math.min(...recoveryWindows) === 1 ? '' : 's'}` : 'No recovery window yet';
  const worstRecoveryWindow = recoveryWindows.length ? `${Math.max(...recoveryWindows)} day${Math.max(...recoveryWindows) === 1 ? '' : 's'}` : 'No recovery window yet';
  const trendAnnotations: TrendAnnotation[] = [
    {
      title: 'Best time',
      detail: `${bestTime} is the strongest session window.`,
    },
    {
      title: 'Follow-through',
      detail: `${completionRate}% of sessions reached the planned sprint length.`,
    },
    {
      title: 'Recovery',
      detail: restartSessions.length
        ? `Restart mode sessions usually recover in ${bestRecoveryWindow}.`
        : 'Run a restart-mode session to start tracking recovery windows.',
    },
  ];
  const trendDrivers = summarizeWindowTrend(recentSessions, previousSessions, project);

  return {
    bestTime,
    bestMood,
    bestOutcome,
    averageSprint,
    totalMinutes,
    restartSessions: restartSessions.length,
    restartRecoveryRate,
    completionRate,
    bestRecoveryWindow,
    worstRecoveryWindow,
    streakStability: longestGap === 0 ? 'Stable' : longestGap <= 2 ? 'Shaky' : 'Fragile',
    dominantMoodPattern,
    noteSeed,
    totalSessions: projectSessions.length,
    trendAnnotations,
    trendDrivers,
  };
}

export function getCrossProjectSummary(projects: Project[], sessions: SessionRecord[] | SessionsByProjectId) {
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
    topStreakProject: topStreakProject?.name ?? 'No active project yet',
    strongestTime,
  };
}

export function getRangeDays(range: ChartRange): number | null {
  if (range === '7d') return 7;
  if (range === '30d') return 30;
  if (range === '90d') return 90;
  return null;
}

export function filterSessionsByRange(sessions: SessionRecord[], range: ChartRange): SessionRecord[] {
  const days = getRangeDays(range);
  if (!days) {
    return sessions;
  }
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (days - 1));
  return sessions.filter((session) => parseDateKey(session.date).getTime() >= cutoff.getTime());
}

export function getRecentDaySeries(projectId: string, sessions: SessionRecord[] | SessionsByProjectId, range: ChartRange): ChartPoint[] {
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

export function getOutcomeSeries(projectId: string, sessions: SessionRecord[] | SessionsByProjectId, range: ChartRange) {
  const counts = groupCount(filterSessionsByRange(getProjectSessions(projectId, sessions), range).map((session) => session.outcome));
  return outcomeOptions.map((option) => ({
    label: option.label,
    value: counts[option.value] ?? 0,
  }));
}

export function getMoodSeries(projectId: string, sessions: SessionRecord[] | SessionsByProjectId, range: ChartRange): ChartPoint[] {
  const moodMinutos = filterSessionsByRange(getProjectSessions(projectId, sessions), range).reduce<Record<string, number>>((acc, session) => {
    acc[session.mood] = (acc[session.mood] ?? 0) + session.minutes;
    return acc;
  }, {});

  return ['foggy', 'steady', 'restless', 'anxious'].map((mood) => ({
    label: mood,
    value: moodMinutos[mood] ?? 0,
  }));
}

export function getProjectComparisonSeries(projects: Project[], sessions: SessionRecord[] | SessionsByProjectId, metric: ComparisonMetric, range: ChartRange): ChartPoint[] {
  return projects
    .filter((project) => !project.archived)
    .map((project) => {
      const projectSessions = filterSessionsByRange(getProjectSessions(project.id, sessions), range);
      const analytics = getProjectAnalytics(project, sessions);
      const rangeMinutes = projectSessions.reduce((total, session) => total + session.minutes, 0);
      const rangeSessions = projectSessions.length;
      const weeklyMinutes = getWeeklyMinutes(project.id, sessions);
      const value =
        metric === 'minutes'
          ? rangeMinutes
          : metric === 'weekly'
            ? weeklyMinutes
            : metric === 'sessions'
              ? rangeSessions
              : project.streak;
      const note =
        metric === 'streak'
          ? `${project.streak} continuous days • recovery window ${analytics.bestRecoveryWindow}`
          : metric === 'sessions'
            ? `${rangeSessions} sessions • ${analytics.completionRate}% on-plan`
            : metric === 'weekly'
              ? `${weeklyMinutes} min this week • strongest at ${analytics.bestTime}`
              : `${rangeMinutes} min in range • ${analytics.completionRate}% on-plan`;

      return {
        label: project.name,
        value,
        note,
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

export function getCoachingInsight(project: Project, state: { sessions: SessionRecord[], mood: string, focus: string, energy: string }) {
  const sessions = getProjectSessions(project.id, state.sessions);
  const weeklyMinutos = getWeeklyMinutes(project.id, state.sessions);
  const sameFocus = sessions.filter((session) => session.focus === state.focus);
  const sameEnergy = sessions.filter((session) => session.energy === state.energy);
  const analytics = getProjectAnalytics(project, state.sessions);
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
      ? `Low-energy days usually lead to ${outcomeLabel(dominantResultado)}. Keep the target small today.`
      : 'Set a very small goal. Edit a single sentence if needed.';
  } else if (state.focus === 'scattered') {
    message = sameEnergy.length >= 2 && dominantResultado
      ? `When focus is low, you often land on ${outcomeLabel(dominantResultado)}. Start with the easiest task.`
      : 'Try a 15-minute sprint and leave a clear starting point for next time.';
  } else if (state.mood === 'anxious') {
    message = sameFocus.length >= 2
      ? `Anxious days on this project work better with low-pressure tasks. Your history leans toward ${outcomeLabel(dominantResultado)} sessions.`
      : 'Focus on a light task: clean a paragraph or list three ideas.';
  } else if (project.streak >= 4 && weeklyMinutos >= 60) {
    message = `Your pacing is strong in ${project.name}. With ${weeklyMinutos} minutes this week, a ${bestSprint}-minute sprint should fit.`;
  } else {
    message = `Tackle one small piece of the project. Start the timer.`;
  }

  const evidence = sessions.length
    ? `Based on ${sessions.length} recorded session${sessions.length === 1 ? '' : 's'} on this project, your strongest mood is ${analytics.bestMood}, your most common outcome is ${outcomeLabel(dominantResultado)}, your best time is ${analytics.bestTime}, and ${analytics.restartRecoveryRate}% of restart sessions recovered within two days.`
    : 'No deep history on this project yet. Insights will improve as you log more sessions.';

  return { message, evidence };
}

export function getRecoveryMessage(project: Project): string {
  const today = getTodayKey();
  if (!project.lastCompletionDate || project.lastCompletionDate === today) {
    return 'No recovery needed. Keep the next session simple.';
  }
  const diff = getDayDiff(project.lastCompletionDate, today);
  if (diff === 1) {
    return 'You missed one day. Keep the target small.';
  }
  return `You haven't worked on ${project.name} for ${diff} days. Return to it and log a small win.`;
}

export function getRestartState(project: Project): { needed: boolean; daysAway: number } {
  const today = getTodayKey();
  if (!project.lastCompletionDate || project.lastCompletionDate === today) {
    return { needed: false, daysAway: 0 };
  }
  const daysAway = getDayDiff(project.lastCompletionDate, today);
  return { needed: daysAway > 1, daysAway };
}
