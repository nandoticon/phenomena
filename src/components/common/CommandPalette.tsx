import { useMemo, useRef } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { Search, Plus, Feather, BookOpen, Activity, Settings } from 'lucide-react';
import { Dialog } from './Dialog';

export interface CommandPaletteAction {
  id: string;
  label: string;
  description: string;
  shortcut?: string;
  icon?: 'plus' | 'today' | 'projects' | 'insights' | 'account';
  run: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  actions: CommandPaletteAction[];
  onClose: () => void;
}

const iconMap = {
  plus: Plus,
  today: Feather,
  projects: BookOpen,
  insights: Activity,
  account: Settings,
};

export function CommandPalette({ open, query, setQuery, actions, onClose }: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filteredActions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return actions;
    }

    return actions.filter((action) => (
      action.label.toLowerCase().includes(normalized) ||
      action.description.toLowerCase().includes(normalized) ||
      action.shortcut?.toLowerCase().includes(normalized)
    ));
  }, [actions, query]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="card panel"
      overlayStyle={{ alignItems: 'flex-start', paddingTop: '10vh' }}
      style={{ width: 'min(680px, calc(100vw - 32px))', maxHeight: '70vh', overflow: 'hidden', border: '1px solid var(--panel-border)', background: 'var(--surface-soft)', boxShadow: '0 24px 80px rgba(0,0,0,0.35)' }}
      labelledBy="command-palette-title"
      initialFocusRef={inputRef as unknown as MutableRefObject<HTMLElement | null>}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 20px', borderBottom: '1px solid var(--panel-border)' }}>
          <Search size={18} style={{ color: 'var(--muted)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type a command or jump to a screen..."
            aria-label="Command palette search"
            style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '1rem', color: 'var(--text)' }}
          />
          <button className="ghost" type="button" onClick={onClose} aria-label="Close command palette" style={{ padding: '8px 10px', borderRadius: '12px' }}>
            Esc
          </button>
        </div>

        <div style={{ maxHeight: 'calc(70vh - 74px)', overflowY: 'auto', padding: '10px' }}>
          <p id="command-palette-title" className="sr-only">Command palette</p>
          {filteredActions.length ? (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: 0 }}>
              {filteredActions.map((action) => {
                const Icon = iconMap[action.icon || 'plus'];
                return (
                  <li key={action.id}>
                    <button
                      type="button"
                      onClick={() => {
                        action.run();
                        onClose();
                      }}
                      style={{ width: '100%', textAlign: 'left', padding: '14px 14px', borderRadius: '16px', border: '1px solid var(--panel-border)', background: 'var(--bg)', display: 'flex', alignItems: 'center', gap: '12px' }}
                    >
                      <span style={{ width: '34px', height: '34px', borderRadius: '12px', display: 'grid', placeItems: 'center', background: 'var(--accent-soft)', color: 'var(--accent)', flexShrink: 0 }}>
                        <Icon size={16} />
                      </span>
                      <span style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                        <strong>{action.label}</strong>
                        <span style={{ color: 'var(--muted)', fontSize: '0.86rem', lineHeight: 1.4 }}>{action.description}</span>
                      </span>
                      {action.shortcut ? (
                        <kbd style={{ padding: '6px 8px', borderRadius: '10px', background: 'var(--surface-soft)', border: '1px solid var(--panel-border)', color: 'var(--muted)', fontSize: '0.8rem' }}>
                          {action.shortcut}
                        </kbd>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div style={{ padding: '24px 14px', color: 'var(--muted)' }}>No commands match that search.</div>
          )}
        </div>
    </Dialog>
  );
}
