import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, MutableRefObject, ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
  style?: CSSProperties;
  overlayStyle?: CSSProperties;
  labelledBy?: string;
  describedBy?: string;
  initialFocusRef?: MutableRefObject<HTMLElement | null>;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export function Dialog({
  open,
  onClose,
  children,
  className = 'card panel',
  overlayClassName = 'modal-overlay',
  style,
  overlayStyle,
  labelledBy,
  describedBy,
  initialFocusRef,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      initialFocusRef?.current?.focus?.();
      if (!initialFocusRef?.current) {
        dialogRef.current?.focus();
      }
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [initialFocusRef, open]);

  if (!open) {
    return null;
  }

  const trapFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (closeOnEscape && event.key === 'Escape') {
      event.stopPropagation();
      onClose();
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

  return createPortal(
    <div
      className={overlayClassName}
      role="presentation"
      style={overlayStyle}
      onMouseDown={(event) => {
        if (closeOnOverlayClick && event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className={className}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        onKeyDown={trapFocus}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
