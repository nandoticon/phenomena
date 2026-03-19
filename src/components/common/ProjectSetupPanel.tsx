import React from 'react';
import { Edit3, Archive, Music, Bell } from 'lucide-react';
import type { NotificationState, Project, ReminderEvent } from '../../types';

type AmbientPreset = { label: string; url: string };

interface ProjectSetupPanelProps {
  activeProjects: Project[];
  activeProject: Project;
  updateProject: (updater: (project: Project) => Project) => void;
  archiveActiveProject: () => void;
  duplicateActiveProject: () => void;
  ambientPresets: AmbientPreset[];
  toggleFullscreen: () => void;
  isFullscreen: boolean;
  toggleReminder: () => void;
  notificationState: NotificationState;
  getReminderStatus: (notificationState: NotificationState, reminderEnabled: boolean) => string;
  reminderEvents: ReminderEvent[];
  acknowledgeReminder: (id: string) => void;
  refreshReminderInbox: () => void;
  projectNameMap: Record<string, string>;
}

export function ProjectSetupPanel({
  activeProjects,
  activeProject,
  updateProject,
  archiveActiveProject,
  duplicateActiveProject,
  ambientPresets,
  toggleFullscreen,
  isFullscreen,
  toggleReminder,
  notificationState,
  getReminderStatus,
  reminderEvents,
  acknowledgeReminder,
  refreshReminderInbox,
  projectNameMap,
}: ProjectSetupPanelProps) {
  const audioUrlId = 'project-setup-audio-url';
  const themeId = 'project-setup-theme';
  const projectNameId = 'project-setup-name';
  const projectNoteId = 'project-setup-note';
  const reminderToggleId = 'project-setup-reminder-enabled';
  const reminderTimeId = 'project-setup-reminder-time';

  return (
    <article className="card panel" style={{ background: 'var(--surface-soft)', padding: '20px', borderRadius: '20px', border: '1px solid var(--panel-border)' }}>
      <div className="panel-head" style={{ marginBottom: '16px', alignItems: 'flex-start' }}>
        <div>
          <p className="eyebrow" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}><Edit3 size={14} /> Project Setup</p>
          <h2 style={{ margin: '6px 0 0' }}>Name, reminders, and atmosphere</h2>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button className="ghost" onClick={duplicateActiveProject} type="button" style={{ fontSize: '0.8rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }} aria-label="Duplicate the current project">
            Duplicate
          </button>
          <button className="ghost" disabled={activeProjects.length <= 1} onClick={archiveActiveProject} type="button" style={{ fontSize: '0.8rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }} aria-label="Archive the current project">
            <Archive size={14} /> Archive
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label className="input-block" htmlFor={projectNameId} style={{ padding: 0, background: 'transparent', border: 'none' }}>
            <span style={{ marginBottom: '8px' }}>Project Name</span>
            <input id={projectNameId} style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProject((project) => ({ ...project, name: event.target.value || project.name }))} value={activeProject.name} type="text" />
          </label>
          <label className="input-block" htmlFor={projectNoteId} style={{ padding: 0, background: 'transparent', border: 'none' }}>
            <span style={{ marginBottom: '8px' }}>Project Note</span>
            <input id={projectNoteId} style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProject((project) => ({ ...project, note: event.target.value }))} value={activeProject.note} type="text" placeholder="Short description or context" />
          </label>

          <label className="toggle-row" htmlFor={reminderToggleId} style={{ padding: '0 0 12px', border: 'none', background: 'transparent', borderRadius: 0, borderBottom: '1px solid var(--panel-border)', flexWrap: 'wrap' }}>
            <span style={{ wordBreak: 'break-word' }}>Daily reminder</span>
            <input id={reminderToggleId} checked={activeProject.reminderEnabled} onChange={toggleReminder} type="checkbox" />
          </label>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <label className="input-block compact" htmlFor={reminderTimeId} style={{ flex: 1, padding: 0, background: 'transparent', border: 'none' }}>
              <span style={{ marginBottom: '8px' }}>Remind me at</span>
              <input id={reminderTimeId} style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProject((project) => ({ ...project, reminderTime: event.target.value }))} type="time" value={activeProject.reminderTime || ''} />
            </label>
            <button className="ghost" onClick={toggleReminder} type="button" style={{ padding: '12px 18px', borderRadius: '16px', border: '1px solid var(--panel-border)' }} aria-label="Toggle browser notifications for this project">
              {notificationState === 'granted' ? 'Notifications On' : 'Enable Notifications'}
            </button>
          </div>
          <p role="status" aria-live="polite" aria-atomic="true" style={{ margin: 0, color: 'var(--muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
            {getReminderStatus(notificationState, activeProject.reminderEnabled)}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <details className="compact-fold card" style={{ padding: '12px 14px', borderRadius: '18px', background: 'var(--bg)', border: '1px solid var(--panel-border)' }}>
            <summary style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', listStyle: 'none' }}>
              <h3 style={{ margin: 0, fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Bell size={16} /> Reminder Inbox</h3>
              <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{reminderEvents.length} items</span>
            </summary>
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="ghost" type="button" onClick={refreshReminderInbox} style={{ padding: '8px 12px', borderRadius: '12px', alignSelf: 'flex-start' }}>
                Refresh
              </button>
              {reminderEvents.length ? (
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: 0 }}>
                  {reminderEvents.map((event) => (
                    <li key={event.id} style={{ padding: '12px', borderRadius: '14px', border: '1px solid var(--panel-border)', background: 'var(--surface-soft)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <strong>{event.title}</strong>
                          <span style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: 1.4 }}>
                            {event.body}
                          </span>
                          <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                            {projectNameMap[event.project_id] || 'Project'} · {event.channel} · Due {new Date(event.due_at).toLocaleString()}
                          </span>
                        </div>
                        <button className="ghost" type="button" onClick={() => acknowledgeReminder(event.id)} style={{ padding: '8px 12px', borderRadius: '12px' }}>
                          Mark seen
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>No pending reminders right now.</p>
              )}
            </div>
          </details>

          <details className="compact-fold card" style={{ padding: '12px 14px', borderRadius: '18px', background: 'var(--bg)', border: '1px solid var(--panel-border)' }}>
            <summary style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', listStyle: 'none' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Music size={16} /> Environment</h3>
              <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Audio and theme</span>
            </summary>
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label className="input-block compact" htmlFor={audioUrlId} style={{ padding: 0, background: 'transparent', border: 'none' }}>
                <span style={{ marginBottom: '8px' }}>Ambient Audio URL</span>
                <input id={audioUrlId} style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProject((project) => ({ ...project, soundtrackUrl: event.target.value }))} type="url" value={activeProject.soundtrackUrl} />
              </label>
              <div className="preset-row" style={{ marginTop: '0' }}>
                {ambientPresets.map((preset) => (
                  <button key={preset.label} className="pill" onClick={() => updateProject((project) => ({ ...project, soundtrackUrl: preset.url }))} type="button" style={{ fontSize: '0.8rem', padding: '8px 12px' }} aria-label={`Use ambient preset ${preset.label}`}>
                    {preset.label}
                  </button>
                ))}
              </div>
              <label className="input-block compact" htmlFor={themeId} style={{ padding: 0, marginTop: '0', background: 'transparent', border: 'none' }}>
                <span style={{ marginBottom: '8px' }}>Theme</span>
                <select id={themeId} style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProject((project) => ({ ...project, cueTheme: event.target.value as Project['cueTheme'] }))} value={activeProject.cueTheme}>
                  <option value="embers">Embers</option>
                  <option value="mist">Mist</option>
                  <option value="moonlight">Moonlight</option>
                </select>
              </label>
            </div>
          </details>

          <div className="button-row utility-buttons two-up" style={{ display: 'grid', gap: '12px' }}>
            <a className="ghost link-button" href={activeProject.soundtrackUrl} rel="noreferrer" target="_blank" style={{ color: 'var(--accent)' }} aria-label="Open ambient audio in a new tab">
              Play Audio
            </a>
            <button className="primary" onClick={toggleFullscreen} type="button" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }} aria-label={isFullscreen ? 'Exit fullscreen mode' : 'Enter fullscreen mode'}>
              {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
