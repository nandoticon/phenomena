import { createPortal } from 'react-dom';
import type { CSSProperties } from 'react';

interface ToastNotificationProps {
  message: string;
  type?: 'info' | 'success';
  onUndo?: () => void;
  onClose: () => void;
  style?: CSSProperties;
}

export function ToastNotification({ message, type, onUndo, onClose, style }: ToastNotificationProps) {
  return createPortal(
    <div className={`toast-container ${type || ''}`} style={style} role="status" aria-live="polite" aria-atomic="true">
      <div className="toast-content">
        <span className="toast-message">{message}</span>
        {onUndo ? (
          <button className="toast-action" onClick={onUndo} type="button">Undo</button>
        ) : null}
        <button className="toast-close" onClick={onClose} type="button" aria-label="Dismiss notification">✕</button>
      </div>
    </div>,
    document.body,
  );
}
