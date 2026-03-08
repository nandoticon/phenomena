import React from 'react';
import { Link as LinkIcon } from 'lucide-react';

export function LinksPanel({ activeProject, removeAttachment, newAttachmentLabel, setNewAttachmentLabel, newAttachmentUrl, setNewAttachmentUrl, addAttachment }: any) {
  return (
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
  );
}
