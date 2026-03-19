import React from 'react';
import { Edit3, Archive } from 'lucide-react';
import type { Project } from '../../types';

interface ProjectSettingsPanelProps {
  activeProjetos: Project[];
  activeProject: Project;
  updateProject: (updater: (project: Project) => Project) => void;
  archiveActiveProject: () => void;
}

export function ProjectSettingsPanel({ activeProjetos, activeProject, updateProject, archiveActiveProject }: ProjectSettingsPanelProps) {
  return (
    <div style={{ background: 'var(--surface-soft)', padding: '20px', borderRadius: '20px', border: '1px solid var(--panel-border)' }}>
      <div className="panel-head" style={{ marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Edit3 size={18} /> Project Settings</h3>
        <button className="ghost" disabled={activeProjetos.length <= 1} onClick={archiveActiveProject} type="button" style={{ fontSize: '0.8rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Archive size={14} /> Archive Project
        </button>
      </div>

      <label className="input-block" style={{ padding: 0, marginBottom: '16px', background: 'transparent', border: 'none' }}>
        <span style={{ marginBottom: '8px' }}>Project Name</span>
        <input style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProject((project) => ({ ...project, name: event.target.value || project.name }))} value={activeProject.name} type="text" />
      </label>
      <label className="input-block" style={{ padding: 0, background: 'transparent', border: 'none' }}>
        <span style={{ marginBottom: '8px' }}>Project Note</span>
        <input style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProject((project) => ({ ...project, note: event.target.value }))} value={activeProject.note} type="text" placeholder="Short description or context" />
      </label>
    </div>
  );
}
