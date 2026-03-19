import React from 'react';
import { Music, EyeOff, Maximize } from 'lucide-react';
import type { Project } from '../../types';

type AmbientPreset = { label: string; url: string };

interface EnvironmentPanelProps {
  ambientPresets: AmbientPreset[];
  activeProject: Project;
  updateProject: (updater: (project: Project) => Project) => void;
  toggleFullscreen: () => void;
  isFullscreen: boolean;
}

export function EnvironmentPanel({ ambientPresets, activeProject, updateProject, toggleFullscreen, isFullscreen }: EnvironmentPanelProps) {
  const audioUrlId = 'ambient-audio-url';
  const themeId = 'ambient-theme';

  return (
    <article className="card panel ambient-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow"><Music size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> Environment</p>
          <h2>Atmosphere & Focus</h2>
        </div>
      </div>
      <div className="utility-grid">
        <label className="input-block compact" htmlFor={audioUrlId} style={{ padding: 0, background: 'transparent', border: 'none' }}>
          <span style={{ marginBottom: '8px' }}>Ambient Audio URL</span>
          <input id={audioUrlId} style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProject((project) => ({ ...project, soundtrackUrl: event.target.value }))} type="url" value={activeProject.soundtrackUrl} />
        </label>
        <div className="preset-row">
          {ambientPresets.map((preset) => (
            <button key={preset.label} className="pill" onClick={() => updateProject((project) => ({ ...project, soundtrackUrl: preset.url }))} type="button" style={{ fontSize: '0.8rem', padding: '8px 12px' }} aria-label={`Use ambient preset ${preset.label}`}>
              {preset.label}
            </button>
          ))}
        </div>
        <label className="input-block compact" htmlFor={themeId} style={{ padding: 0, marginTop: '8px', background: 'transparent', border: 'none' }}>
          <span style={{ marginBottom: '8px' }}>Theme</span>
          <select id={themeId} style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProject((project) => ({ ...project, cueTheme: event.target.value as Project['cueTheme'] }))} value={activeProject.cueTheme}>
            <option value="embers">Embers</option>
            <option value="mist">Mist</option>
            <option value="moonlight">Moonlight</option>
          </select>
        </label>
        <div className="button-row utility-buttons two-up">
          <a className="ghost link-button" href={activeProject.soundtrackUrl} rel="noreferrer" target="_blank" style={{ color: 'var(--accent)' }} aria-label="Open ambient audio in a new tab">
            Play Audio
          </a>
          <button className="primary" onClick={toggleFullscreen} type="button" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }} aria-label={isFullscreen ? 'Exit fullscreen mode' : 'Enter fullscreen mode'}>
            {isFullscreen ? <EyeOff size={16} /> : <Maximize size={16} />}
            {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          </button>
        </div>
      </div>
    </article>
  );
}
