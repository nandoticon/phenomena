import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface RememberedDisclosureProps {
  storageKey: string;
  title: string;
  description?: string;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function RememberedDisclosure({
  storageKey,
  title,
  description,
  defaultOpen = false,
  className,
  children,
}: RememberedDisclosureProps) {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return defaultOpen;
    }

    const stored = window.localStorage.getItem(storageKey);
    if (stored === 'true') return true;
    if (stored === 'false') return false;
    return defaultOpen;
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, String(isOpen));
  }, [isOpen, storageKey]);

  return (
    <section className={`remembered-disclosure ${isOpen ? 'open' : 'closed'} ${className ?? ''}`.trim()}>
      <button
        className="remembered-disclosure-summary"
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <div>
          <p className="eyebrow">{title}</p>
          {description ? <span>{description}</span> : null}
        </div>
        <ChevronDown size={18} className="remembered-disclosure-icon" />
      </button>
      {isOpen ? <div className="remembered-disclosure-body">{children}</div> : null}
    </section>
  );
}
