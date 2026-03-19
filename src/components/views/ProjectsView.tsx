import React, { memo } from 'react';
import { Book } from 'lucide-react';
import { ProjectList } from '../common/ProjectList';
import { ProjectSettingsPanel } from '../common/ProjectSettingsPanel';
import { NewProjectPanel } from '../common/NewProjectPanel';
import { LinksPanel } from '../common/LinksPanel';
import { EnvironmentPanel } from '../common/EnvironmentPanel';
import { ArchivedProjectsPanel } from '../common/ArchivedProjectsPanel';
import type { Dispatch, SetStateAction } from 'react';
import type { NotificationState, Project } from '../../types';

type AmbientPreset = { label: string; url: string };

interface ProjectsViewProps {
  activeProjetos: Project[];
  activeProject: Project | undefined;
  setActiveProject: (projectId: string) => void;
  setMode: (mode: 'idle' | 'sprint' | 'break') => void;
  setSecondsLeft: Dispatch<SetStateAction<number>>;
  updateProject: (updater: (project: Project) => Project) => void;
  createNewProject: () => void;
  archiveActiveProject: () => void;
  toggleReminder: () => void;
  notificationState: NotificationState;
  getReminderStatus: (notificationState: NotificationState, reminderEnabled: boolean) => string;
  newProjectName: string;
  setNewProjectName: Dispatch<SetStateAction<string>>;
  newProjectNote: string;
  setNewProjectNote: Dispatch<SetStateAction<string>>;
  removeAttachment: (attachmentId: string) => void;
  newAttachmentLabel: string;
  setNewAttachmentLabel: Dispatch<SetStateAction<string>>;
  newAttachmentUrl: string;
  setNewAttachmentUrl: Dispatch<SetStateAction<string>>;
  addAttachment: () => void;
  archivedProjetos: Project[];
  restoreProject: (projectId: string) => void;
  ambientPresets: AmbientPreset[];
  toggleFullscreen: () => void;
  isFullscreen: boolean;
}

function ProjectsViewComponent({
  activeProjetos, activeProject, setActiveProject, setMode, setSecondsLeft,
  updateProject, createNewProject, archiveActiveProject, newProjectName, setNewProjectName,
  newProjectNote, setNewProjectNote, removeAttachment, newAttachmentLabel, setNewAttachmentLabel,
  newAttachmentUrl, setNewAttachmentUrl, addAttachment, archivedProjetos, restoreProject,
  ambientPresets, toggleFullscreen, isFullscreen
}: ProjectsViewProps) {
  const safeActiveProject = activeProject ?? activeProjetos[0];
  return (
    <section className="page-container workspace-projects">
      <div className="today-two-column-layout">
        <div className="today-main-col">
          <article className="card panel project-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow"><Book size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> Projects</p>
                <h1 style={{ fontSize: '1.4rem', margin: 0 }}>Active Projects</h1>
              </div>
            </div>

            <ProjectList {...{
              activeProjetos, activeProject: safeActiveProject, setActiveProject, setMode, setSecondsLeft
            }} />

            <ProjectSettingsPanel {...{
              activeProjetos, activeProject: safeActiveProject, updateProject, archiveActiveProject
            }} />

            <NewProjectPanel {...{
              createNewProject, newProjectName, setNewProjectName,
              newProjectNote, setNewProjectNote
            }} />
          </article>
        </div>

        <div className="today-sidebar-col">
          <LinksPanel {...{
            activeProject: safeActiveProject, removeAttachment, newAttachmentLabel,
            setNewAttachmentLabel, newAttachmentUrl, setNewAttachmentUrl,
            addAttachment
          }} />

          <EnvironmentPanel {...{
            ambientPresets, activeProject: safeActiveProject, updateProject,
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
