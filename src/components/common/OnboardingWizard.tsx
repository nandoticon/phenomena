import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { goalLibrary } from '../../constants';
import type { Project } from '../../types';

export const ONBOARDING_STORAGE_KEY = 'phenomena-onboarding-complete';

interface OnboardingWizardProps {
  open: boolean;
  project: Project;
  onApply: (updates: Partial<Project>) => void;
  onClose: () => void;
}

export function OnboardingWizard({ open, project, onApply, onClose }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(project.name);
  const [note, setNote] = useState(project.note);
  const [goal, setGoal] = useState(project.selectedGoal || goalLibrary[0]);
  const [sprintMinutes, setSprintMinutes] = useState(project.sprintMinutes);
  const [breakMinutes, setBreakMinutes] = useState(project.breakMinutes);
  const [reminderEnabled, setReminderEnabled] = useState(project.reminderEnabled);
  const [reminderTime, setReminderTime] = useState(project.reminderTime);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setStep(0);
    setName(project.name);
    setNote(project.note);
    setGoal(project.selectedGoal || goalLibrary[0]);
    setSprintMinutes(project.sprintMinutes);
    setBreakMinutes(project.breakMinutes);
    setReminderEnabled(project.reminderEnabled);
    setReminderTime(project.reminderTime);
  }, [open, project]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousFocus = document.activeElement as HTMLElement | null;
    nameInputRef.current?.focus();

    return () => {
      previousFocus?.focus?.();
    };
  }, [open]);

  const completeSetup = () => {
    onApply({
      name: name.trim() || project.name,
      note: note.trim(),
      selectedGoal: goal,
      sprintMinutes,
      breakMinutes,
      reminderEnabled,
      reminderTime,
    });
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    onClose();
  };

  const skipSetup = () => {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    onClose();
  };

  const trapFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      skipSetup();
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
    <div className="modal-overlay" onClick={skipSetup}>
      <div
        ref={dialogRef}
        className="modal-content card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-wizard-title"
        aria-describedby="onboarding-wizard-description"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={trapFocus}
        style={{ maxWidth: '720px' }}
      >
        <div className="panel-head" style={{ alignItems: 'flex-start' }}>
          <div>
            <p className="eyebrow" style={{ color: 'var(--accent)', marginBottom: '8px' }}>Setup Wizard</p>
            <h3 id="onboarding-wizard-title" style={{ margin: 0 }}>Set up your first workspace</h3>
          </div>
          <button className="ghost" type="button" onClick={skipSetup} aria-label="Skip setup wizard">
            Skip
          </button>
        </div>

        <p id="onboarding-wizard-description" style={{ marginTop: 0, color: 'var(--muted)', lineHeight: 1.6 }}>
          Use this guided setup to shape the starter project, choose a realistic timer, and decide whether reminders should be on.
        </p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['Project', 'Timer', 'Reminders'].map((label, index) => (
            <button
              key={label}
              type="button"
              className={step === index ? 'pill active' : 'pill'}
              onClick={() => setStep(index)}
              aria-pressed={step === index}
              style={{ padding: '8px 14px' }}
            >
              {index + 1}. {label}
            </button>
          ))}
        </div>

        {step === 0 ? (
          <div style={{ display: 'grid', gap: '16px' }}>
            <label className="input-block" htmlFor="onboarding-project-name" style={{ padding: 0, background: 'transparent', border: 'none' }}>
              <span style={{ marginBottom: '8px' }}>Project name</span>
              <input
                ref={nameInputRef}
                id="onboarding-project-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                style={{ background: 'var(--input-bg)' }}
              />
            </label>
            <label className="input-block" htmlFor="onboarding-project-note" style={{ padding: 0, background: 'transparent', border: 'none' }}>
              <span style={{ marginBottom: '8px' }}>Project note</span>
              <input
                id="onboarding-project-note"
                type="text"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="What is this project for?"
                style={{ background: 'var(--input-bg)' }}
              />
            </label>
          </div>
        ) : null}

        {step === 1 ? (
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <p style={{ margin: '0 0 12px', color: 'var(--muted)' }}>Pick a starter goal that feels small enough to finish today.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {goalLibrary.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={goal === item ? 'pill active' : 'pill'}
                    onClick={() => setGoal(item)}
                    aria-pressed={goal === item}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '16px' }}>
              <label className="input-block" htmlFor="onboarding-sprint-minutes" style={{ padding: 0, background: 'transparent', border: 'none' }}>
                <span style={{ marginBottom: '8px' }}>Sprint length</span>
                <select id="onboarding-sprint-minutes" value={sprintMinutes} onChange={(event) => setSprintMinutes(Number(event.target.value))} style={{ background: 'var(--input-bg)' }}>
                  <option value={10}>10 min</option>
                  <option value={15}>15 min</option>
                  <option value={20}>20 min</option>
                  <option value={25}>25 min</option>
                  <option value={45}>45 min</option>
                </select>
              </label>
              <label className="input-block" htmlFor="onboarding-break-minutes" style={{ padding: 0, background: 'transparent', border: 'none' }}>
                <span style={{ marginBottom: '8px' }}>Break length</span>
                <select id="onboarding-break-minutes" value={breakMinutes} onChange={(event) => setBreakMinutes(Number(event.target.value))} style={{ background: 'var(--input-bg)' }}>
                  <option value={3}>3 min</option>
                  <option value={5}>5 min</option>
                  <option value={8}>8 min</option>
                </select>
              </label>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div style={{ display: 'grid', gap: '16px' }}>
            <label className="toggle-row" htmlFor="onboarding-reminders" style={{ padding: '0 0 12px', background: 'transparent', border: 'none' }}>
              <span style={{ wordBreak: 'break-word' }}>Enable reminders for this project</span>
              <input
                id="onboarding-reminders"
                type="checkbox"
                checked={reminderEnabled}
                onChange={(event) => setReminderEnabled(event.target.checked)}
              />
            </label>
            <label className="input-block" htmlFor="onboarding-reminder-time" style={{ padding: 0, background: 'transparent', border: 'none' }}>
              <span style={{ marginBottom: '8px' }}>Reminder time</span>
              <input
                id="onboarding-reminder-time"
                type="time"
                value={reminderTime}
                onChange={(event) => setReminderTime(event.target.value)}
                style={{ background: 'var(--input-bg)' }}
              />
            </label>
            <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.6 }}>
              You can change reminder settings later from Projects or Account.
            </p>
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', marginTop: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button type="button" className="ghost" onClick={skipSetup}>Skip for now</button>
            {step > 0 ? <button type="button" className="ghost" onClick={() => setStep((current) => current - 1)}>Back</button> : null}
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {step < 2 ? (
              <button type="button" className="primary" onClick={() => setStep((current) => current + 1)}>
                Next
              </button>
            ) : (
              <button type="button" className="primary" onClick={completeSetup}>
                Finish setup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
