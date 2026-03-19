import { useEffect, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import { goalLibrary } from '../../constants';
import type { Project } from '../../types';
import { Dialog } from './Dialog';

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

  if (!open) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={skipSetup}
      className="modal-content card"
      style={{ maxWidth: '720px' }}
      labelledBy="onboarding-wizard-title"
      describedBy="onboarding-wizard-description"
      initialFocusRef={nameInputRef as unknown as MutableRefObject<HTMLElement | null>}
    >
        <div className="panel-head" style={{ alignItems: 'flex-start' }}>
          <div>
            <p className="eyebrow" style={{ color: 'var(--accent)', marginBottom: '8px' }}>Project setup</p>
            <h3 id="onboarding-wizard-title" style={{ margin: 0 }}>Set up your project</h3>
          </div>
          <button className="ghost" type="button" onClick={skipSetup} aria-label="Skip setup">
            Skip
          </button>
        </div>

        <p id="onboarding-wizard-description" style={{ marginTop: 0, color: 'var(--muted)', lineHeight: 1.6 }}>
          Use this setup to name the project, choose a timer, and decide whether reminders should be on.
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
              <p style={{ margin: '0 0 12px', color: 'var(--muted)' }}>Pick a goal to start with.</p>
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
    </Dialog>
  );
}
