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
  const reminderHealth = safeActiveProject
    ? (safeActiveProject.reminderEnabled
      ? (safeActiveProject.reminderTime ? `On at ${safeActiveProject.reminderTime}` : 'On')
      : 'Off')
    : 'None';

  return (
    <section className="page-container workspace-projects">
      <header className="workspace-header">
        <div className="workspace-header-copy">
          <p className="eyebrow"><Book size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> Projects</p>
          <h1 style={{ margin: 0 }}>Project Desk</h1>
          <p className="lede">Manage active work, tune the current project, and keep supporting material close without burying the main list.</p>
        </div>

        <div className="workspace-header-stats workspace-header-stats-four">
          <div className="workspace-stat-card">
            <span className="summary-label">Active</span>
            <strong className="summary-value">{activeProjects.length}</strong>
          </div>
          <div className="workspace-stat-card">
            <span className="summary-label">Reminder</span>
            <strong className="summary-value workspace-stat-copy">{reminderHealth}</strong>
          </div>
          <div className="workspace-stat-card">
            <span className="summary-label">Archived</span>
            <strong className="summary-value">{archivedProjetos.length}</strong>
          </div>
          <div className="workspace-stat-card">
            <span className="summary-label">Focus</span>
            <strong className="summary-value workspace-stat-copy">{safeActiveProject?.name ?? 'None selected'}</strong>
          </div>
        </div>
      </header>

      <div className="workspace-split-layout workspace-projects-layout">
        <div className="workspace-main-stack">
          <article className="card panel project-panel workspace-hero-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow"><Book size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> Active Projects</p>
                <h2 style={{ margin: 0 }}>Choose what gets your attention next</h2>
              </div>
            </div>

            <ProjectList {...{
              activeProjects, activeProject: safeActiveProject, setActiveProject, setMode, setSecondsLeft
            }} />
          </article>

          <ProjectSetupPanel {...{
            activeProjects, activeProject: safeActiveProject, updateProject, archiveActiveProject,
            duplicateActiveProject, ambientPresets, toggleFullscreen, isFullscreen, toggleReminder, notificationState, getReminderStatus,
            reminderEvents, acknowledgeReminder, refreshReminderInbox, projectNameMap
          }} />
        </div>

        <aside className="workspace-rail-stack">
          <article className="card panel utility-panel workspace-utility-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">New Project</p>
                <h2 style={{ margin: 0 }}>Start something clean</h2>
              </div>
            </div>

            <NewProjectPanel {...{
              createNewProject, newProjectName, setNewProjectName,
              newProjectNote, setNewProjectNote, embedded: true
            }} />
          </article>

          <LinksPanel {...{
            activeProject: safeActiveProject, removeAttachment, newAttachmentLabel,
            setNewAttachmentLabel, newAttachmentUrl, setNewAttachmentUrl,
            addAttachment
          }} />

          <ArchivedProjectsPanel {...{
            archivedProjetos, restoreProject, mergeIntoActiveProject
          }} />
        </aside>
      </div>
    </section>
  );
}
export const ProjectsView = memo(ProjectsViewComponent);
