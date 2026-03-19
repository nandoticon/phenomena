import type { BackupComparison, BackupDiffSummary, BackupItemSelection, BackupPreview, BackupRestoreSelection } from '../../types';
import { Dialog } from './Dialog';

interface BackupRestoreModalProps {
  open: boolean;
  importPreview: BackupPreview | null;
  backupDiff: BackupDiffSummary | null;
  backupComparison: BackupComparison | null;
  backupRestoreSelection: BackupRestoreSelection;
  backupItemSelection: BackupItemSelection;
  setBackupRestoreSelection: React.Dispatch<React.SetStateAction<BackupRestoreSelection>>;
  setBackupItemSelection: React.Dispatch<React.SetStateAction<BackupItemSelection>>;
  confirmImportBackup: () => void;
  cancelImportBackup: () => void;
}

export function BackupRestoreModal({
  open,
  importPreview,
  backupDiff,
  backupComparison,
  backupRestoreSelection,
  backupItemSelection,
  setBackupRestoreSelection,
  setBackupItemSelection,
  confirmImportBackup,
  cancelImportBackup,
}: BackupRestoreModalProps) {
  if (!open || !importPreview) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={cancelImportBackup}
      className="card panel"
      style={{ width: 'min(920px, calc(100vw - 32px))', maxHeight: '84vh', overflow: 'hidden', border: '1px solid var(--panel-border)', background: 'var(--surface-soft)', boxShadow: '0 24px 80px rgba(0,0,0,0.35)' }}
      labelledBy="backup-restore-title"
      describedBy="backup-restore-description"
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', padding: '18px 20px', borderBottom: '1px solid var(--panel-border)' }}>
          <div>
            <p className="eyebrow" style={{ margin: 0, color: 'var(--accent)' }}>Restore backup</p>
            <h3 id="backup-restore-title" style={{ margin: '6px 0 0' }}>{importPreview.name}</h3>
          </div>
          <button className="ghost" type="button" onClick={cancelImportBackup} aria-label="Close restore modal" style={{ padding: '8px 10px', borderRadius: '12px' }}>
            ✕
          </button>
        </div>

        <div id="backup-restore-description" style={{ padding: '18px 20px', maxHeight: 'calc(84vh - 74px)', overflowY: 'auto', display: 'grid', gap: '16px' }}>
          <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.5 }}>
            {importPreview.exportedAt ? `Exported ${new Date(importPreview.exportedAt).toLocaleString()}` : 'Legacy backup file'} · {importPreview.summary.projects} projects, {importPreview.summary.sessions} sessions, {importPreview.summary.attachments} attachments
          </p>

          {backupDiff ? (
            <div style={{ padding: '12px', borderRadius: '16px', background: 'var(--bg)', border: '1px solid var(--panel-border)' }}>
              <strong style={{ display: 'block', marginBottom: '8px' }}>Backup comparison</strong>
              <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.5 }}>
                {backupDiff.notes.length ? backupDiff.notes.join(' ') : 'This backup matches the current workspace closely.'}
              </p>
            </div>
          ) : null}

          {backupComparison ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '12px' }}>
              <section style={{ padding: '12px', borderRadius: '14px', border: '1px solid var(--panel-border)', background: 'var(--bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                  <strong>Projects</strong>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      className="ghost"
                      type="button"
                      onClick={() => setBackupItemSelection({
                        projects: Object.fromEntries(backupComparison.projectChanges.filter((change) => Boolean(change.imported)).map((change) => [change.id, true])),
                        sessions: backupItemSelection.sessions,
                      })}
                      style={{ padding: '6px 10px', borderRadius: '10px' }}
                    >
                      All
                    </button>
                    <button
                      className="ghost"
                      type="button"
                      onClick={() => setBackupItemSelection({
                        projects: Object.fromEntries(backupComparison.projectChanges.filter((change) => Boolean(change.imported)).map((change) => [change.id, false])),
                        sessions: backupItemSelection.sessions,
                      })}
                      style={{ padding: '6px 10px', borderRadius: '10px' }}
                    >
                      None
                    </button>
                  </div>
                </div>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: 0 }}>
                  {backupComparison.projectChanges.map((change) => (
                    <li key={change.id} style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--panel-border)', background: 'var(--surface-soft)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <strong style={{ display: 'block' }}>{change.label}</strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                            {change.status === 'added' ? 'From backup' : change.status === 'updated' ? 'Updated from backup' : 'Current only'}
                          </span>
                        </div>
                        {change.imported ? (
                          <input
                            checked={backupItemSelection.projects[change.id] !== false}
                            onChange={(event) => setBackupItemSelection((current) => ({
                              ...current,
                              projects: {
                                ...current.projects,
                                [change.id]: event.target.checked,
                              },
                            }))}
                            type="checkbox"
                            aria-label={`Restore project ${change.label}`}
                          />
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section style={{ padding: '12px', borderRadius: '14px', border: '1px solid var(--panel-border)', background: 'var(--bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                  <strong>Sessions</strong>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      className="ghost"
                      type="button"
                      onClick={() => setBackupItemSelection({
                        projects: backupItemSelection.projects,
                        sessions: Object.fromEntries(backupComparison.sessionChanges.filter((change) => Boolean(change.imported)).map((change) => [change.id, true])),
                      })}
                      style={{ padding: '6px 10px', borderRadius: '10px' }}
                    >
                      All
                    </button>
                    <button
                      className="ghost"
                      type="button"
                      onClick={() => setBackupItemSelection({
                        projects: backupItemSelection.projects,
                        sessions: Object.fromEntries(backupComparison.sessionChanges.filter((change) => Boolean(change.imported)).map((change) => [change.id, false])),
                      })}
                      style={{ padding: '6px 10px', borderRadius: '10px' }}
                    >
                      None
                    </button>
                  </div>
                </div>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: 0 }}>
                  {backupComparison.sessionChanges.map((change) => (
                    <li key={change.id} style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--panel-border)', background: 'var(--surface-soft)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <strong style={{ display: 'block' }}>{change.label}</strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                            {change.status === 'added' ? 'From backup' : change.status === 'updated' ? 'Updated from backup' : 'Current only'}
                          </span>
                        </div>
                        {change.imported ? (
                          <input
                            checked={backupItemSelection.sessions[change.id] !== false}
                            onChange={(event) => setBackupItemSelection((current) => ({
                              ...current,
                              sessions: {
                                ...current.sessions,
                                [change.id]: event.target.checked,
                              },
                            }))}
                            type="checkbox"
                            aria-label={`Restore session ${change.label}`}
                          />
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          ) : null}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '12px' }}>
            <label className="toggle-row" style={{ padding: '10px 12px', margin: 0, border: '1px solid var(--panel-border)', borderRadius: '14px', background: 'var(--surface-soft)', flexWrap: 'wrap' }}>
              <span>Projects</span>
              <input checked={backupRestoreSelection.projects} onChange={(event) => setBackupRestoreSelection((current) => ({ ...current, projects: event.target.checked }))} type="checkbox" />
            </label>
            <label className="toggle-row" style={{ padding: '10px 12px', margin: 0, border: '1px solid var(--panel-border)', borderRadius: '14px', background: 'var(--surface-soft)', flexWrap: 'wrap' }}>
              <span>Sessions</span>
              <input checked={backupRestoreSelection.sessions} onChange={(event) => setBackupRestoreSelection((current) => ({ ...current, sessions: event.target.checked }))} type="checkbox" />
            </label>
            <label className="toggle-row" style={{ padding: '10px 12px', margin: 0, border: '1px solid var(--panel-border)', borderRadius: '14px', background: 'var(--surface-soft)', flexWrap: 'wrap' }}>
              <span>Workspace</span>
              <input checked={backupRestoreSelection.workspace} onChange={(event) => setBackupRestoreSelection((current) => ({ ...current, workspace: event.target.checked }))} type="checkbox" />
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button className="ghost" onClick={cancelImportBackup} type="button" aria-label="Cancel restoring the backup">Cancel</button>
            <button className="primary" onClick={confirmImportBackup} type="button" aria-label="Restore the selected backup items">Restore selected items</button>
          </div>
        </div>
    </Dialog>
  );
}
