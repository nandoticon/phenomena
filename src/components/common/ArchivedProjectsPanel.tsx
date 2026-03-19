import React from 'react';
import { Archive } from 'lucide-react';
import type { Project } from '../../types';

interface ArchivedProjectsPanelProps {
  archivedProjetos: Project[];
  restoreProject: (projectId: string) => void;
}

export function ArchivedProjectsPanel({ archivedProjetos, restoreProject }: ArchivedProjectsPanelProps) {
  if (!archivedProjetos.length) return null;

  return (
    <article className="card panel archive-hideout" style={{ opacity: 0.8 }}>
      <div className="panel-head">
        <p className="eyebrow" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}><Archive size={14} /> Archived Projects</p>
      </div>
      <div className="archive-list">
        {archivedProjetos.map((project) => (
          <div className="archive-item" key={project.id} style={{ padding: '10px 14px', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.9rem' }}>{project.name}</span>
            <button className="ghost" onClick={() => restoreProject(project.id)} type="button" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>Restore</button>
          </div>
        ))}
      </div>
    </article>
  );
}
