import React from 'react';
import { Server, Cloud, Shield } from 'lucide-react';

export function CloudPanel({
  hasSupabaseConfig, session, formatCloudTimestamp, remoteUpdatedAt,
  authView, setAuthView, authEmail, setAuthEmail, authPassword, setAuthPassword,
  authPasswordConfirm, setAuthPasswordConfirm, signInWithPassword, signUpWithPassword,
  sendPasswordReset, updatePassword, signOut, authMessage, remoteSnapshot,
  getProjectAttachmentCount, normalizedMessage
}: any) {
  return (
    <article className="card panel auth-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Server size={14} /> Cloud Sync</p>
          <h1 style={{ fontSize: '1.4rem', margin: 0 }}>Account & Devices</h1>
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
          <div className="coach-note" style={{ background: 'var(--surface-soft)', padding: '16px', borderRadius: '24px', border: '1px solid var(--panel-border)' }}>
            {session ? (
              <>
                <strong style={{ fontSize: '1.2rem', display: 'block', marginBottom: '8px' }}>Logged In</strong>
                <p style={{ margin: '0 0 16px', color: 'var(--muted)', wordBreak: 'break-all' }}>Logged in as <strong>{session.user.email}</strong>. Your data is syncing safely.</p>
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
            <div style={{ padding: '16px', background: 'var(--surface-soft)', borderRadius: '24px' }}>
              <div className="button-row" style={{ display: 'flex', gap: '8px', padding: '6px', background: 'var(--input-bg)', borderRadius: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <button
                  className={authView === 'sign-in' ? 'pill active' : 'pill'}
                  onClick={() => setAuthView('sign-in')}
                  type="button"
                  style={{ flex: 1, padding: '10px' }}
                >
                  Sign In
                </button>
                <button
                  className={authView === 'sign-up' ? 'pill active' : 'pill'}
                  onClick={() => setAuthView('sign-up')}
                  type="button"
                  style={{ flex: 1, padding: '10px' }}
                >
                  Create Account
                </button>
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
        <div className="status" style={{ background: 'var(--surface-soft)', padding: '40px 24px', textAlign: 'center', borderRadius: '24px', border: '1px dashed var(--panel-border)' }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
            <Server size={48} style={{ opacity: 0.2, color: 'var(--accent)' }} />
          </div>
          <h3 style={{ fontSize: '1.1rem', margin: '0 0 12px', color: 'var(--text)' }}>Cloud Sync Unavailable</h3>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Connect to Supabase to enable real-time backup and multi-device sync. Add your environment variables to get started.
          </p>
        </div>
      )}
    </article>
  );
}
