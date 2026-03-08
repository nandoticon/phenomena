import React from 'react';
import { FolderOpen } from 'lucide-react';

export function ProjectList({ activeProjetos, activeProject, setActiveProject, setMode, setSecondsLeft }: any) {
  return (
    <div className="project-list" style={{ marginBottom: '24px' }}>
      {activeProjetos?.map((project: any) => (
        <button
          className={project.id === activeProject.id ? 'project-card active' : 'project-card'}
          key={project.id}
          onClick={() => {
            setActiveProject(project.id);
            setMode('idle');
            setSecondsLeft(project.sprintMinutes * 60);
          }}
          type="button"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FolderOpen size={16} style={{ color: 'var(--muted)' }} /> {project.name}</strong>
            <span style={{ margin: 0, padding: '4px 8px', background: 'rgba(255, 122, 89, 0.1)', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--accent)' }}>
              {project.streak} day streak
            </span>
          </div>
          <span>{project.note || 'No notes yet. Click to select a goal.'}</span>
        </button>
      ))}
    </div>
  );
}
