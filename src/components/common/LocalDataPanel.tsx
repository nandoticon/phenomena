import React from 'react';
import { Shield, FileText, Key, Trash2, History } from 'lucide-react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type { BackupManifest, DataRetentionSummary, Profile } from '../../types';

interface LocalDataPanelProps {
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
  backupName: string;
  setBackupName: Dispatch<SetStateAction<string>>;
  backupHistory: BackupManifest[];
  previewBackupFromHistory: (backup: BackupManifest) => void;
  cleanupOldSessions: (olderThanDays: number) => number;
  cleanupBackupHistory: (olderThanDays: number, keepRecentCount: number) => number;
  retentionSummary: DataRetentionSummary;
  retentionMessage: string;
  setRetentionMessage: Dispatch<SetStateAction<string>>;
}

export function LocalDataPanel({
  exportBackup, fileInputRef, importBackup, importMessage,
  session, profile, authPassword, setAuthPassword, authPasswordConfirm,
  setAuthPasswordConfirm, updatePassword, passwordMessage,
  backupName, setBackupName, backupHistory, previewBackupFromHistory,
  cleanupOldSessions, cleanupBackupHistory, retentionSummary, retentionMessage, setRetentionMessage,
}: LocalDataPanelProps) {
  const backupNameId = 'backup-name';
  const passwordId = 'new-password';
  const passwordConfirmId = 'confirm-new-password';
  const sessionRetentionId = 'session-retention-days';
  const backupRetentionDaysId = 'backup-retention-days';
  const backupRetentionCountId = 'backup-retention-count';
  const [sessionRetentionDays, setSessionRetentionDays] = React.useState('180');
  const [backupRetentionDays, setBackupRetentionDays] = React.useState('365');
  const [backupRetentionCount, setBackupRetentionCount] = React.useState('20');
  const [pendingCleanup, setPendingCleanup] = React.useState<
    | { kind: 'sessions'; olderThanDays: number }
    | { kind: 'backups'; olderThanDays: number; keepRecentCount: number }
    | null
  >(null);

  const parseRetentionNumber = (value: string, fallback: number, min: number, max: number) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return fallback;
    }
    return Math.min(max, Math.max(min, Math.floor(parsed)));
  };

  const openSessionCleanup = () => {
    const olderThanDays = parseRetentionNumber(sessionRetentionDays, 180, 1, 3650);
    setPendingCleanup({ kind: 'sessions', olderThanDays });
  };

  const openBackupCleanup = () => {
    const olderThanDays = parseRetentionNumber(backupRetentionDays, 365, 1, 3650);
    const keepRecentCount = parseRetentionNumber(backupRetentionCount, 20, 1, 100);
    setPendingCleanup({ kind: 'backups', olderThanDays, keepRecentCount });
  };

  const confirmCleanup = () => {
    if (!pendingCleanup) {
      return;
    }

    if (pendingCleanup.kind === 'sessions') {
      const removedSessions = cleanupOldSessions(pendingCleanup.olderThanDays);
      setRetentionMessage(
        removedSessions > 0
          ? `Removed ${removedSessions} session${removedSessions === 1 ? '' : 's'} older than ${pendingCleanup.olderThanDays} days.`
          : `No sessions older than ${pendingCleanup.olderThanDays} days were found.`,
      );
    } else {
      const removedBackups = cleanupBackupHistory(pendingCleanup.olderThanDays, pendingCleanup.keepRecentCount);
      setRetentionMessage(
        removedBackups > 0
          ? `Pruned ${removedBackups} backup${removedBackups === 1 ? '' : 's'} from local history.`
          : 'Backup history already matches the retention settings.',
      );
    }

    setPendingCleanup(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <article className="card panel utility-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={14} /> Local Data</p>
            <h2>Backups</h2>
          </div>
        </div>

        <div className="utility-grid">
          <div style={{ padding: '16px', background: 'var(--surface-soft)', borderRadius: '24px', border: '1px solid var(--panel-border)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={16} /> Local Backups</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>Name the backup before exporting. Restore snapshots from history.</p>
            <label className="input-block compact" htmlFor={backupNameId} style={{ padding: 0, marginBottom: '16px', background: 'transparent', border: 'none' }}>
              <span style={{ marginBottom: '8px' }}>Backup Name</span>
              <input id={backupNameId} style={{ background: 'var(--input-bg)' }} onChange={(event) => setBackupName?.(event.target.value)} type="text" value={backupName || ''} placeholder="Daily backup" />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
              <button className="ghost" onClick={exportBackup} type="button" style={{ border: '1px solid var(--panel-border)' }} aria-label="Export a named backup">Export Backup</button>
              <button className="ghost" onClick={() => fileInputRef.current?.click()} type="button" style={{ border: '1px dashed var(--muted)' }} aria-label="Choose a backup file to import">Import Backup</button>
              <input accept="application/json" hidden onChange={importBackup} ref={fileInputRef} type="file" />
            </div>
            <details style={{ marginTop: '20px', padding: '16px', borderRadius: '20px', border: '1px solid var(--panel-border)', background: 'var(--bg)' }}>
              <summary style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', listStyle: 'none' }}>
                <strong style={{ display: 'block' }}>Backup History</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{backupHistory.length} snapshots</span>
              </summary>
              {backupHistory.length ? (
                <div style={{ marginTop: '12px' }}>
                  <p style={{ margin: '0 0 12px', color: 'var(--muted)', lineHeight: 1.5 }}>
                    Recent exports stay here so you can restore a snapshot later.
                  </p>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: 0 }}>
                    {backupHistory.map((backup) => (
                      <li key={`${backup.exportedAt}-${backup.name}`} style={{ padding: '12px', borderRadius: '16px', border: '1px solid var(--panel-border)', background: 'var(--surface-soft)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <div>
                            <strong style={{ display: 'block', marginBottom: '4px' }}>{backup.name}</strong>
                            <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                              {backup.exportedAt ? new Date(backup.exportedAt).toLocaleString() : 'Legacy backup'} · {backup.summary.projects} projects, {backup.summary.sessions} sessions
                            </span>
                          </div>
                          <button className="ghost" type="button" onClick={() => previewBackupFromHistory(backup)} aria-label={`Restore backup ${backup.name}`}>
                            Restore
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p style={{ margin: '12px 0 0', color: 'var(--muted)' }}>No saved backup snapshots yet.</p>
              )}
            </details>
            {importMessage ? <div className="status ready" role="status" aria-live="polite" aria-atomic="true" style={{ marginTop: '16px', background: 'rgba(167, 224, 104, 0.15)', color: 'var(--success)' }}>{importMessage}</div> : null}
          </div>
        </div>
      </article>

      <article className="card panel utility-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><History size={14} /> Data Retention</p>
            <h2>Cleanup</h2>
          </div>
        </div>

        <div className="utility-grid">
          <details style={{ padding: '16px', background: 'var(--surface-soft)', borderRadius: '24px', border: '1px solid var(--panel-border)' }}>
            <summary style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', listStyle: 'none' }}>
              <h3 style={{ margin: '0', fontSize: '1rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}><Trash2 size={16} /> Sessions</h3>
              <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Retention</span>
            </summary>
            <div style={{ marginTop: '12px' }}>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '14px', lineHeight: 1.5 }}>
                Remove old session history from the synced workspace. Keep recent work in the cloud and trim older entries from this browser.
              </p>
              <label className="input-block compact" htmlFor={sessionRetentionId} style={{ padding: 0, marginBottom: '12px', background: 'transparent', border: 'none' }}>
                <span style={{ marginBottom: '8px' }}>Delete sessions older than</span>
                <input
                  id={sessionRetentionId}
                  style={{ background: 'var(--input-bg)' }}
                  onChange={(event) => setSessionRetentionDays(event.target.value)}
                  type="number"
                  min="1"
                  max="3650"
                  value={sessionRetentionDays}
                />
              </label>
              <button className="ghost" onClick={openSessionCleanup} type="button" style={{ border: '1px solid var(--panel-border)' }} aria-label={`Review cleanup for sessions older than ${sessionRetentionDays || '180'} days`}>
                Review Session Cleanup
              </button>
            </div>
          </details>

          <details style={{ padding: '16px', background: 'var(--surface-soft)', borderRadius: '24px', border: '1px solid var(--panel-border)' }}>
            <summary style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', listStyle: 'none' }}>
              <h3 style={{ margin: '0', fontSize: '1rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={16} /> Backups</h3>
              <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Cleanup</span>
            </summary>
            <div style={{ marginTop: '12px' }}>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '14px', lineHeight: 1.5 }}>
                Prune local backup history in this browser without changing the imported snapshot files on disk.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                <label className="input-block compact" htmlFor={backupRetentionDaysId} style={{ padding: 0, background: 'transparent', border: 'none' }}>
                  <span style={{ marginBottom: '8px' }}>Delete backups older than</span>
                  <input
                    id={backupRetentionDaysId}
                    style={{ background: 'var(--input-bg)' }}
                    onChange={(event) => setBackupRetentionDays(event.target.value)}
                    type="number"
                    min="1"
                    max="3650"
                    value={backupRetentionDays}
                  />
                </label>
                <label className="input-block compact" htmlFor={backupRetentionCountId} style={{ padding: 0, background: 'transparent', border: 'none' }}>
                  <span style={{ marginBottom: '8px' }}>Keep most recent backups</span>
                  <input
                    id={backupRetentionCountId}
                    style={{ background: 'var(--input-bg)' }}
                    onChange={(event) => setBackupRetentionCount(event.target.value)}
                    type="number"
                    min="1"
                    max="100"
                    value={backupRetentionCount}
                  />
                </label>
              </div>
              <button className="ghost" onClick={openBackupCleanup} type="button" style={{ border: '1px solid var(--panel-border)' }} aria-label={`Review cleanup for backup history older than ${backupRetentionDays || '365'} days`}>
                Review Backup Cleanup
              </button>
            </div>
          </details>
        </div>

        <div style={{ marginTop: '16px', padding: '14px', borderRadius: '18px', border: '1px solid var(--panel-border)', background: 'var(--bg)', color: 'var(--muted)', lineHeight: 1.5 }}>
          <strong style={{ display: 'block', marginBottom: '6px', color: 'var(--text)' }}>Current storage footprint</strong>
          <p style={{ margin: 0 }}>
            {retentionSummary.sessionCount} sessions saved locally. {retentionSummary.backupCount} backup snapshots in this browser.
          </p>
          <p style={{ margin: '6px 0 0' }}>
            {retentionSummary.oldestSession ? `Oldest session: ${retentionSummary.oldestSession}. ` : ''}
            {retentionSummary.oldestBackup ? `Oldest backup: ${new Date(retentionSummary.oldestBackup).toLocaleString()}.` : ''}
          </p>
        </div>

        {retentionMessage ? <div className="status ready" role="status" aria-live="polite" aria-atomic="true" style={{ marginTop: '16px', background: 'rgba(167, 224, 104, 0.1)', color: 'var(--success)' }}>{retentionMessage}</div> : null}
      </article>

      {session && profile ? (
        <article className="card panel security-block" style={{ flex: 1, padding: '16px' }}>
          <div className="panel-head">
            <div>
              <p className="eyebrow" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '6px' }}><Key size={14} /> Security</p>
              <h2>Change Password</h2>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label className="input-block" htmlFor={passwordId} style={{ padding: 0, background: 'transparent', border: 'none' }}>
              <span style={{ marginBottom: '8px' }}>New Password</span>
              <input id={passwordId} style={{ background: 'var(--input-bg)' }} onChange={(event) => setAuthPassword(event.target.value)} type="password" value={authPassword} placeholder="••••••••••••" />
            </label>
            <label className="input-block" htmlFor={passwordConfirmId} style={{ padding: 0, background: 'transparent', border: 'none' }}>
              <span style={{ marginBottom: '8px' }}>Confirm New Password</span>
              <input id={passwordConfirmId} style={{ background: 'var(--input-bg)' }} onChange={(event) => setAuthPasswordConfirm(event.target.value)} type="password" value={authPasswordConfirm} placeholder="••••••••••••" />
            </label>
            <button className="ghost" onClick={updatePassword} type="button" style={{ marginTop: '12px', padding: '16px', border: '1px solid rgba(255, 122, 89, 0.3)', color: 'var(--accent)' }} aria-label="Update account password">Update Password</button>
          </div>

          {passwordMessage ? <div className="status ready" role="status" aria-live="polite" aria-atomic="true" style={{ marginTop: '16px', background: 'rgba(167, 224, 104, 0.1)', color: 'var(--success)' }}>{passwordMessage}</div> : null}
        </article>
      ) : null}

      {pendingCleanup ? (
        <section
          className="card panel"
          style={{ padding: '16px', borderRadius: '22px', border: '1px solid var(--panel-border)', background: 'var(--surface-soft)' }}
          aria-label="Cleanup confirmation"
        >
          <div className="panel-head" style={{ marginBottom: '12px' }}>
            <div>
              <p className="eyebrow" style={{ color: 'var(--accent)' }}>Confirm cleanup</p>
              <h3 style={{ margin: 0, fontSize: '1.05rem' }}>
                {pendingCleanup.kind === 'sessions' ? 'Delete old sessions?' : 'Prune backup history?'}
              </h3>
            </div>
          </div>
          <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.5 }}>
            {pendingCleanup.kind === 'sessions'
              ? `This will remove sessions older than ${pendingCleanup.olderThanDays} days from the synced workspace in this browser.`
              : `This will keep the most recent ${pendingCleanup.keepRecentCount} backups and remove snapshots older than ${pendingCleanup.olderThanDays} days from local history.`}
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button className="ghost" type="button" onClick={() => setPendingCleanup(null)}>
              Cancel
            </button>
            <button className="primary" type="button" onClick={confirmCleanup}>
              Confirm cleanup
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
