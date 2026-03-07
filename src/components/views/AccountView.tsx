// @ts-nocheck
import React from 'react';
import { Cloud, Lock, Shield, Server, FileText, Settings, Key, AlertCircle } from 'lucide-react';

export function AccountView({
  hasSupabaseConfig, cloudLabel, session, remoteUpdatedAt, authView, setAuthView,
  authEmail, setAuthEmail, authPassword, setAuthPassword, authPasswordConfirm, setAuthPasswordConfirm,
  signInWithPassword, signUpWithPassword, sendPasswordReset, updatePassword, signOut,
  authMessage, remoteSnapshot, getProjectAttachmentCount, normalizedMessage,
  profile, updateProfile, applyProfileDefaultsToActiveProject, profileMessage, passwordMessage,
  activeProject, updateProject, reminderStatus, enableNotifications, exportBackup, fileInputRef,
  importBackup, importMessage, setSenhaMessage, formatCloudTimestamp
}: any) {
  return (
    <section className="page-container workspace-account">

      {/* Cloud & Sync Hub */}
      <div className="two-column-layout">
        <article className="card panel auth-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Server size={14} /> Cloud Sync</p>
              <h2>Account & Devices</h2>
            </div>
            {hasSupabaseConfig && session && (
              <div style={{ padding: '4px 12px', background: 'rgba(167, 224, 104, 0.1)', borderRadius: '12px', border: '1px solid var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cloud size={14} color="var(--success)" />
                <strong style={{ color: 'var(--success)', fontSize: '0.8rem', textTransform: 'uppercase' }}>ONLINE</strong>
              </div>
            )}
          </div>

          {hasSupabaseConfig ? (
            <div className="auth-grid" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="coach-note" style={{ background: 'var(--surface-soft)', padding: '24px', borderRadius: '24px', border: '1px solid var(--panel-border)' }}>
                {session ? (
                  <>
                    <strong style={{ fontSize: '1.2rem', display: 'block', marginBottom: '8px' }}>Logged In</strong>
                    <p style={{ margin: '0 0 16px', color: 'var(--muted)' }}>Logged in as <strong>{session.user.email}</strong>. Your data is syncing safely.</p>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--secondary)' }}>Last sync: {formatCloudTimestamp(remoteUpdatedAt)}</p>
                  </>
                ) : (
                  <>
                    <strong style={{ fontSize: '1.2rem', display: 'block', marginBottom: '8px' }}>Not Logged In</strong>
                    <p style={{ margin: 0, color: 'var(--muted)' }}>Sign in to sync your projects and progress across devices.</p>
                  </>
                )}
              </div>

              {!session ? (
                <div style={{ padding: '24px', background: 'var(--surface-soft)', borderRadius: '24px' }}>
                  <div className="button-row two-up" style={{ marginBottom: '24px' }}>
                    <button className={authView === 'sign-in' ? 'primary' : 'ghost'} onClick={() => setAuthView('sign-in')} type="button">Sign In</button>
                    <button className={authView === 'sign-up' ? 'primary' : 'ghost'} onClick={() => setAuthView('sign-up')} type="button">Create Account</button>
                  </div>
                  <label className="input-block">
                    <span style={{ marginBottom: '8px' }}>Email Address</span>
                    <input style={{ background: 'var(--input-bg)' }} onChange={(event) => setAuthEmail(event.target.value)} type="email" value={authEmail} placeholder="me@terminal.com" />
                  </label>
                  {authView !== 'forgot-password' ? (
                    <label className="input-block">
                      <span style={{ marginBottom: '8px', marginTop: '4px' }}>{authView === 'recovery' ? 'New Password' : 'Password'}</span>
                      <input style={{ background: 'var(--input-bg)' }} onChange={(event) => setAuthPassword(event.target.value)} type="password" value={authPassword} placeholder="••••••••" />
                    </label>
                  ) : null}
                  {authView === 'sign-up' || authView === 'recovery' ? (
                    <label className="input-block">
                      <span style={{ marginBottom: '8px', marginTop: '4px' }}>Confirm Password</span>
                      <input style={{ background: 'var(--input-bg)' }} onChange={(event) => setAuthPasswordConfirm(event.target.value)} type="password" value={authPasswordConfirm} placeholder="••••••••" />
                    </label>
                  ) : null}
                  <div className="button-row" style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {authView === 'sign-in' ? <button className="primary" onClick={signInWithPassword} type="button" style={{ padding: '16px' }}>Sign In</button> : null}
                    {authView === 'sign-up' ? <button className="primary" onClick={signUpWithPassword} type="button" style={{ padding: '16px' }}>Sign Up</button> : null}
                    {authView === 'forgot-password' ? <button className="primary" onClick={sendPasswordReset} type="button" style={{ padding: '16px' }}>Send Reset Link</button> : null}
                    {authView === 'recovery' ? <button className="primary" onClick={updatePassword} type="button" style={{ padding: '16px' }}>Update Password</button> : null}
                    <button className="ghost" onClick={() => setAuthView(authView === 'forgot-password' ? 'sign-in' : 'forgot-password')} type="button" style={{ marginTop: '8px' }}>
                      {authView === 'forgot-password' ? 'Back to Sign In' : 'Forgot password?'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="button-row cloud-actions" style={{ gridTemplateColumns: '1fr', gap: '12px' }}>
                  <button className="ghost" onClick={signOut} type="button" style={{ color: 'var(--accent)', border: '1px solid rgba(255, 122, 89, 0.4)' }}>Sign Out</button>
                </div>
              )}

              {authMessage ? <div className="status ready" style={{ background: 'rgba(255, 122, 89, 0.1)', color: 'var(--accent)', border: '1px solid rgba(255, 122, 89, 0.4)' }}>{authMessage}</div> : null}

              {session && remoteSnapshot ? (
                <div className="coach-note muted" style={{ borderLeft: '3px solid var(--secondary)' }}>
                  <strong style={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={16} /> Cloud Data Summary</strong>
                  <p style={{ marginTop: '8px' }}>Cloud storage contains: {remoteSnapshot.projects.length} projects, {remoteSnapshot.sessions.length} sessions, and {getProjectAttachmentCount(remoteSnapshot.projects)} attachments.</p>
                </div>
              ) : null}

              {session && normalizedMessage ? (
                <div className="coach-note muted" style={{ borderLeft: '3px solid var(--muted)' }}>
                  <strong style={{ color: 'var(--text)' }}>Sync Log</strong>
                  <p style={{ marginTop: '8px' }}>{normalizedMessage}</p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="status" style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '32px', textAlign: 'center' }}>
              <span style={{ fontSize: '1.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '16px' }}><AlertCircle size={20} /> Supabase Not Configured</span>
              Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to your environment variables to enable cloud sync.
            </div>
          )}
        </article>

        {/* Local Utilities & Security */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          <article className="card panel utility-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={14} /> Local Data</p>
                <h2>Reminders & Backups</h2>
              </div>
            </div>

            <div className="utility-grid">
              <div style={{ padding: '24px', background: 'var(--surface-soft)', borderRadius: '24px', border: '1px solid var(--panel-border)', marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: 'var(--text)' }}>Project Reminders</h3>
                <label className="toggle-row" style={{ padding: '0 0 16px', border: 'none', background: 'transparent', borderRadius: 0, borderBottom: '1px solid var(--panel-border)', marginBottom: '16px' }}>
                  <span>Daily reminder for "{activeProject.name}"</span>
                  <input checked={activeProject.reminderEnabled} onChange={(event) => updateProject((project: any) => ({ ...project, reminderEnabled: event.target.checked }))} type="checkbox" />
                </label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <label className="input-block compact" style={{ flex: 1, padding: 0, background: 'transparent', border: 'none' }}>
                    <span style={{ marginBottom: '8px' }}>Remind me at</span>
                    <input style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProject((project: any) => ({ ...project, reminderTime: event.target.value }))} type="time" value={activeProject.reminderTime} />
                  </label>
                  <button className="primary" onClick={enableNotifications} type="button" style={{ padding: '12px 18px', fontSize: '0.85rem', borderRadius: '16px' }}>Enable browser notifications</button>
                </div>
                <p style={{ margin: '12px 0 0', fontSize: '0.85rem', color: 'var(--muted)', fontStyle: 'italic' }}>Status audited: {reminderStatus}</p>
              </div>

              <div style={{ padding: '24px', background: 'var(--surface-soft)', borderRadius: '24px', border: '1px solid var(--panel-border)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={16} /> Local Backups</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>Download or restore your data manually as a JSON file.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '12px' }}>
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
      </div>

      {session && profile ? (
        <article className="card panel settings-panel" style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
            <div>
              <p className="eyebrow" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '6px' }}><Settings size={14} /> Preferences</p>
              <h2 style={{ fontSize: '1.8rem' }}>Account Defaults</h2>
              <p style={{ color: 'var(--muted)', marginTop: '8px', maxWidth: '60ch', lineHeight: 1.5 }}>
                These settings act as defaults for all new projects and sync across your devices.
              </p>
            </div>
            <button className="primary" onClick={applyProfileDefaultsToActiveProject} type="button" style={{ padding: '10px 24px', borderRadius: '16px', fontSize: '0.9rem' }}>Apply to Current Project</button>
          </div>

          <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '24px' }}>

            <div style={{ padding: '24px', background: 'var(--surface-soft)', borderRadius: '24px', border: '1px solid var(--panel-border)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>Profile</h3>
              <label className="input-block" style={{ padding: 0, marginBottom: '20px', background: 'transparent', border: 'none' }}>
                <span style={{ marginBottom: '8px' }}>Display Name</span>
                <input style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProfile('display_name', event.target.value || null)} type="text" value={profile.display_name ?? ''} placeholder="Your desk name" />
              </label>
              <label className="input-block" style={{ padding: 0, background: 'transparent', border: 'none' }}>
                <span style={{ marginBottom: '8px' }}>Timezone</span>
                <input style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProfile('timezone', event.target.value)} type="text" value={profile.timezone} placeholder="America/New_York" />
              </label>
            </div>

            <div style={{ padding: '24px', background: 'var(--surface-soft)', borderRadius: '24px', border: '1px solid var(--panel-border)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>Timer Defaults</h3>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label className="input-block compact" style={{ flex: 1, padding: 0, background: 'transparent', border: 'none' }}>
                  <span style={{ marginBottom: '8px' }}>Default Sprint Duration</span>
                  <select style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProfile('default_sprint_minutes', Number(event.target.value))} value={profile.default_sprint_minutes}>
                    <option value={10}>10 min</option>
                    <option value={15}>15 min</option>
                    <option value={20}>20 min</option>
                    <option value={25}>25 min</option>
                    <option value={45}>45 min</option>
                  </select>
                </label>
                <label className="input-block compact" style={{ flex: 1, padding: 0, background: 'transparent', border: 'none' }}>
                  <span style={{ marginBottom: '8px' }}>Default Break Duration</span>
                  <select style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProfile('default_break_minutes', Number(event.target.value))} value={profile.default_break_minutes}>
                    <option value={3}>3 min</option>
                    <option value={5}>5 min</option>
                    <option value={8}>8 min</option>
                  </select>
                </label>
              </div>
            </div>

            <div style={{ padding: '24px', background: 'var(--surface-soft)', borderRadius: '24px', border: '1px solid var(--panel-border)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>Email Notifications</h3>
              <label className="input-block compact" style={{ padding: 0, marginBottom: '16px', background: 'transparent', border: 'none' }}>
                <span style={{ marginBottom: '8px' }}>Notification Channel</span>
                <select style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProfile('reminder_channel', event.target.value as ReminderChannel)} value={profile.reminder_channel}>
                  <option value="browser">Browser only</option>
                  <option value="email">Email only</option>
                  <option value="both">Both browser and email</option>
                </select>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 100px', gap: '16px', alignItems: 'center' }}>
                <label className="toggle-row" style={{ padding: 0, background: 'transparent', border: 'none' }}>
                  <span style={{ margin: 0 }}>Enable Email Reminders</span>
                  <input style={{ width: 'auto' }} checked={profile.email_reminders_enabled} onChange={(event) => updateProfile('email_reminders_enabled', event.target.checked)} type="checkbox" />
                </label>
                <label className="input-block compact" style={{ padding: 0, background: 'transparent', border: 'none' }}>
                  <input style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProfile('email_reminder_time', event.target.value)} type="time" value={profile.email_reminder_time} />
                </label>
              </div>
            </div>

          </div>
          {profileMessage ? <div className="status ready" style={{ marginTop: '24px', padding: '16px', fontSize: '1rem', background: 'rgba(167, 224, 104, 0.1)', color: 'var(--success)', borderRadius: '16px', border: '1px solid var(--success)' }}>{profileMessage}</div> : null}
        </article>
      ) : null}

    </section>
  );
}
