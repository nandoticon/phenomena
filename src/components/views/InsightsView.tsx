import React, { memo, useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DashboardBanner } from '../common/DashboardBanner';
import { ProjectAnatomyPanel } from '../common/ProjectAnatomyPanel';
import { HistoryPanel } from '../common/HistoryPanel';
import { outcomeOptions } from '../../constants';
import { getTodayKey, getTimeKey } from '../../utils/date';

function InsightsViewComponent({
  state, activeProject, historySessions, historyQuery, setHistoryQuery,
  historyProjectFilter, setHistoryProjectFilter, historyOutcomeFilter, setHistoryOutcomeFilter,
  chartRange, setChartRange, comparisonMetric, setComparisonMetric,
  activeChartPoint, setActiveChartPoint, getCrossProjectSummary,
  getProjectAnalytics, getRecentDaySeries, getOutcomeSeries, getMoodSeries,
  getProjectComparisonSeries, outcomeLabel, projectNameMap,
  addSession, updateSession, deleteSession, restoreSession, toast, setToast
}: any) {
  const [editingSession, setEditingSession] = useState<any>(null);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [newSession, setNewSession] = useState<any>({
    projectId: activeProject?.id || state.projects[0]?.id,
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
    usedRestartMode: false
  });

  const dashboard = useMemo(() => getCrossProjectSummary(state.projects, state.sessions), [state.projects, state.sessions, getCrossProjectSummary]);
  const analytics = useMemo(() => activeProject ? getProjectAnalytics(activeProject, state.sessions) : null, [activeProject, state.sessions, getProjectAnalytics]);
  
  const recentDaySeries = useMemo(() => activeProject ? getRecentDaySeries(activeProject.id, state.sessions, chartRange) : [], [activeProject, state.sessions, chartRange, getRecentDaySeries]);
  const outcomeSeries = useMemo(() => activeProject ? getOutcomeSeries(activeProject.id, state.sessions, chartRange) : [], [activeProject, state.sessions, chartRange, getOutcomeSeries]);
  const moodSeries = useMemo(() => activeProject ? getMoodSeries(activeProject.id, state.sessions, chartRange) : [], [activeProject, state.sessions, chartRange, getMoodSeries]);
  const projectComparisonSeries = useMemo(() => getProjectComparisonSeries(state.projects, state.sessions, comparisonMetric, chartRange), [state.projects, state.sessions, comparisonMetric, chartRange, getProjectComparisonSeries]);

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

  const handleManualAddSession = () => {
    if (!newSession.projectId || !newSession.goal) return;
    addSession({
      ...newSession,
      id: crypto.randomUUID()
    });
    setIsAddingSession(false);
  };

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
          filteredHistory: historySessions, projectNameMap, outcomeLabel,
          onEditSession: (session: any) => setEditingSession(session),
          onDeleteSession: (id: string) => setSessionToDelete(id),
          onAddSession: () => setIsAddingSession(true)
        }} />
      </div>

      {/* Manual Add Session Modal */}
      {isAddingSession && createPortal(
        <div className="modal-overlay" onClick={() => setIsAddingSession(false)}>
          <div className="modal-content card" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="panel-head">
              <h3>Add Manual Session</h3>
              <button className="ghost" onClick={() => setIsAddingSession(false)}>✕</button>
            </div>

            <div className="modal-scroll-area" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
              <label className="input-block">
                <span>Select Project</span>
                <select 
                  value={newSession.projectId}
                  onMouseDown={e => e.stopPropagation()}
                  onChange={e => setNewSession({ ...newSession, projectId: e.target.value })}
                  style={{ background: 'var(--input-bg)' }}
                >
                  <option value="">Select a project...</option>
                  {state.projects.filter((p: any) => !p.archived).map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
                <label className="input-block">
                  <span>Date</span>
                  <input
                    type="date"
                    value={newSession.date}
                    onChange={e => setNewSession({ ...newSession, date: e.target.value })}
                  />
                </label>
                <label className="input-block">
                  <span>Time</span>
                  <input
                    type="time"
                    value={newSession.timeOfDay}
                    onChange={e => setNewSession({ ...newSession, timeOfDay: e.target.value })}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
                <label className="input-block">
                  <span>Duration (Minutes)</span>
                  <input
                    type="number"
                    value={newSession.minutes}
                    onChange={e => setNewSession({ ...newSession, minutes: Number(e.target.value) })}
                  />
                </label>
                <label className="input-block">
                  <span>Outcome</span>
                  <select 
                    value={newSession.outcome}
                    onChange={e => setNewSession({ ...newSession, outcome: e.target.value })}
                    style={{ background: 'var(--input-bg)' }}
                  >
                    {outcomeOptions.map((opt: any) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="input-block" style={{ marginTop: '12px' }}>
                <span>Goal / Focus</span>
                <input
                  type="text"
                  placeholder="What was the goal?"
                  value={newSession.goal}
                  onChange={e => setNewSession({ ...newSession, goal: e.target.value })}
                />
              </label>

              <label className="input-block" style={{ marginTop: '12px' }}>
                <span>Notes & Cues</span>
                <textarea
                  placeholder="Notes from this session..."
                  style={{ width: '100%', minHeight: '80px', background: 'var(--input-bg)', border: '1px solid var(--panel-border)', borderRadius: '14px', padding: '12px', color: 'var(--text)' }}
                  value={newSession.note}
                  onChange={e => setNewSession({ ...newSession, note: e.target.value })}
                />
              </label>
            </div>

            <div className="button-row-modal" style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <button 
                className="primary" 
                onClick={handleManualAddSession} 
                disabled={!newSession.projectId || !newSession.goal}
                style={{ flex: 1 }}
              >
                Add Session
              </button>
              <button className="ghost" onClick={() => setIsAddingSession(false)} style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Session Modal */}
      {editingSession && createPortal(
        <div className="modal-overlay" onClick={() => setEditingSession(null)}>
          <div className="modal-content card" onClick={e => e.stopPropagation()}>
            <div className="panel-head">
              <h3>Edit Session</h3>
              <button className="ghost" onClick={() => setEditingSession(null)}>✕</button>
            </div>

            <div className="modal-scroll-area" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
              <label className="input-block">
                <span>Goal / Focus</span>
                <input
                  type="text"
                  value={editingSession.goal}
                  onChange={e => setEditingSession({ ...editingSession, goal: e.target.value })}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
                <label className="input-block">
                  <span>Minutes</span>
                  <input
                    type="number"
                    value={editingSession.minutes}
                    onChange={e => setEditingSession({ ...editingSession, minutes: Number(e.target.value) })}
                  />
                </label>
                <label className="input-block">
                  <span>Outcome</span>
                  <select 
                    value={editingSession.outcome}
                    onChange={e => setEditingSession({ ...editingSession, outcome: e.target.value })}
                    style={{ background: 'var(--input-bg)' }}
                  >
                    {outcomeOptions.map((opt: any) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="input-block" style={{ marginTop: '12px' }}>
                <span>Notes & Cues</span>
                <textarea
                  style={{ width: '100%', minHeight: '100px', background: 'var(--input-bg)', border: '1px solid var(--panel-border)', borderRadius: '14px', padding: '12px', color: 'var(--text)' }}
                  value={editingSession.note}
                  onChange={e => setEditingSession({ ...editingSession, note: e.target.value })}
                />
              </label>
            </div>

            <div className="button-row-modal" style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <button className="primary" onClick={() => {
                updateSession(editingSession.id, editingSession);
                setEditingSession(null);
              }} style={{ flex: 1 }}>Save Changes</button>
              <button className="ghost" onClick={() => setEditingSession(null)} style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {sessionToDelete && createPortal(
        <div className="modal-overlay" onClick={() => setSessionToDelete(null)}>
          <div className="modal-content card" style={{ maxWidth: '400px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div className="panel-head" style={{ justifyContent: 'center' }}>
              <h3 style={{ margin: 0 }}>Delete Session?</h3>
            </div>
            <p style={{ color: 'var(--muted)', margin: '16px 0 32px', lineHeight: 1.5 }}>
              This action cannot be undone. This session will be permanently removed from your history.
            </p>
            <div className="button-row-modal">
              <button
                className="primary"
                onClick={() => {
                  deleteSession(sessionToDelete);
                  setSessionToDelete(null);
                }}
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                Yes, Delete
              </button>
              <button className="ghost" onClick={() => setSessionToDelete(null)}>Cancel</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Toast Notification */}
      {toast?.visible && createPortal(
        <div className={`toast-container ${toast.type || ''}`} style={{ bottom: '24px', left: '50%', transform: 'translateX(-50%)' }}>
          <div className="toast-content" style={{ borderRadius: '16px', background: 'var(--panel-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--panel-border)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="toast-message">{toast.message}</span>
            {toast.message === 'Session deleted' && (
              <button className="toast-action" onClick={restoreSession} style={{ color: 'var(--accent)', background: 'transparent', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Undo</button>
            )}
            <button className="toast-close" onClick={() => setToast({ ...toast, visible: false })} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>✕</button>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}

export const InsightsView = memo(InsightsViewComponent);

