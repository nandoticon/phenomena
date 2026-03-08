import React, { memo } from 'react';
import { CloudPanel } from '../common/CloudPanel';
import { LocalDataPanel } from '../common/LocalDataPanel';
import { PreferencesPanel } from '../common/PreferencesPanel';

function AccountViewComponent({
  hasSupabaseConfig, session, remoteUpdatedAt, authView, setAuthView,
  authEmail, setAuthEmail, authPassword, setAuthPassword, authPasswordConfirm, setAuthPasswordConfirm,
  signInWithPassword, signUpWithPassword, sendPasswordReset, updatePassword, signOut,
  authMessage, remoteSnapshot, getProjectAttachmentCount, normalizedMessage,
  profile, updateProfile, applyProfileDefaultsToActiveProject, profileMessage, passwordMessage,
  activeProject, updateProject, reminderStatus, enableNotifications, exportBackup, fileInputRef,
  importBackup, importMessage, setUiTheme, uiTheme, formatCloudTimestamp
}: any) {
  return (
    <section className="page-container workspace-account">
      <div className="two-column-layout">
        <CloudPanel {...{
          hasSupabaseConfig, session, formatCloudTimestamp, remoteUpdatedAt,
          authView, setAuthView, authEmail, setAuthEmail, authPassword, setAuthPassword,
          authPasswordConfirm, setAuthPasswordConfirm, signInWithPassword, signUpWithPassword,
          sendPasswordReset, updatePassword, signOut, authMessage, remoteSnapshot,
          getProjectAttachmentCount, normalizedMessage
        }} />

        <LocalDataPanel {...{
          activeProject, updateProject, enableNotifications, reminderStatus,
          exportBackup, fileInputRef, importBackup, importMessage,
          session, profile, authPassword, setAuthPassword, authPasswordConfirm,
          setAuthPasswordConfirm, updatePassword, passwordMessage
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
