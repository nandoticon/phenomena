import React from 'react';
import { Music, EyeOff, Maximize } from 'lucide-react';

export function EnvironmentPanel({ ambientPresets, activeProject, updateProject, toggleFullscreen, isFullscreen }: any) {
  return (
    <article className="card panel ambient-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow"><Music size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> Environment</p>
          <h2>Atmosphere & Focus</h2>
        </div>
      </div>
      <div className="utility-grid">
        <label className="input-block compact" style={{ padding: 0, background: 'transparent', border: 'none' }}>
          <span style={{ marginBottom: '8px' }}>Background Audio (URL)</span>
          <input style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProject((project: any) => ({ ...project, soundtrackUrl: event.target.value }))} type="url" value={activeProject.soundtrackUrl} />
        </label>
        <div className="preset-row">
          {ambientPresets.map((preset: any) => (
            <button key={preset.label} className="pill" onClick={() => updateProject((project: any) => ({ ...project, soundtrackUrl: preset.url }))} type="button" style={{ fontSize: '0.8rem', padding: '8px 12px' }}>
              {preset.label}
            </button>
          ))}
        </div>
        <label className="input-block compact" style={{ padding: 0, marginTop: '8px', background: 'transparent', border: 'none' }}>
          <span style={{ marginBottom: '8px' }}>Visual Theme</span>
          <select style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProject((project: any) => ({ ...project, cueTheme: event.target.value }))} value={activeProject.cueTheme}>
            <option value="embers">Embers</option>
            <option value="mist">Mist</option>
            <option value="moonlight">Moonlight</option>
          </select>
        </label>
        <div className="button-row utility-buttons two-up">
          <a className="ghost link-button" href={activeProject.soundtrackUrl} rel="noreferrer" target="_blank" style={{ color: 'var(--accent)' }}>Play Audio</a>
          <button className="primary" onClick={toggleFullscreen} type="button" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
            {isFullscreen ? <EyeOff size={16} /> : <Maximize size={16} />}
            {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          </button>
        </div>
      </div>
    </article>
  );
}
