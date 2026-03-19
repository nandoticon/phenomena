import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MobileAccordionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function MobileAccordion({ title, defaultOpen = false, children }: MobileAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 900 : false);
  const panelId = `accordion-panel-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isMobile) return <>{children}</>;

  return (
    <div className={`mobile-accordion ${isOpen ? 'open' : ''}`}>
      <button
        className="accordion-header card"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        type="button"
      >
        <h3>{title}</h3>
        <span className="chevron">{isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
      </button>
      {isOpen && <div className="accordion-body" id={panelId}>{children}</div>}
    </div>
  );
}
