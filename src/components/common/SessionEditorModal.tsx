import { useEffect, useMemo, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import type { Project, SessionEditorValues, SessionRecord } from '../../types';
import { outcomeOptions } from '../../constants';
import { createSessionDraft } from '../../utils/session';
import { normalizeSession } from '../../utils/validation';
import { Dialog } from './Dialog';

interface SessionEditorModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  session: SessionRecord | null;
  projects: Project[];
  onSubmit: (session: SessionRecord) => void;
  onClose: () => void;
}

export function SessionEditorModal({
  open,
  mode,
  session,
  projects,
  onSubmit,
  onClose,
}: SessionEditorModalProps) {
  const fallbackProjectId = projects.find((project) => !project.archived)?.id ?? projects[0]?.id ?? '';
  const projectSelectRef = useRef<HTMLSelectElement | null>(null);
  const [draft, setDraft] = useState<SessionEditorValues>(() => {
    if (session) {
      const { id, ...rest } = session;
      return { id, ...rest };
    }
    const created = createSessionDraft(fallbackProjectId);
    const { id, ...rest } = created;
    return { id, ...rest };
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (session) {
      const { id, ...rest } = session;
      setDraft({ id, ...rest });
      return;
    }

    const created = createSessionDraft(fallbackProjectId);
    const { id, ...rest } = created;
    setDraft({ id, ...rest });
  }, [fallbackProjectId, open, session]);

  const canSubmit = useMemo(() => {
    return Boolean(draft.projectId && draft.goal.trim());
  }, [draft.goal, draft.projectId]);

  const updateDraft = (patch: Partial<SessionEditorValues>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    const normalized = normalizeSession(
      {
        ...draft,
        id: draft.id ?? crypto.randomUUID(),
      },
      draft.projectId || fallbackProjectId,
      session ?? undefined,
    );
    onSubmit(normalized);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="modal-content card"
      style={{ maxWidth: '620px' }}
      labelledBy="session-editor-title"
      initialFocusRef={projectSelectRef as unknown as MutableRefObject<HTMLElement | null>}
    >
        <div className="panel-head">
          <h3 id="session-editor-title">{mode === 'create' ? 'Manual Session Entry' : 'Edit Session'}</h3>
          <button className="ghost" onClick={onClose} type="button" aria-label="Close session editor">✕</button>
        </div>

        <div className="modal-scroll-area" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
          <label className="input-block">
            <span>Project</span>
            <select
              ref={projectSelectRef}
              value={draft.projectId}
              onChange={(event) => updateDraft({ projectId: event.target.value })}
              style={{ background: 'var(--input-bg)' }}
              aria-label="Project"
            >
              <option value="">Select a project...</option>
              {projects.filter((project) => !project.archived).map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
            <label className="input-block">
              <span>Date</span>
              <input type="date" value={draft.date} onChange={(event) => updateDraft({ date: event.target.value })} />
            </label>
            <label className="input-block">
              <span>Time</span>
              <input type="time" value={draft.timeOfDay} onChange={(event) => updateDraft({ timeOfDay: event.target.value })} />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
            <label className="input-block">
              <span>Duration (Minutes)</span>
              <input
                type="number"
                min="1"
                max="480"
                value={draft.minutes}
                onChange={(event) => updateDraft({ minutes: Number(event.target.value) })}
              />
            </label>
            <label className="input-block">
              <span>Outcome</span>
              <select
                value={draft.outcome}
                onChange={(event) => updateDraft({ outcome: event.target.value as SessionRecord['outcome'] })}
                style={{ background: 'var(--input-bg)' }}
              >
                {outcomeOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px', marginTop: '12px' }}>
            <label className="input-block">
              <span>Mood</span>
              <select value={draft.mood} onChange={(event) => updateDraft({ mood: event.target.value as SessionRecord['mood'] })}>
                <option value="foggy">Foggy</option>
                <option value="steady">Steady</option>
                <option value="restless">Restless</option>
                <option value="anxious">Anxious</option>
              </select>
            </label>
            <label className="input-block">
              <span>Energy</span>
              <select value={draft.energy} onChange={(event) => updateDraft({ energy: event.target.value as SessionRecord['energy'] })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label className="input-block">
              <span>Focus</span>
              <select value={draft.focus} onChange={(event) => updateDraft({ focus: event.target.value as SessionRecord['focus'] })}>
                <option value="scattered">Scattered</option>
                <option value="usable">Usable</option>
                <option value="sharp">Sharp</option>
              </select>
            </label>
          </div>

          <label className="input-block" style={{ marginTop: '12px' }}>
            <span>Goal / Focus</span>
            <input
              type="text"
              placeholder="What was the goal?"
              value={draft.goal}
              onChange={(event) => updateDraft({ goal: event.target.value })}
            />
          </label>

          <label className="input-block" style={{ marginTop: '12px' }}>
            <span>Notes & Cues</span>
            <textarea
              placeholder="Notes from this session..."
              style={{ width: '100%', minHeight: '100px', background: 'var(--input-bg)', border: '1px solid var(--panel-border)', borderRadius: '14px', padding: '12px', color: 'var(--text)' }}
              value={draft.note}
              onChange={(event) => updateDraft({ note: event.target.value })}
            />
          </label>

          <label className="input-block" style={{ marginTop: '12px' }}>
            <span>Restart Cue</span>
            <input
              type="text"
              value={draft.restartCue}
              onChange={(event) => updateDraft({ restartCue: event.target.value })}
              placeholder="Optional restart cue"
            />
          </label>

          <label className="toggle-row" style={{ marginTop: '12px', padding: '12px 0 0', border: 'none', background: 'transparent' }}>
            <span>Used restart mode</span>
            <input type="checkbox" checked={draft.usedRestartMode} onChange={(event) => updateDraft({ usedRestartMode: event.target.checked })} />
          </label>
        </div>

        <div className="button-row-modal" style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
          <button className="primary" onClick={handleSubmit} disabled={!canSubmit} style={{ flex: 1 }} type="button">
            {mode === 'create' ? 'Add Session' : 'Save Changes'}
          </button>
          <button className="ghost" onClick={onClose} style={{ flex: 1 }} type="button">Cancel</button>
        </div>
    </Dialog>
  );
}
