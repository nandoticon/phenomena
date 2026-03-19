import React from 'react';
import { Server, Cloud, Shield } from 'lucide-react';
import { summarizeState } from '../../utils/sync';
import type { Session } from '@supabase/supabase-js';
import type { AppState, NuvemStatus, Project, SyncQueueState } from '../../types';
import type { SyncConflict } from '../../utils/sync';

interface CloudPanelProps {
  hasSupabaseConfig: boolean;
  session: Session | null;
  formatCloudTimestamp: (value: string | null) => string;
  remoteUpdatedAt: string | null;
  cloudStatus: NuvemStatus;
  authView: 'sign-in' | 'sign-up' | 'forgot-password' | 'recovery';
  setAuthView: (value: 'sign-in' | 'sign-up' | 'forgot-password' | 'recovery') => void;
  authEmail: string;
  setAuthEmail: React.Dispatch<React.SetStateAction<string>>;
  authPassword: string;
  setAuthPassword: React.Dispatch<React.SetStateAction<string>>;
  authPasswordConfirm: string;
  setAuthPasswordConfirm: React.Dispatch<React.SetStateAction<string>>;
  signInWithPassword: () => void;
  signUpWithPassword: () => void;
  sendPasswordReset: () => void;
  updatePassword: () => void;
  signOut: () => void;
  authMessage: string;
  remoteSnapshot: AppState | null;
  getProjectAttachmentCount: (projects: Project[]) => number;
  normalizedMessage: string;
  state: AppState;
  syncConflict: SyncConflict | null;
  syncQueue: SyncQueueState;
  pullCloudState: () => void;
  pushLocalState: () => void;
  replaceCloudWithLocal: () => void;
}

export function CloudPanel({
  hasSupabaseConfig, session, formatCloudTimestamp, remoteUpdatedAt, cloudStatus,
  authView, setAuthView, authEmail, setAuthEmail, authPassword, setAuthPassword,
  authPasswordConfirm, setAuthPasswordConfirm, signInWithPassword, signUpWithPassword,
  sendPasswordReset, updatePassword, signOut, authMessage, remoteSnapshot,
  getProjectAttachmentCount, normalizedMessage, state, syncConflict, syncQueue, pullCloudState,
  pushLocalState, replaceCloudWithLocal
}: CloudPanelProps) {
  const localSummary = summarizeState(state);
  const cloudSummary = summarizeState(remoteSnapshot);
  const hasPendingChanges = syncQueue?.pending;

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

          {authMessage ? <div className="status ready" role="status" aria-live="polite" aria-atomic="true" style={{ background: 'rgba(255, 122, 89, 0.1)', color: 'var(--accent)', border: '1px solid rgba(255, 122, 89, 0.4)' }}>{authMessage}</div> : null}

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

          {session ? (
            <div className="coach-note" style={{ borderLeft: '3px solid var(--accent)', background: 'var(--surface-soft)' }}>
              <strong style={{ color: 'var(--text)', display: 'block', marginBottom: '8px' }}>Recovery Path</strong>
              <p style={{ marginTop: 0, marginBottom: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>
                Local changes are merged safely by default. If the cloud and local copy drift apart, use the buttons below to choose the source of truth.
              </p>
              <div style={{ display: 'grid', gap: '10px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <span>Local: {localSummary ? `${localSummary.projects} projects, ${localSummary.sessions} sessions, ${localSummary.attachments} attachments` : 'Unavailable'}</span>
                  <span>Cloud: {cloudSummary ? `${cloudSummary.projects} projects, ${cloudSummary.sessions} sessions, ${cloudSummary.attachments} attachments` : 'Empty'}</span>
                </div>
              {syncConflict ? (
                <div className="status error" role="alert" aria-live="assertive" aria-atomic="true" style={{ margin: 0, border: '1px solid rgba(255, 122, 89, 0.35)' }}>
                  {syncConflict.message}
                </div>
              ) : null}
              {hasPendingChanges ? (
                <div className={`status ${cloudStatus === 'offline' ? 'error' : 'ready'}`} role="status" aria-live="polite" aria-atomic="true" style={{ margin: 0, border: '1px solid rgba(255, 122, 89, 0.25)' }}>
                  <strong style={{ display: 'block', marginBottom: '4px' }}>
                    {cloudStatus === 'offline' ? 'Offline queue active' : 'Pending cloud sync'}
                  </strong>
                  <p style={{ margin: 0, lineHeight: 1.5 }}>
                    {cloudStatus === 'offline'
                      ? 'Your changes are saved locally and will sync when the connection returns.'
                      : 'Your latest changes are saved locally and waiting for the next sync attempt.'}
                  </p>
                  <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: 'var(--muted)' }}>
                    Attempts: {syncQueue.attempts}. {syncQueue.lastError ? `Last error: ${syncQueue.lastError}` : 'No error reported.'}
                  </p>
                </div>
              ) : null}
            </div>
            <div className="button-row" style={{ display: 'grid', gap: '10px' }}>
              <button className="ghost" onClick={pullCloudState} type="button">Use cloud copy</button>
              <button className="primary" onClick={pushLocalState} type="button">Merge local changes</button>
              <button className="ghost" onClick={replaceCloudWithLocal} type="button" style={{ border: '1px solid rgba(255, 122, 89, 0.35)' }}>Replace cloud with local</button>
              </div>
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
