// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Check, ChevronDown, ChevronUp, BellRing, Target, Clock, MessageSquare, Anchor, Activity, FileText, CheckCircle2 } from 'lucide-react';

function MobileAccordion({ title, defaultOpen = false, children }: any) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 900 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isMobile) return <div className="accordion-desktop-contents">{children}</div>;

  return (
    <div className={`mobile-accordion ${isOpen ? 'open' : ''}`}>
      <button className="accordion-header card" onClick={() => setIsOpen(!isOpen)}>
        <h3>{title}</h3>
        <span className="chevron">{isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
      </button>
      {isOpen && <div className="accordion-body">{children}</div>}
    </div>
  );
}

export function TodayView({
  activeProject, ritualPronto, readyToStart, activeGoal, streakLabel,
  reminderDue, recentSessions, coaching, recoveryMessage, restart, analytics,
  updateProject, state, setState, resetRitual, toggleRitual,
  mode, secondsLeft, formatTime, startSprint, resetTimer, completeSession,
  sessionNote, setSessionNote, restartCue, setRestartCue, activateRestartMode,
  toggleRestartCheck, goalLibrary, ritualSteps, restartSteps, outcomeOptions, outcomeLabel
}: any) {
  return (
    <>
      {reminderDue ? (
        <section className="alert card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BellRing size={24} />
          <div>
            <strong>Time to return to {activeProject.name}.</strong>
            <span>Time for your daily session.</span>
          </div>
        </section>
      ) : null}

      <section className="today-two-column-layout">

        {/* Main Column (Timer / Dedicated Focus panel) */}
        <div className="today-main-col">
          <article className="card panel sprint-panel workspace-today">
            <div className="panel-head">
              <div>
                <p className="eyebrow"><Clock size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> Focus Timer</p>
                <h2>Start Writing</h2>
              </div>
            </div>

            {/* Embedded Goal Selection */}
            <div style={{ marginBottom: '24px', padding: '24px', borderRadius: '24px', background: 'var(--surface-soft)', border: '1px solid var(--panel-border)' }}>
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase' }}><Target size={14} /> Session Goal</strong>
              </div>
              <div className="goal-pills" style={{ marginBottom: '20px' }}>
                {goalLibrary.map((goal: string) => (
                  <button className={activeProject.selectedGoal === goal && !activeProject.customGoal ? 'pill active' : 'pill'} key={goal} onClick={() => updateProject((project: any) => ({ ...project, selectedGoal: goal }))} type="button">
                    {goal}
                  </button>
                ))}
              </div>
              <label className="input-block" style={{ padding: 0, background: 'transparent', border: 'none' }}>
                <input style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProject((project: any) => ({ ...project, customGoal: event.target.value }))} placeholder="Or set a custom goal. Ex: Write the basement scene." type="text" value={activeProject.customGoal} />
              </label>
            </div>

            <div className={`timer-shell ${mode === 'sprint' ? 'is-running' : ''}`} style={{ minHeight: 'clamp(220px, 40vh, 340px)', padding: 'clamp(24px, 4vw, 40px)', borderRadius: '24px' }}>
              <div className={`timer-face ${mode}`} style={{ minHeight: 'clamp(140px, 24vh, 220px)' }}>
                <span style={{ fontSize: '1.05rem', marginBottom: '8px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)' }}>{mode === 'break' ? 'Paused' : mode === 'sprint' ? 'Focusing' : activeProject.restartMode ? 'Restart Ready' : 'Ready'}</span>
                <strong style={{ fontSize: 'clamp(4rem, 12vw, 7rem)', lineHeight: 1, letterSpacing: '-2px' }}>{formatTime(secondsLeft)}</strong>
              </div>
              <div className="timer-controls">
                <label style={{ padding: 0, background: 'transparent', border: 'none' }}>
                  <span style={{ marginBottom: '8px', color: 'var(--text)' }}>Focus Duration</span>
                  <select style={{ background: 'var(--input-bg)' }} onChange={(event) => {
                    const minutes = Number(event.target.value);
                    updateProject((project: any) => ({ ...project, sprintMinutes: minutes }));
                    if (mode === 'idle') {
                      setSecondsLeft(minutes * 60);
                    }
                  }} value={activeProject.sprintMinutes}>
                    <option value={10}>10 min</option>
                    <option value={15}>15 min</option>
                    <option value={20}>20 min</option>
                    <option value={25}>25 min</option>
                    <option value={45}>45 min</option>
                    <option value={50}>50 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                  </select>
                </label>
                <label style={{ padding: 0, background: 'transparent', border: 'none' }}>
                  <span style={{ marginBottom: '8px', color: 'var(--text)' }}>Break Duration</span>
                  <select style={{ background: 'var(--input-bg)' }} onChange={(event) => updateProject((project: any) => ({ ...project, breakMinutes: Number(event.target.value) }))} value={activeProject.breakMinutes}>
                    <option value={3}>3 min</option>
                    <option value={5}>5 min</option>
                    <option value={8}>8 min</option>
                  </select>
                </label>
              </div>
              <div className="button-row">
                <button className="primary" disabled={!readyToStart || mode === 'sprint'} onClick={startSprint} type="button" style={{ padding: '16px 20px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Play size={18} /> {activeProject.restartMode ? 'Initiate Return' : 'Start Focus'}</button>
                <button className="ghost" onClick={resetTimer} type="button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><RotateCcw size={16} /> Reset Timer</button>
                <button className="success" onClick={completeSession} type="button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={18} /> Complete Session</button>
              </div>
            </div>
          </article>

          <MobileAccordion title="Session Notes" defaultOpen={true}>
            <article className="card panel notes-panel workspace-today">
              <div className="panel-head">
                <div>
                  <p className="eyebrow"><MessageSquare size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> Session Notes</p>
                  <h2>Log your progress and thoughts.</h2>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
                <label className="input-block textarea-block" style={{ padding: 0, background: 'transparent', border: 'none' }}>
                  <span style={{ marginBottom: '10px', color: 'var(--text)' }}>What went well today?</span>
                  <textarea style={{ background: 'var(--input-bg)', minHeight: '120px' }} onChange={(event) => setSessionNote(event.target.value)} value={sessionNote} placeholder="Example: Focusing on one small scene at a time helped ease the tension..." />
                </label>
                <label className="input-block textarea-block" style={{ padding: 0, background: 'transparent', border: 'none' }}>
                  <span style={{ marginBottom: '10px', color: 'var(--text)' }}>What's the starting point for tomorrow?</span>
                  <textarea style={{ background: 'var(--input-bg)', minHeight: '120px' }} onChange={(event) => setRestartCue(event.target.value)} value={restartCue} placeholder="Example: Start by reviewing the cut dialogue between the monster and the protagonist." />
                </label>
              </div>
              <div className="coach-note muted" style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                <Anchor size={20} style={{ color: 'var(--muted)' }} />
                <div>
                  <strong>Yesterday's starting point:</strong>
                  <p>{recentSessions.find((entry: any) => entry.restartCue)?.restartCue || analytics.noteSeed || "No previous notes."}</p>
                </div>
              </div>
            </article>
          </MobileAccordion>
        </div>

        {/* Sidebar Column (Unified Preparation & Debrief) */}
        <div className="today-sidebar-col">
          <MobileAccordion title="Preparation Ritual" defaultOpen={true}>
            <article className="card panel ritual-panel workspace-today">
              <div className="panel-head">
                <div>
                  <p className="eyebrow">Preparation Ritual</p>
                  <h2>Complete these steps before starting.</h2>
                </div>
                <button className="ghost" onClick={resetRitual} type="button" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>Reset steps</button>
              </div>

              <div className="ritual-list">
                {ritualSteps.map((step: any) => (
                  <label className={`ritual-item ${activeProject.ritualChecks[step.id] ? 'checked' : ''}`} key={step.id}>
                    <input checked={activeProject.ritualChecks[step.id]} onChange={() => toggleRitual(step.id)} type="checkbox" />
                    <span>
                      <strong>{step.label}</strong>
                      <small>{step.detail}</small>
                    </span>
                  </label>
                ))}
              </div>

              <div className={`status ${ritualPronto ? 'ready' : ''}`} style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {ritualPronto ? <><CheckCircle2 size={16} /> <span>Ritual complete. You are ready to start.</span></> : <span>Complete the steps below to prepare.</span>}
              </div>

              {/* Seamless Restart Injection */}
              {(activeProject.restartMode || restart.needed) && (
                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px dashed var(--panel-border)' }}>
                  <div className="panel-head" style={{ marginBottom: '16px' }}>
                    <div>
                      <p className="eyebrow">Return Protocol</p>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'Georgia, "Times New Roman", serif' }}>Force Return</h3>
                    </div>
                    <button className="primary" disabled={!restart.needed && !activeProject.restartMode} onClick={activateRestartMode} style={{ padding: '8px 14px', fontSize: '0.85rem' }} type="button">{activeProject.restartMode ? 'Return Protocol Active' : 'Force Return'}</button>
                  </div>
                  <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '18px', lineHeight: 1.5 }}>
                    {activeProject.restartMode
                      ? 'Return sequence initiated. Complete these lightweight steps.'
                      : `${activeProject.name} remained untouched for ${restart.daysAway} days. Use the return protocol to ease back into it.`}
                  </p>
                  <div className="restart-list">
                    {restartSteps.map((step: any) => (
                      <label className={`restart-item ${activeProject.restartChecks[step] ? 'checked' : ''}`} key={step}>
                        <input checked={activeProject.restartChecks[step]} onChange={() => toggleRestartCheck(step)} type="checkbox" />
                        <span>{step}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </article>
          </MobileAccordion>

          <MobileAccordion title="Session Log" defaultOpen={false}>
            <article className="card panel session-panel workspace-today">
              <div className="panel-head">
                <div>
                  <p className="eyebrow"><FileText size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> Session Log</p>
                  <h2>Session Details</h2>
                </div>
              </div>

              {/* Outsourced Outcomes from Session Panel */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--muted)', margin: '0 0 14px' }}>What did you accomplish today?</h3>
                <div className="outcome-grid">
                  {outcomeOptions.map((option: any) => (
                    <button className={activeProject.sessionOutcome === option.value ? 'outcome active' : 'outcome'} key={option.value} onClick={() => updateProject((project: any) => ({ ...project, sessionOutcome: option.value }))} type="button">
                      <strong>{option.label}</strong>
                      <span style={{ fontSize: '0.85rem' }}>{option.detail}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* State & Coaching Context Unification */}
              <div style={{ marginBottom: '24px', padding: '20px', borderRadius: '20px', background: 'var(--surface-soft)', border: '1px solid var(--panel-border)' }}>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--muted)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '6px' }}><Activity size={16} /> Current State</h3>
                <div className="selectors" style={{ gap: '16px' }}>
                  <label style={{ padding: 0, background: 'transparent', border: 'none', flex: 1 }}>
                    <span style={{ marginBottom: '8px' }}>Mood</span>
                    <select style={{ background: 'var(--input-bg)' }} onChange={(event) => setState((current: any) => ({ ...current, mood: event.target.value as string }))} value={state.mood}>
                      <option value="foggy">Foggy</option>
                      <option value="steady">Steady</option>
                      <option value="restless">Restless</option>
                      <option value="anxious">Anxious</option>
                    </select>
                  </label>
                  <label style={{ padding: 0, background: 'transparent', border: 'none', flex: 1 }}>
                    <span style={{ marginBottom: '8px' }}>Energy</span>
                    <select style={{ background: 'var(--input-bg)' }} onChange={(event) => setState((current: any) => ({ ...current, energy: event.target.value as string }))} value={state.energy}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </label>
                  <label style={{ padding: 0, background: 'transparent', border: 'none', flex: 1 }}>
                    <span style={{ marginBottom: '8px' }}>Focus</span>
                    <select style={{ background: 'var(--input-bg)' }} onChange={(event) => setState((current: any) => ({ ...current, focus: event.target.value as string }))} value={state.focus}>
                      <option value="scattered">Scattered</option>
                      <option value="usable">Usable</option>
                      <option value="sharp">Sharp</option>
                    </select>
                  </label>
                </div>

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--panel-border)', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--secondary)', display: 'block', marginBottom: '4px' }}>System Analysis:</strong>
                  <span style={{ color: 'var(--text)', fontSize: '0.95rem', fontStyle: 'italic' }}>"{coaching.message}"</span>
                  {recoveryMessage && (
                    <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255, 122, 89, 0.08)', borderRadius: '12px', border: '1px solid rgba(255, 122, 89, 0.15)' }}>
                      <strong style={{ display: 'block', color: 'var(--accent)', fontSize: '0.85rem', marginBottom: '4px' }}>Inactivity Alert</strong>
                      <span style={{ fontSize: '0.9rem' }}>{recoveryMessage}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Streak Logging Minimization */}
              <div>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--text)', margin: '0 0 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Current Streak
                  <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{streakLabel}</span>
                </h3>
                <div className="session-log" style={{ border: 'none', padding: 0, background: 'transparent' }}>
                  {recentSessions.length === 0 ? (
                    <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No sessions recorded yet.</p>
                  ) : (
                    <ul style={{ margin: 0 }}>
                      {recentSessions.slice(0, 3).map((entry: any, index: number) => (
                        <li key={`${entry.date}-${index}`} style={{ borderTop: index === 0 ? 'none' : '1px solid var(--panel-border)', padding: '12px 0' }}>
                          <span style={{ color: 'var(--text)' }}>{entry.date}</span>
                          <span>{entry.minutes} min</span>
                          <span>{outcomeLabel(entry.outcome)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </article>
          </MobileAccordion>
        </div>
      </section>
    </>
  );
}
