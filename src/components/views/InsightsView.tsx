import React, { memo, useMemo } from 'react';
import { DashboardBanner } from '../common/DashboardBanner';
import { ProjectAnatomyPanel } from '../common/ProjectAnatomyPanel';
import { HistoryPanel } from '../common/HistoryPanel';
import { outcomeOptions } from '../../constants';

function InsightsViewComponent({
  state, activeProject, historySessions, historyQuery, setHistoryQuery,
  historyProjectFilter, setHistoryProjectFilter, historyOutcomeFilter, setHistoryOutcomeFilter,
  chartRange, setChartRange, comparisonMetric, setComparisonMetric,
  activeChartPoint, setActiveChartPoint, getCrossProjectSummary,
  getProjectAnalytics, getRecentDaySeries, getOutcomeSeries, getMoodSeries,
  getProjectComparisonSeries, outcomeLabel, projectNameMap
}: any) {
  const dashboard = useMemo(() => getCrossProjectSummary(state.projects, state.sessions), [state.projects, state.sessions, getCrossProjectSummary]);
  const analytics = useMemo(() => activeProject ? getProjectAnalytics(activeProject, state.sessions) : null, [activeProject, state.sessions, getProjectAnalytics]);
  
  const recentDaySeries = useMemo(() => activeProject ? getRecentDaySeries(activeProject.id, state.sessions, chartRange) : [], [activeProject, state.sessions, chartRange, getRecentDaySeries]);
  const outcomeSeries = useMemo(() => activeProject ? getOutcomeSeries(activeProject.id, state.sessions, chartRange) : [], [activeProject, state.sessions, chartRange, getOutcomeSeries]);
  const moodSeries = useMemo(() => activeProject ? getMoodSeries(activeProject.id, state.sessions, chartRange) : [], [activeProject, state.sessions, chartRange, getMoodSeries]);
  const projectComparisonSeries = useMemo(() => getProjectComparisonSeries(state.projects, state.sessions, comparisonMetric, chartRange), [state.projects, state.sessions, comparisonMetric, chartRange, getProjectComparisonSeries]);

  return (
    <section className="page-container workspace-insights">
      <DashboardBanner {...{
        dashboard, chartRange, setChartRange, comparisonMetric, setComparisonMetric,
        projectComparisonSeries, activeChartPoint, setActiveChartPoint, recentDaySeries
      }} />

      <div className="two-column-layout">
        <ProjectAnatomyPanel {...{
          activeProject, analytics, outcomeLabel, outcomeSeries,
          activeChartPoint, setActiveChartPoint, moodSeries
        }} />

        <HistoryPanel {...{
          historyQuery, setHistoryQuery, historyProjectFilter, setHistoryProjectFilter,
          activeProject, historyOutcomeFilter, setHistoryOutcomeFilter, outcomeOptions,
          filteredHistory: historySessions, projectNameMap, outcomeLabel
        }} />
      </div>
    </section>
  );
}

export const InsightsView = memo(InsightsViewComponent);
