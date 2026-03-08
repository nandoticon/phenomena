import React, { memo } from 'react';
import { Book } from 'lucide-react';
import { ProjectList } from '../common/ProjectList';
import { ProjectSettingsPanel } from '../common/ProjectSettingsPanel';
import { NewProjectPanel } from '../common/NewProjectPanel';
import { LinksPanel } from '../common/LinksPanel';
import { EnvironmentPanel } from '../common/EnvironmentPanel';
import { ArchivedProjectsPanel } from '../common/ArchivedProjectsPanel';

function ProjectsViewComponent({
  activeProjetos, activeProject, setActiveProject, setMode, setSecondsLeft,
  updateProject, createNewProject, archiveActiveProject, newProjectName, setNewProjectName,
  newProjectNote, setNewProjectNote, removeAttachment, newAttachmentLabel, setNewAttachmentLabel,
  newAttachmentUrl, setNewAttachmentUrl, addAttachment, archivedProjetos, restoreProject,
  ambientPresets, toggleFullscreen, isFullscreen
}: any) {
  return (
    <section className="page-container workspace-projects">
      <div className="today-two-column-layout">
        <div className="today-main-col">
          <article className="card panel project-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow"><Book size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> Projects</p>
                <h2>Active Projects</h2>
              </div>
            </div>

            <ProjectList {...{
              activeProjetos, activeProject, setActiveProject, setMode, setSecondsLeft
            }} />

            <ProjectSettingsPanel {...{
              activeProjetos, activeProject, updateProject, archiveActiveProject
            }} />

            <NewProjectPanel {...{
              createNewProject, newProjectName, setNewProjectName,
              newProjectNote, setNewProjectNote
            }} />
          </article>
        </div>

        <div className="today-sidebar-col">
          <LinksPanel {...{
            activeProject, removeAttachment, newAttachmentLabel,
            setNewAttachmentLabel, newAttachmentUrl, setNewAttachmentUrl,
            addAttachment
          }} />

          <EnvironmentPanel {...{
            ambientPresets, activeProject, updateProject,
            toggleFullscreen, isFullscreen
          }} />

          <ArchivedProjectsPanel {...{
            archivedProjetos, restoreProject
          }} />
        </div>
      </div>
    </section>
  );
}
export const ProjectsView = memo(ProjectsViewComponent);
