import { createPortal } from 'react-dom';
import { useEffect, useRef } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

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
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);
  const descriptionId = `${titleId}-description`;

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousFocus = document.activeElement as HTMLElement | null;
    confirmButtonRef.current?.focus();

    return () => {
      previousFocus?.focus?.();
    };
  }, [open]);

  const trapFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      onCancel();
      return;
    }

    if (event.key !== 'Tab' || !dialogRef.current) {
      return;
    }

    const focusable = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );

    if (!focusable.length) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="modal-overlay" onClick={onCancel}>
      <div
        ref={dialogRef}
        className="modal-content card"
        style={{ maxWidth: '400px', textAlign: 'center' }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        onKeyDown={trapFocus}
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
      </div>
    </div>,
    document.body,
  );
}
