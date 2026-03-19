import React from 'react';
import { Archive, Combine } from 'lucide-react';
import type { Project } from '../../types';

interface ArchivedProjectsPanelProps {
  archivedProjetos: Project[];
  restoreProject: (projectId: string) => void;
  mergeIntoActiveProject: (projectId: string) => void;
}

export function ArchivedProjectsPanel({ archivedProjetos, restoreProject, mergeIntoActiveProject }: ArchivedProjectsPanelProps) {
  if (!archivedProjetos.length) return null;

  return (
    <article className="card panel archive-hideout" style={{ opacity: 0.8 }}>
      <div className="panel-head">
        <p className="eyebrow" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}><Archive size={14} /> Archived Projects</p>
      </div>
      <details className="compact-fold" open={false} style={{ border: '1px solid var(--panel-border)', borderRadius: '18px', background: 'var(--surface-soft)', padding: '12px 14px' }}>
        <summary style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', listStyle: 'none' }}>
          <strong>Show archived projects</strong>
          <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{archivedProjetos.length} items</span>
        </summary>
        <div className="archive-list" style={{ marginTop: '12px' }}>
          {archivedProjetos.map((project) => (
            <div className="archive-item" key={project.id} style={{ padding: '10px 14px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.9rem' }}>{project.name}</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button className="ghost" onClick={() => restoreProject(project.id)} type="button" style={{ padding: '4px 10px', fontSize: '0.8rem' }} aria-label={`Restore archived project ${project.name}`}>
                  Restore
                </button>
                <button className="ghost" onClick={() => mergeIntoActiveProject(project.id)} type="button" style={{ padding: '4px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }} aria-label={`Merge archived project ${project.name} into the active project`}>
                  <Combine size={12} /> Merge
                </button>
              </div>
            </div>
          ))}
        </div>
      </details>
    </article>
  );
}
