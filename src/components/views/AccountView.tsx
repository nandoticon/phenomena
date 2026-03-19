import React, { memo } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type { Session } from '@supabase/supabase-js';
import { CloudPanel } from '../common/CloudPanel';
import { LocalDataPanel } from '../common/LocalDataPanel';
import { PreferencesPanel } from '../common/PreferencesPanel';
import type { AppState, BackupPreview, NuvemStatus, Profile, Project, ReminderEvent, SyncQueueState, UiTheme } from '../../types';
import type { SyncConflict } from '../../utils/sync';

interface AccountViewProps {
  hasSupabaseConfig: boolean;
  session: Session | null;
  remoteUpdatedAt: string | null;
  authView: 'sign-in' | 'sign-up' | 'forgot-password' | 'recovery';
  setAuthView: (value: 'sign-in' | 'sign-up' | 'forgot-password' | 'recovery') => void;
  authEmail: string;
  setAuthEmail: Dispatch<SetStateAction<string>>;
  authPassword: string;
  setAuthPassword: Dispatch<SetStateAction<string>>;
  authPasswordConfirm: string;
  setAuthPasswordConfirm: Dispatch<SetStateAction<string>>;
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
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  pullCloudState: () => void;
  pushLocalState: () => void;
  replaceCloudWithLocal: () => void;
  cloudStatus: NuvemStatus;
  remoteLoaded: boolean;
  profile: Profile | null;
  updateProfile: <K extends keyof Profile>(key: K, value: Profile[K]) => void;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  applyProfileDefaultsToActiveProject: () => void;
  profileMessage: string;
  passwordMessage: string;
  activeProject: Project | undefined;
  updateProject: (updater: (project: Project) => Project) => void;
  reminderStatus: string;
  enableNotifications: () => void;
  exportBackup: () => void;
  fileInputRef: MutableRefObject<HTMLInputElement | null>;
  importBackup: (event: React.ChangeEvent<HTMLInputElement>) => void;
  importMessage: string;
  setImportMessage: Dispatch<SetStateAction<string>>;
  setUiTheme: Dispatch<SetStateAction<UiTheme>>;
  uiTheme: UiTheme;
  formatCloudTimestamp: (value: string | null) => string;
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

function AccountViewComponent({
  hasSupabaseConfig, session, remoteUpdatedAt, authView, setAuthView,
  authEmail, setAuthEmail, authPassword, setAuthPassword, authPasswordConfirm, setAuthPasswordConfirm,
  signInWithPassword, signUpWithPassword, sendPasswordReset, updatePassword, signOut,
  authMessage, remoteSnapshot, getProjectAttachmentCount, normalizedMessage, state,
  syncConflict, syncQueue, pullCloudState, pushLocalState, replaceCloudWithLocal, cloudStatus,
  remoteLoaded, profile, setProfile, updateProfile, applyProfileDefaultsToActiveProject, profileMessage, passwordMessage,
  activeProject, updateProject, reminderStatus, enableNotifications, exportBackup, fileInputRef,
  importBackup, importMessage, setUiTheme, uiTheme, formatCloudTimestamp,
  reminderEvents, acknowledgeReminder, refreshReminderInbox, projectNameMap,
  backupName, setBackupName, importPreview, confirmImportBackup, cancelImportBackup
}: AccountViewProps) {
  return (
    <section className="page-container workspace-account">
      <div className="two-column-layout">
        <CloudPanel {...{
          hasSupabaseConfig, session, formatCloudTimestamp, remoteUpdatedAt,
          authView, setAuthView, authEmail, setAuthEmail, authPassword, setAuthPassword,
          authPasswordConfirm, setAuthPasswordConfirm, signInWithPassword, signUpWithPassword,
          sendPasswordReset, updatePassword, signOut, authMessage, remoteSnapshot,
          getProjectAttachmentCount, normalizedMessage, state, syncConflict, syncQueue, cloudStatus,
          pullCloudState, pushLocalState, replaceCloudWithLocal
        }} />

        <LocalDataPanel {...{
          activeProject, updateProject, enableNotifications, reminderStatus,
  exportBackup, fileInputRef, importBackup, importMessage,
  session, profile, authPassword, setAuthPassword, authPasswordConfirm,
  setAuthPasswordConfirm, updatePassword, passwordMessage,
          reminderEvents, acknowledgeReminder, refreshReminderInbox, projectNameMap,
          backupName, setBackupName, importPreview, confirmImportBackup, cancelImportBackup
        }} />
      </div>

      <PreferencesPanel {...{
        session, profile, applyProfileDefaultsToActiveProject, uiTheme, setUiTheme,
        updateProfile, profileMessage
      }} />
    </section>
  );
}
export const AccountView = memo(AccountViewComponent);
