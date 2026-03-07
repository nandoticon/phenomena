// @ts-nocheck
import React from 'react';
import { Book, Edit3, Archive, Link as LinkIcon, Plus, Music, Maximize, EyeOff, FolderOpen } from 'lucide-react';

export function ProjectsView({
  activeProjetos, activeProject, setActiveProject, setMode, setSecondsLeft,
  updateProject, createNewProject, archiveActiveProject, newProjectName, setNewProjectName,
  newProjectNote, setNewProjectNote, removeAttachment, newAttachmentLabel, setNewAttachmentLabel,
  newAttachmentUrl, setNewAttachmentUrl, addAttachment, archivedProjetos, restoreProject,
  ambientPresets, toggleFullscreen, isFullscreen
}: any) {
  return (
    <section className="page-container workspace-projects">
      <div className="today-two-column-layout">

        {/* Main Column: Project Selection and Details */}
        <div className="today-main-col">
          <article className="card panel project-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow"><Book size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> Projects</p>
                <h2>Active Projects</h2>
              </div>
            </div>

            <div className="project-list" style={{ marginBottom: '24px' }}>
              {activeProjetos.map((project: any) => (
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

            <div style={{ background: 'var(--surface-soft)', padding: '20px', borderRadius: '20px', border: '1px solid var(--panel-border)' }}>
              <div className="panel-head" style={{ marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Edit3 size={18} /> Project Settings</h3>
                <button className="ghost" disabled={activeProjetos.length <= 1} onClick={archiveActiveProject} type="button" style={{ fontSize: '0.8rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Archive size={14} /> Archive Project
                </button>
              </div>

              <label className="input-block" style={{ padding: 0, marginBottom: '16px', background: 'transparent', border: 'none' }}>
                <span style={{ marginBottom: '8px' }}>Project Name</span>
                <input style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProject((project: any) => ({ ...project, name: event.target.value || project.name }))} value={activeProject.name} type="text" />
              </label>
              <label className="input-block" style={{ padding: 0, background: 'transparent', border: 'none' }}>
                <span style={{ marginBottom: '8px' }}>Project Note</span>
                <input style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProject((project: any) => ({ ...project, note: event.target.value }))} value={activeProject.note} type="text" placeholder="Short description or context..." />
              </label>
            </div>

            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px dashed var(--panel-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={18} /> New Project</h3>
                <button className="primary" onClick={createNewProject} type="button" style={{ padding: '8px 20px', borderRadius: '16px', fontSize: '0.9rem' }}>Create</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '16px' }}>
                <label className="input-block" style={{ padding: 0, background: 'transparent', border: 'none' }}>
                  <span style={{ marginBottom: '8px' }}>Project Name</span>
                  <input style={{ background: 'var(--input-bg)' }} onChange={(event) => setNewProjectName(event.target.value)} value={newProjectName} type="text" placeholder="Example: My New Story" />
                </label>
                <label className="input-block" style={{ padding: 0, background: 'transparent', border: 'none' }}>
                  <span style={{ marginBottom: '8px' }}>Brief Note (Optional)</span>
                  <input style={{ background: 'var(--input-bg)' }} onChange={(event) => setNewProjectNote(event.target.value)} value={newProjectNote} type="text" placeholder="Ex: Revise the opening chapter." />
                </label>
              </div>
            </div>

          </article>
        </div>

        {/* Sidebar: Attachments & Climate */}
        <div className="today-sidebar-col">

          {/* Attachments & Links Panel */}
          <article className="card panel attachment-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow"><LinkIcon size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> Resources</p>
                <h2>Project Links</h2>
              </div>
            </div>

            <div className="attachment-stack" style={{ marginTop: 0 }}>
              {activeProject.attachments.length ? (
                <div className="attachment-list" style={{ marginBottom: '20px' }}>
                  {activeProject.attachments.map((attachment: any) => (
                    <div className="attachment-item" key={attachment.id} style={{ background: 'var(--surface-soft)', padding: '12px 16px', borderRadius: '16px' }}>
                      <a className="link-button" href={attachment.url} rel="noreferrer" target="_blank" style={{ fontWeight: 600 }}>{attachment.label}</a>
                      <button className="ghost" onClick={() => removeAttachment(attachment.id)} type="button" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Remove</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted-copy" style={{ marginBottom: '20px' }}>Add links to your draft, notes, or outlines here.</p>
              )}

              <div className="attachment-form" style={{ padding: '20px', borderRadius: '20px', background: 'var(--surface-soft)', border: '1px dashed var(--panel-border)' }}>
                <label className="input-block" style={{ padding: 0, marginBottom: '0', background: 'transparent', border: 'none' }}>
                  <span style={{ marginBottom: '8px' }}>Link Title</span>
                  <input style={{ background: 'var(--input-bg)' }} onChange={(event) => setNewAttachmentLabel(event.target.value)} type="text" value={newAttachmentLabel} placeholder="Story Outline" />
                </label>
                <label className="input-block" style={{ padding: 0, marginBottom: '0', background: 'transparent', border: 'none' }}>
                  <span style={{ marginBottom: '8px' }}>URL</span>
                  <input style={{ background: 'var(--input-bg)' }} onChange={(event) => setNewAttachmentUrl(event.target.value)} type="url" value={newAttachmentUrl} placeholder="https://docs.google.com..." />
                </label>
                <button className="ghost" onClick={addAttachment} type="button" style={{ gridColumn: '1 / -1', width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', marginTop: '4px', border: 'none' }}>Add Link</button>
              </div>
            </div>
          </article>

          {/* Environmental Panel */}
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
                <select style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProject((project: any) => ({ ...project, cueTheme: event.target.value as string }))} value={activeProject.cueTheme}>
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

          {archivedProjetos.length ? (
            <article className="card panel archive-hideout" style={{ opacity: 0.8 }}>
              <div className="panel-head">
                <p className="eyebrow" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}><Archive size={14} /> Archived Projects</p>
              </div>
              <div className="archive-list">
                {archivedProjetos.map((project: any) => (
                  <div className="archive-item" key={project.id} style={{ padding: '10px 14px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.9rem' }}>{project.name}</span>
                    <button className="ghost" onClick={() => restoreProject(project.id)} type="button" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>Restore</button>
                  </div>
                ))}
              </div>
            </article>
          ) : null}

        </div>
      </div>
    </section>
  );
}
