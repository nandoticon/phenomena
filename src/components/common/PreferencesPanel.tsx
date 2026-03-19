import React from 'react';
import { Settings } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import type { Profile, UiTheme, ProfileEditableKey } from '../../types';

interface PreferencesPanelProps {
  session: unknown;
  profile: Profile | null;
  applyProfileDefaultsToActiveProject: () => void;
  uiTheme: UiTheme;
  setUiTheme: Dispatch<SetStateAction<UiTheme>>;
  updateProfile: <K extends ProfileEditableKey>(key: K, value: Profile[K]) => void;
  profileMessage: string;
}

export function PreferencesPanel({
  session, profile, applyProfileDefaultsToActiveProject, uiTheme, setUiTheme,
  updateProfile, profileMessage
}: PreferencesPanelProps) {
  if (!session || !profile) return null;

  return (
    <article className="card panel settings-panel" style={{ marginTop: '24px', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '6px' }}><Settings size={14} /> Preferences</p>
          <h2 style={{ fontSize: '1.4rem' }}>Workspace Defaults</h2>
          <p style={{ color: 'var(--muted)', marginTop: '8px', maxWidth: '100%', lineHeight: 1.5, fontSize: '0.9rem' }}>
            These settings act as defaults for all new projects and sync across your devices.
          </p>
        </div>
        <button className="primary" onClick={applyProfileDefaultsToActiveProject} type="button" style={{ padding: '10px 20px', borderRadius: '16px', fontSize: '0.85rem', width: 'auto' }}>Apply to Current Project</button>
      </div>

      <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '16px' }}>
        <div style={{ padding: '16px', background: 'var(--surface-soft)', borderRadius: '24px', border: '1px solid var(--panel-border)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>Appearance</h3>
          <label className="input-block compact" style={{ padding: 0, background: 'transparent', border: 'none' }}>
            <span style={{ marginBottom: '8px' }}>Theme</span>
            <select style={{ background: 'var(--input-bg)' }} onChange={(event) => setUiTheme(event.target.value as UiTheme)} value={uiTheme}>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </label>
        </div>

        <div style={{ padding: '16px', background: 'var(--surface-soft)', borderRadius: '24px', border: '1px solid var(--panel-border)' }}>
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

        <div style={{ padding: '16px', background: 'var(--surface-soft)', borderRadius: '24px', border: '1px solid var(--panel-border)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>Timer Defaults</h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <label className="input-block compact" style={{ flex: '1 1 120px', padding: 0, background: 'transparent', border: 'none' }}>
              <span style={{ marginBottom: '8px' }}>Default Sprint Duration</span>
              <select style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProfile('default_sprint_minutes', Number(event.target.value))} value={profile.default_sprint_minutes}>
                <option value={10}>10 min</option>
                <option value={15}>15 min</option>
                <option value={20}>20 min</option>
                <option value={25}>25 min</option>
                <option value={45}>45 min</option>
              </select>
            </label>
            <label className="input-block compact" style={{ flex: '1 1 120px', padding: 0, background: 'transparent', border: 'none' }}>
              <span style={{ marginBottom: '8px' }}>Default Break Duration</span>
              <select style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProfile('default_break_minutes', Number(event.target.value))} value={profile.default_break_minutes}>
                <option value={3}>3 min</option>
                <option value={5}>5 min</option>
                <option value={8}>8 min</option>
              </select>
            </label>
          </div>
        </div>

        <div style={{ padding: '16px', background: 'var(--surface-soft)', borderRadius: '24px', border: '1px solid var(--panel-border)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>Email Notifications</h3>
          <label className="input-block compact" style={{ padding: 0, marginBottom: '16px', background: 'transparent', border: 'none' }}>
            <span style={{ marginBottom: '8px' }}>Notification Channel</span>
            <select style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProfile('reminder_channel', event.target.value as Profile['reminder_channel'])} value={profile.reminder_channel}>
              <option value="browser">Browser only</option>
              <option value="email">Email only</option>
              <option value="both">Both browser and email</option>
            </select>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '16px', alignItems: 'center' }}>
            <label className="toggle-row" style={{ padding: 0, background: 'transparent', border: 'none', flexWrap: 'wrap' }}>
              <span style={{ margin: 0, wordBreak: 'break-word' }}>Enable Email Reminders</span>
              <input style={{ width: 'auto' }} checked={profile.email_reminders_enabled} onChange={(event) => updateProfile('email_reminders_enabled', event.target.checked)} type="checkbox" />
            </label>
            <label className="input-block compact" style={{ padding: 0, background: 'transparent', border: 'none' }}>
              <input style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProfile('email_reminder_time', event.target.value)} type="time" value={profile.email_reminder_time} />
            </label>
          </div>
        </div>
      </div>
      {profileMessage ? <div className="status ready" role="status" aria-live="polite" aria-atomic="true" style={{ marginTop: '24px', padding: '16px', fontSize: '1rem', background: 'rgba(167, 224, 104, 0.1)', color: 'var(--success)', borderRadius: '16px', border: '1px solid var(--success)' }}>{profileMessage}</div> : null}
    </article>
  );
}
