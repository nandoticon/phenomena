import React from 'react';
import { Shield, FileText, Key } from 'lucide-react';

export function LocalDataPanel({
  activeProject, updateProject, enableNotifications, reminderStatus,
  exportBackup, fileInputRef, importBackup, importMessage,
  session, profile, authPassword, setAuthPassword, authPasswordConfirm,
  setAuthPasswordConfirm, updatePassword, passwordMessage
}: any) {
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
              <input checked={activeProject?.reminderEnabled || false} onChange={(event) => updateProject?.((project: any) => ({ ...project, reminderEnabled: event.target.checked }))} type="checkbox" />
            </label>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <label className="input-block compact" style={{ flex: 1, padding: 0, background: 'transparent', border: 'none' }}>
                <span style={{ marginBottom: '8px' }}>Remind me at</span>
                <input style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProject?.((project: any) => ({ ...project, reminderTime: event.target.value }))} type="time" value={activeProject?.reminderTime || ''} />
              </label>
              <button className="primary" onClick={enableNotifications} type="button" style={{ padding: '12px 18px', fontSize: '0.85rem', borderRadius: '16px' }}>Enable browser notifications</button>
            </div>
            <p style={{ margin: '12px 0 0', fontSize: '0.85rem', color: 'var(--muted)', fontStyle: 'italic' }}>Status audited: {reminderStatus}</p>
          </div>

          <div style={{ padding: '16px', background: 'var(--surface-soft)', borderRadius: '24px', border: '1px solid var(--panel-border)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={16} /> Local Backups</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>Download or restore your data manually as a JSON file.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
              <button className="ghost" onClick={exportBackup} type="button" style={{ border: '1px solid var(--panel-border)' }}>Export Backup</button>
              <button className="ghost" onClick={() => fileInputRef.current?.click()} type="button" style={{ border: '1px dashed var(--muted)' }}>Import Backup</button>
              <input accept="application/json" hidden onChange={importBackup} ref={fileInputRef} type="file" />
            </div>
            {importMessage ? <div className="status ready" style={{ marginTop: '16px', background: 'rgba(167, 224, 104, 0.15)', color: 'var(--success)' }}>{importMessage}</div> : null}
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

          {passwordMessage ? <div className="status ready" style={{ marginTop: '16px', background: 'rgba(167, 224, 104, 0.1)', color: 'var(--success)' }}>{passwordMessage}</div> : null}
        </article>
      ) : null}
    </div>
  );
}
