import React, { memo } from 'react';
import { Book } from 'lucide-react';
import { ProjectList } from '../common/ProjectList';
import { ProjectSetupPanel } from '../common/ProjectSetupPanel';
import { NewProjectPanel } from '../common/NewProjectPanel';
import { LinksPanel } from '../common/LinksPanel';
import { ArchivedProjectsPanel } from '../common/ArchivedProjectsPanel';
import type { Dispatch, SetStateAction } from 'react';
import type { NotificationState, Project, ReminderEvent } from '../../types';

type AmbientPreset = { label: string; url: string };

interface ProjectsViewProps {
  activeProjects: Project[];
  activeProject: Project | undefined;
  setActiveProject: (projectId: string) => void;
  setMode: (mode: 'idle' | 'sprint' | 'break') => void;
  setSecondsLeft: Dispatch<SetStateAction<number>>;
  updateProject: (updater: (project: Project) => Project) => void;
  createNewProject: () => void;
  archiveActiveProject: () => void;
  duplicateActiveProject: () => void;
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
  mergeIntoActiveProject: (projectId: string) => void;
  ambientPresets: AmbientPreset[];
  toggleFullscreen: () => void;
  isFullscreen: boolean;
  reminderEvents: ReminderEvent[];
  acknowledgeReminder: (id: string) => void;
  refreshReminderInbox: () => void;
  projectNameMap: Record<string, string>;
}

function ProjectsViewComponent({
  activeProjects, activeProject, setActiveProject, setMode, setSecondsLeft,
  updateProject, createNewProject, archiveActiveProject, newProjectName, setNewProjectName,
  newProjectNote, setNewProjectNote, removeAttachment, newAttachmentLabel, setNewAttachmentLabel,
  newAttachmentUrl, setNewAttachmentUrl, addAttachment, archivedProjetos, restoreProject,
  mergeIntoActiveProject, ambientPresets, toggleFullscreen, isFullscreen, duplicateActiveProject, toggleReminder, notificationState, getReminderStatus,
  reminderEvents, acknowledgeReminder, refreshReminderInbox, projectNameMap
}: ProjectsViewProps) {
  const safeActiveProject = activeProject ?? activeProjects[0];
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
              activeProjects, activeProject: safeActiveProject, setActiveProject, setMode, setSecondsLeft
            }} />

            <ProjectSetupPanel {...{
              activeProjects, activeProject: safeActiveProject, updateProject, archiveActiveProject,
              duplicateActiveProject, ambientPresets, toggleFullscreen, isFullscreen, toggleReminder, notificationState, getReminderStatus,
              reminderEvents, acknowledgeReminder, refreshReminderInbox, projectNameMap
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

          <ArchivedProjectsPanel {...{
            archivedProjetos, restoreProject, mergeIntoActiveProject
          }} />
        </div>
      </div>
    </section>
  );
}
export const ProjectsView = memo(ProjectsViewComponent);
