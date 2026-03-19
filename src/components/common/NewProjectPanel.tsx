import React from 'react';
import { Plus } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';

interface NewProjectPanelProps {
  createNewProject: () => void;
  newProjectName: string;
  setNewProjectName: Dispatch<SetStateAction<string>>;
  newProjectNote: string;
  setNewProjectNote: Dispatch<SetStateAction<string>>;
}

export function NewProjectPanel({ createNewProject, newProjectName, setNewProjectName, newProjectNote, setNewProjectNote }: NewProjectPanelProps) {
  const projectNameId = 'new-project-name';
  const projectNoteId = 'new-project-note';

  return (
    <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px dashed var(--panel-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={18} /> New Project</h3>
        <button className="primary" onClick={createNewProject} type="button" style={{ padding: '8px 20px', borderRadius: '16px', fontSize: '0.9rem' }} aria-label="Create new project">
          Create
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '16px' }}>
        <label className="input-block" htmlFor={projectNameId} style={{ padding: 0, background: 'transparent', border: 'none' }}>
          <span style={{ marginBottom: '8px' }}>Project Name</span>
          <input id={projectNameId} style={{ background: 'var(--input-bg)' }} onChange={(event) => setNewProjectName(event.target.value)} value={newProjectName} type="text" placeholder="Example: My New Story" />
        </label>
        <label className="input-block" htmlFor={projectNoteId} style={{ padding: 0, background: 'transparent', border: 'none' }}>
          <span style={{ marginBottom: '8px' }}>Brief Note (Optional)</span>
          <input id={projectNoteId} style={{ background: 'var(--input-bg)' }} onChange={(event) => setNewProjectNote(event.target.value)} value={newProjectNote} type="text" placeholder="Ex: Revise the opening chapter." />
        </label>
      </div>
    </div>
  );
}
