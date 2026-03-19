import { useRef } from 'react';
import { Dialog } from './Dialog';

interface ConfirmDeleteModalProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  titleId: string;
}

export function ConfirmDeleteModal({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  titleId,
}: ConfirmDeleteModalProps) {
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);
  const descriptionId = `${titleId}-description`;
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      className="modal-content card"
      style={{ maxWidth: '400px', textAlign: 'center' }}
      labelledBy={titleId}
      describedBy={`${titleId}-description`}
      initialFocusRef={confirmButtonRef}
    >
        <div className="panel-head" style={{ justifyContent: 'center' }}>
          <h3 style={{ margin: 0 }} id={titleId}>{title}</h3>
        </div>

        <p id={descriptionId} style={{ color: 'var(--muted)', margin: '16px 0 32px', lineHeight: 1.5 }}>
          {description}
        </p>

        <div className="button-row-modal">
          <button
            ref={confirmButtonRef}
            className="primary"
            onClick={onConfirm}
            style={{ background: 'var(--accent)', color: '#fff' }}
            type="button"
          >
            Yes, Delete
          </button>
          <button className="ghost" onClick={onCancel} aria-label="Cancel deletion" type="button">
            Cancel
          </button>
        </div>
    </Dialog>
  );
}
