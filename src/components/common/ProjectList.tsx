import React from 'react';
import { FolderOpen, Plus } from 'lucide-react';
import type { Project } from '../../types';

interface ProjectListProps {
  activeProjects: Project[];
  activeProject: Project | undefined;
  setActiveProject: (projectId: string) => void;
  setMode: (mode: 'idle' | 'sprint' | 'break') => void;
  setSecondsLeft: (value: number) => void;
}

export function ProjectList({ activeProjects, activeProject, setActiveProject, setMode, setSecondsLeft }: ProjectListProps) {
  return (
    <div className="project-list" style={{ marginBottom: '24px' }}>
      {activeProjects && activeProjects.length > 0 ? (
        activeProjects.map((project) => (
          <button
            className={activeProject && project.id === activeProject.id ? 'project-card active' : 'project-card'}
            key={project.id}
            onClick={() => {
              setActiveProject(project.id);
              setMode('idle');
              setSecondsLeft(project.sprintMinutes * 60);
            }}
            aria-pressed={project.id === activeProject?.id}
            aria-label={`Open project ${project.name}`}
            type="button"
            style={{ textAlign: 'left', width: '100%' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem' }}>
                <FolderOpen size={18} style={{ color: project.id === activeProject?.id ? 'var(--accent)' : 'var(--muted)' }} /> 
                {project.name}
              </strong>
              <span className="streak-pill" style={{ 
                margin: 0, 
                padding: '4px 12px', 
                background: project.id === activeProject?.id ? 'var(--accent)' : 'var(--accent-soft)', 
                borderRadius: '999px', 
                fontSize: '0.75rem', 
                fontWeight: 700,
                color: project.id === activeProject?.id ? '#fff' : 'var(--accent)',
                transition: 'all 0.3s ease'
              }}>
                {project.streak} DAY STREAK
              </span>
            </div>
            <span style={{ fontSize: '0.9rem', color: 'var(--muted)', display: 'block', lineHeight: 1.4 }}>
              {project.note || 'No notes yet. Add one to capture this project’s direction.'}
            </span>
          </button>
        ))
      ) : (
        <div className="empty-state" style={{ 
          padding: '48px 24px', 
          textAlign: 'center', 
          background: 'var(--surface-soft)', 
          borderRadius: '24px', 
          border: '1px dashed var(--panel-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Plus size={32} style={{ opacity: 0.2 }} />
          <p style={{ color: 'var(--muted)', margin: 0 }}>No active projects yet. Create one below to begin.</p>
        </div>
      )}
    </div>
  );
}
