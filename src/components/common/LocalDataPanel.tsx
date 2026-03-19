import React from 'react';
import { Shield, FileText, Key, Bell } from 'lucide-react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type { BackupPreview, Profile, Project, ReminderEvent } from '../../types';

interface LocalDataPanelProps {
  activeProject: Project | undefined;
  updateProject: ((updater: (project: Project) => Project) => void) | undefined;
  enableNotifications: () => void;
  reminderStatus: string;
  exportBackup: () => void;
  fileInputRef: MutableRefObject<HTMLInputElement | null>;
  importBackup: (event: React.ChangeEvent<HTMLInputElement>) => void;
  importMessage: string;
  session: unknown;
  profile: Profile | null;
  authPassword: string;
  setAuthPassword: Dispatch<SetStateAction<string>>;
  authPasswordConfirm: string;
  setAuthPasswordConfirm: Dispatch<SetStateAction<string>>;
  updatePassword: () => void;
  passwordMessage: string;
  reminderEvents: ReminderEvent[];
  acknowledgeReminder: (id: string) => void;
  refreshReminderInbox: () => void;
  projectNameMap: Record<string, string>;
  backupName: string;
  setBackupName: Dispatch<SetStateAction<string>>;
  importPreview: BackupPreview | null;
  confirmImportBackup: () => void;
  cancelImportBackup: () => void;
}

export function LocalDataPanel({
  activeProject, updateProject, enableNotifications, reminderStatus,
  exportBackup, fileInputRef, importBackup, importMessage,
  session, profile, authPassword, setAuthPassword, authPasswordConfirm,
  setAuthPasswordConfirm, updatePassword, passwordMessage, reminderEvents, acknowledgeReminder, refreshReminderInbox, projectNameMap,
  backupName, setBackupName, importPreview, confirmImportBackup, cancelImportBackup
}: LocalDataPanelProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <article className="card panel utility-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={14} /> Local Data</p>
            <h2>Reminders & Backups</h2>
          </div>
        </div>

        <div className="utility-grid">
          <div style={{ padding: '16px', background: 'var(--surface-soft)', borderRadius: '24px', border: '1px solid var(--panel-border)', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: 'var(--text)' }}>Project Reminders</h3>
            <label className="toggle-row" style={{ padding: '0 0 16px', border: 'none', background: 'transparent', borderRadius: 0, borderBottom: '1px solid var(--panel-border)', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span style={{ wordBreak: 'break-all' }}>Daily reminder for "{activeProject?.name || 'Current Project'}"</span>
              <input checked={activeProject?.reminderEnabled || false} onChange={(event) => updateProject?.((project) => ({ ...project, reminderEnabled: event.target.checked }))} type="checkbox" />
            </label>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <label className="input-block compact" style={{ flex: 1, padding: 0, background: 'transparent', border: 'none' }}>
                <span style={{ marginBottom: '8px' }}>Remind me at</span>
                <input style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProject?.((project) => ({ ...project, reminderTime: event.target.value }))} type="time" value={activeProject?.reminderTime || ''} />
              </label>
              <button className="primary" onClick={enableNotifications} type="button" style={{ padding: '12px 18px', fontSize: '0.85rem', borderRadius: '16px' }}>Enable browser notifications</button>
            </div>
            <p style={{ margin: '12px 0 0', fontSize: '0.85rem', color: 'var(--muted)', fontStyle: 'italic' }}>Current reminder status: {reminderStatus}</p>

            <div style={{ marginTop: '20px', padding: '16px', borderRadius: '20px', border: '1px solid var(--panel-border)', background: 'var(--bg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={16} />
                  <strong>Server Reminder Inbox</strong>
                </div>
                <button className="ghost" onClick={refreshReminderInbox} type="button" style={{ padding: '8px 12px', borderRadius: '10px' }}>
                  Refresh
                </button>
              </div>
              {reminderEvents.length === 0 ? (
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
                  No queued reminders right now. When the server schedules one, it will stay here until you acknowledge it.
                </p>
              ) : (
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: 0 }}>
                  {reminderEvents.map((event) => (
                    <li key={event.id} style={{ padding: '12px', borderRadius: '16px', border: '1px solid var(--panel-border)', background: 'var(--surface-soft)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ display: 'block', marginBottom: '4px' }}>{event.title}</strong>
                          <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.5 }}>{event.body}</p>
                          <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: 'var(--secondary)' }}>
                            {projectNameMap?.[event.project_id] || event.project_id} · {event.channel}
                          </p>
                        </div>
                        <button className="primary" onClick={() => acknowledgeReminder(event.id)} type="button" style={{ padding: '8px 12px', borderRadius: '10px' }}>
                          Mark seen
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div style={{ padding: '16px', background: 'var(--surface-soft)', borderRadius: '24px', border: '1px solid var(--panel-border)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={16} /> Local Backups</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>Name the backup before exporting. Imports are previewed before anything is restored.</p>
            <label className="input-block compact" style={{ padding: 0, marginBottom: '16px', background: 'transparent', border: 'none' }}>
              <span style={{ marginBottom: '8px' }}>Backup Name</span>
              <input style={{ background: 'var(--input-bg)' }} onChange={(event) => setBackupName?.(event.target.value)} type="text" value={backupName || ''} placeholder="Daily backup" />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
              <button className="ghost" onClick={exportBackup} type="button" style={{ border: '1px solid var(--panel-border)' }}>Export Backup</button>
              <button className="ghost" onClick={() => fileInputRef.current?.click()} type="button" style={{ border: '1px dashed var(--muted)' }}>Import Backup</button>
              <input accept="application/json" hidden onChange={importBackup} ref={fileInputRef} type="file" />
            </div>
            {importMessage ? <div className="status ready" role="status" aria-live="polite" aria-atomic="true" style={{ marginTop: '16px', background: 'rgba(167, 224, 104, 0.15)', color: 'var(--success)' }}>{importMessage}</div> : null}
            {importPreview ? (
              <div style={{ marginTop: '16px', padding: '16px', borderRadius: '20px', border: '1px solid var(--panel-border)', background: 'var(--bg)' }}>
                <strong style={{ display: 'block', marginBottom: '6px' }}>{importPreview.name}</strong>
                <p style={{ margin: '0 0 8px', color: 'var(--muted)', lineHeight: 1.5 }}>
                  {importPreview.exportedAt ? `Exported ${new Date(importPreview.exportedAt).toLocaleString()}` : 'Legacy backup file'}
                </p>
                <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.5 }}>
                  {importPreview.summary.projects} projects, {importPreview.summary.sessions} sessions, {importPreview.summary.attachments} attachments
                </p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                  <button className="primary" onClick={confirmImportBackup} type="button" style={{ flex: 1 }}>Restore backup</button>
                  <button className="ghost" onClick={cancelImportBackup} type="button" style={{ flex: 1 }}>Cancel</button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </article>

      {session && profile ? (
        <article className="card panel security-block" style={{ flex: 1 }}>
          <div className="panel-head">
            <div>
              <p className="eyebrow" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '6px' }}><Key size={14} /> Security</p>
              <h2>Change Password</h2>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label className="input-block" style={{ padding: 0, background: 'transparent', border: 'none' }}>
              <span style={{ marginBottom: '8px' }}>New Password</span>
              <input style={{ background: 'var(--input-bg)' }} onChange={(event) => setAuthPassword(event.target.value)} type="password" value={authPassword} placeholder="••••••••••••" />
            </label>
            <label className="input-block" style={{ padding: 0, background: 'transparent', border: 'none' }}>
              <span style={{ marginBottom: '8px' }}>Confirm New Password</span>
              <input style={{ background: 'var(--input-bg)' }} onChange={(event) => setAuthPasswordConfirm(event.target.value)} type="password" value={authPasswordConfirm} placeholder="••••••••••••" />
            </label>
            <button className="ghost" onClick={updatePassword} type="button" style={{ marginTop: '12px', padding: '16px', border: '1px solid rgba(255, 122, 89, 0.3)', color: 'var(--accent)' }}>Update Password</button>
          </div>

          {passwordMessage ? <div className="status ready" role="status" aria-live="polite" aria-atomic="true" style={{ marginTop: '16px', background: 'rgba(167, 224, 104, 0.1)', color: 'var(--success)' }}>{passwordMessage}</div> : null}
        </article>
      ) : null}
    </div>
  );
}
