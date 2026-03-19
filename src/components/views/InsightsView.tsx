import React, { memo, useMemo, useState, useEffect } from 'react';
import { DashboardBanner } from '../common/DashboardBanner';
import { ProjectAnatomyPanel } from '../common/ProjectAnatomyPanel';
import { HistoryPanel } from '../common/HistoryPanel';
import { SessionEditorModal } from '../common/SessionEditorModal';
import { ToastNotification } from '../common/ToastNotification';
import { SessionDeleteModal } from '../common/SessionDeleteModal';
import { outcomeOptions } from '../../constants';
import { createSessionDraft } from '../../utils/session';
import type { SessionsByProjectId } from '../../utils/analytics';
import {
  getCrossProjectSummary,
  getProjectAnalytics,
  getRecentDaySeries,
  getOutcomeSeries,
  getMoodSeries,
  getProjectComparisonSeries,
  outcomeLabel,
} from '../../utils/analytics';
import type { AppState, ChartPoint, ChartRange, ComparisonMetric, HistoryOutcomeFilter, HistoryProjectFilter, Project, SessionRecord } from '../../types';

interface InsightsViewProps {
  state: AppState;
  sessionsByProject: SessionsByProjectId;
  activeProject: Project | undefined;
  historySessions: SessionRecord[];
  historyQuery: string;
  setHistoryQuery: React.Dispatch<React.SetStateAction<string>>;
  historyProjectFilter: HistoryProjectFilter;
  setHistoryProjectFilter: React.Dispatch<React.SetStateAction<HistoryProjectFilter>>;
  historyOutcomeFilter: HistoryOutcomeFilter;
  setHistoryOutcomeFilter: React.Dispatch<React.SetStateAction<HistoryOutcomeFilter>>;
  chartRange: ChartRange;
  setChartRange: React.Dispatch<React.SetStateAction<ChartRange>>;
  comparisonMetric: ComparisonMetric;
  setComparisonMetric: React.Dispatch<React.SetStateAction<ComparisonMetric>>;
  activeChartPoint: ChartPoint | null;
  setActiveChartPoint: React.Dispatch<React.SetStateAction<ChartPoint | null>>;
  projectNameMap: Record<string, string>;
  addSession: (session: SessionRecord) => void;
  updateSession: (sessionId: string, updates: Partial<SessionRecord>) => void;
  deleteSession: (sessionId: string) => void;
  restoreSession: () => void;
  toast: { message: string; visible: boolean; type?: 'info' | 'success' } | null;
  setToast: React.Dispatch<React.SetStateAction<{ message: string; visible: boolean; type?: 'info' | 'success' } | null>>;
}

function InsightsViewComponent({
  state, sessionsByProject, activeProject, historySessions, historyQuery, setHistoryQuery,
  historyProjectFilter, setHistoryProjectFilter, historyOutcomeFilter, setHistoryOutcomeFilter,
  chartRange, setChartRange, comparisonMetric, setComparisonMetric,
  activeChartPoint, setActiveChartPoint, projectNameMap,
  addSession, updateSession, deleteSession, restoreSession, toast, setToast
}: InsightsViewProps) {
  const safeActiveProject = activeProject ?? state.projects[0];
  const activeProjectSessions = useMemo(() => {
    if (!safeActiveProject) return [];
    return sessionsByProject[safeActiveProject.id] ?? [];
  }, [safeActiveProject, sessionsByProject]);
  const [editingSession, setEditingSession] = useState<SessionRecord | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isAddingSession, setIsAddingSession] = useState(false);

  const dashboard = useMemo(() => getCrossProjectSummary(state.projects, sessionsByProject), [sessionsByProject, state.projects]);
  const analytics = useMemo(() => safeActiveProject ? getProjectAnalytics(safeActiveProject, activeProjectSessions) : null, [activeProjectSessions, safeActiveProject]);
  
  const recentDaySeries = useMemo(() => safeActiveProject ? getRecentDaySeries(safeActiveProject.id, activeProjectSessions, chartRange) : [], [activeProjectSessions, chartRange, safeActiveProject]);
  const outcomeSeries = useMemo(() => safeActiveProject ? getOutcomeSeries(safeActiveProject.id, activeProjectSessions, chartRange) : [], [activeProjectSessions, chartRange, safeActiveProject]);
  const moodSeries = useMemo(() => safeActiveProject ? getMoodSeries(safeActiveProject.id, activeProjectSessions, chartRange) : [], [activeProjectSessions, chartRange, safeActiveProject]);
  const projectComparisonSeries = useMemo(() => getProjectComparisonSeries(state.projects, sessionsByProject, comparisonMetric, chartRange), [chartRange, comparisonMetric, sessionsByProject, state.projects]);
  const hasFirstRun = state.sessions.length === 0;

  useEffect(() => {
    if (editingSession || sessionToDelete || isAddingSession) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditingSession(null);
        setSessionToDelete(null);
        setIsAddingSession(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [editingSession, sessionToDelete, isAddingSession]);

  return (
    <section className="page-container workspace-insights">
      {hasFirstRun ? (
        <section
          className="card panel"
          style={{ marginBottom: '24px', border: '1px solid var(--panel-border)', background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(167,224,104,0.08))' }}
          aria-label="Insights onboarding"
        >
          <div className="panel-head" style={{ marginBottom: '12px' }}>
            <div>
              <p className="eyebrow" style={{ color: 'var(--accent)' }}>Insights starter</p>
              <h2 style={{ margin: 0 }}>Nothing to chart yet</h2>
            </div>
          </div>
          <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.6 }}>
            Run your first session from Today. After that, this view will show trends, outcomes, and project comparisons automatically.
          </p>
        </section>
      ) : null}

      <DashboardBanner {...{
        dashboard, chartRange, setChartRange, comparisonMetric, setComparisonMetric,
        projectComparisonSeries, activeChartPoint, setActiveChartPoint, recentDaySeries
      }} />

      <div className="two-column-layout">
        <ProjectAnatomyPanel {...{
          activeProject: safeActiveProject, analytics, outcomeLabel, outcomeSeries,
          activeChartPoint, setActiveChartPoint, moodSeries
        }} />

        <HistoryPanel {...{
          historyQuery, setHistoryQuery, historyProjectFilter, setHistoryProjectFilter,
          activeProject, historyOutcomeFilter, setHistoryOutcomeFilter, outcomeOptions,
          filteredHistory: historySessions, projectNameMap, outcomeLabel,
          onEditSession: (session: SessionRecord) => setEditingSession(session),
          onDeleteSession: (id: string) => setSessionToDelete(id),
          onAddSession: () => setIsAddingSession(true)
        }} />
      </div>

      <SessionEditorModal
        open={isAddingSession || Boolean(editingSession)}
        mode={editingSession ? 'edit' : 'create'}
        session={editingSession || (isAddingSession ? createSessionDraft(activeProject?.id || state.projects[0]?.id || '') : null)}
        projects={state.projects}
        onSubmit={(session) => {
          if (editingSession) {
            updateSession(editingSession.id, session);
            setEditingSession(null);
          } else {
            addSession(session);
            setIsAddingSession(false);
          }
        }}
        onClose={() => {
          setEditingSession(null);
          setIsAddingSession(false);
        }}
      />

      <SessionDeleteModal
        open={Boolean(sessionToDelete)}
        titleId="insights-delete-session-title"
        onConfirm={() => {
          if (sessionToDelete) {
            deleteSession(sessionToDelete);
            setSessionToDelete(null);
          }
        }}
        onCancel={() => setSessionToDelete(null)}
      />

      {toast?.visible ? (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onUndo={toast.message === 'Session deleted' ? restoreSession : undefined}
          onClose={() => setToast({ ...toast, visible: false })}
          style={{ bottom: '24px', left: '50%', transform: 'translateX(-50%)' }}
        />
      ) : null}
    </section>
  );
}

export const InsightsView = memo(InsightsViewComponent);
