import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Session, SupabaseClient } from '@supabase/supabase-js';
import type { NuvemStatus, AppState, Profile, SyncQueueState, AttachmentRow, ProjectRow, SessionRow } from '../types';
import { buildStateFromNormalizedTables, serializeSyncState } from '../utils/storage';
import { buildSyncConflict, hasSyncConflict, SyncConflict } from '../utils/sync';

export function useCloudSync(
  supabase: SupabaseClient | null,
  hasSupabaseConfig: boolean,
  session: Session | null,
  state: AppState,
  setState: React.Dispatch<React.SetStateAction<AppState>>,
  hydrated: boolean,
  profile: Profile | null,
) {
  const [cloudStatus, setNuvemStatus] = useState<NuvemStatus>('local');
  const [remoteLoaded, setRemoteLoaded] = useState(false);
  const [remoteSnapshot, setRemoteSnapshot] = useState<AppState | null>(null);
  const [remoteUpdatedAt, setRemoteUpdatedAt] = useState<string | null>(null);
  const [normalizedMessage, setNormalizedMessage] = useState('');
  const [syncConflict, setSyncConflict] = useState<SyncConflict | null>(null);
  const [syncQueue, setSyncQueue] = useState<SyncQueueState>({
    pending: false,
    snapshot: null,
    queuedAt: null,
    attempts: 0,
    lastError: null,
    lastAttemptAt: null,
    reason: null,
  });

  const lastSyncedStateRef = useRef<string>('');
  const lastRemoteStateRef = useRef<string>('');
  const userId = session?.user?.id;
  const syncQueueKey = userId ? `phenomena-sync-queue:${userId}` : null;

  interface CloudSnapshot {
    state: AppState | null;
    updatedAt: string | null;
    projectRows: ProjectRow[];
    sessionRows: SessionRow[];
    attachmentRows: AttachmentRow[];
  }

  const clearSyncQueue = useCallback(() => {
    setSyncQueue({
      pending: false,
      snapshot: null,
      queuedAt: null,
      attempts: 0,
      lastError: null,
      lastAttemptAt: null,
      reason: null,
    });
  }, []);

  const markQueued = useCallback((snapshot: string, reason: string, lastError?: string | null) => {
    const now = new Date().toISOString();
    setSyncQueue((current) => {
      if (current.pending && current.snapshot === snapshot) {
        return {
          ...current,
          reason,
          ...(typeof lastError === 'string' ? { lastError } : {}),
        };
      }

      return {
        pending: true,
        snapshot,
        queuedAt: current.pending ? current.queuedAt : now,
        attempts: current.snapshot === snapshot ? current.attempts : 0,
        lastError: typeof lastError === 'string' ? lastError : current.snapshot === snapshot ? current.lastError : null,
        lastAttemptAt: current.lastAttemptAt,
        reason,
      };
    });
  }, []);

  useEffect(() => {
    if (!syncQueueKey) {
      clearSyncQueue();
      return;
    }

    const raw = localStorage.getItem(syncQueueKey);
    if (!raw) {
      clearSyncQueue();
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<SyncQueueState>;
      setSyncQueue({
        pending: Boolean(parsed.pending),
        snapshot: typeof parsed.snapshot === 'string' ? parsed.snapshot : null,
        queuedAt: typeof parsed.queuedAt === 'string' ? parsed.queuedAt : null,
        attempts: typeof parsed.attempts === 'number' ? parsed.attempts : 0,
        lastError: typeof parsed.lastError === 'string' ? parsed.lastError : null,
        lastAttemptAt: typeof parsed.lastAttemptAt === 'string' ? parsed.lastAttemptAt : null,
        reason: typeof parsed.reason === 'string' ? parsed.reason : null,
      });
    } catch {
      clearSyncQueue();
    }
  }, [clearSyncQueue, syncQueueKey]);

  useEffect(() => {
    if (!syncQueueKey) {
      return;
    }

    if (!syncQueue.pending) {
      localStorage.removeItem(syncQueueKey);
      return;
    }

    localStorage.setItem(syncQueueKey, JSON.stringify(syncQueue));
  }, [syncQueue, syncQueueKey]);

  const readCloudSnapshot = useCallback(async (): Promise<CloudSnapshot | null> => {
    if (!supabase || !userId) {
      return null;
    }

    const [projectResult, sessionResult, attachmentResult, profileResult] = await Promise.all([
      supabase.from('projects').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
      supabase.from('sessions').select('*').eq('user_id', userId).order('session_date', { ascending: true }),
      supabase.from('attachments').select('*').eq('user_id', userId).order('position', { ascending: true }),
      supabase.from('profiles').select('active_project_id, updated_at').eq('user_id', userId).maybeSingle(),
    ]);

    const error = projectResult.error ?? sessionResult.error ?? attachmentResult.error ?? profileResult.error;
    if (error) {
      throw error;
    }

    const hasRemoteData =
      (projectResult.data?.length ?? 0) > 0 ||
      (sessionResult.data?.length ?? 0) > 0 ||
      (attachmentResult.data?.length ?? 0) > 0;

    if (!hasRemoteData) {
      return {
        state: null,
        updatedAt: null,
        projectRows: (projectResult.data ?? []) as ProjectRow[],
        sessionRows: (sessionResult.data ?? []) as SessionRow[],
        attachmentRows: (attachmentResult.data ?? []) as AttachmentRow[],
      };
    }

    const remoteState = buildStateFromNormalizedTables(
      (projectResult.data ?? []) as ProjectRow[],
      (sessionResult.data ?? []) as SessionRow[],
      (attachmentResult.data ?? []) as AttachmentRow[],
      profileResult.data?.active_project_id ?? null,
    );
    const timestamps = [
      ...(projectResult.data ?? []).map((row) => row.updated_at).filter(Boolean),
      ...(attachmentResult.data ?? []).map((row) => row.updated_at).filter(Boolean),
      ...(sessionResult.data ?? []).map((row) => row.created_at).filter(Boolean),
      profileResult.data?.updated_at,
    ].filter(Boolean) as string[];

    return {
      state: remoteState,
      updatedAt: timestamps.sort().at(-1) ?? null,
      projectRows: (projectResult.data ?? []) as ProjectRow[],
      sessionRows: (sessionResult.data ?? []) as SessionRow[],
      attachmentRows: (attachmentResult.data ?? []) as AttachmentRow[],
    };
  }, [supabase, userId]);

  const syncStateToCloud = useCallback(async (destructive = false, force = false) => {
    if (!supabase || !userId) {
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setNuvemStatus('offline');
      markQueued(serializeSyncState(state), 'offline', 'Offline. Changes are queued locally.');
      return;
    }

    const snapshot = await readCloudSnapshot();
    if (!snapshot) {
      return;
    }

    const currentRemoteState = snapshot.state;
    if (currentRemoteState && !force && hasSyncConflict(state, currentRemoteState, lastSyncedStateRef.current, lastRemoteStateRef.current)) {
      const conflict = buildSyncConflict(state, currentRemoteState);
      setSyncConflict(conflict);
      setNormalizedMessage(conflict.message);
      setNuvemStatus('error');
      markQueued(serializeSyncState(state), 'conflict', conflict.message);
      return;
    }

    setNuvemStatus('saving');
    setSyncQueue((current) => ({
      ...current,
      pending: true,
      attempts: current.attempts + 1,
      lastAttemptAt: new Date().toISOString(),
      snapshot: current.snapshot ?? serializeSyncState(state),
    }));
    const nextSyncState = serializeSyncState(state);
    const projectRows = state.projects.map((project) => ({
      user_id: userId,
      project_id: project.id,
      name: project.name,
      note: project.note,
      selected_goal: project.selectedGoal,
      custom_goal: project.customGoal,
      sprint_minutes: project.sprintMinutes,
      break_minutes: project.breakMinutes,
      streak: project.streak,
      last_completion_date: project.lastCompletionDate,
      reminder_enabled: project.reminderEnabled,
      reminder_time: project.reminderTime,
      last_reminder_date: project.lastReminderDate,
      ritual_checks: project.ritualChecks,
      soundtrack_url: project.soundtrackUrl,
      cue_theme: project.cueTheme,
      archived: project.archived,
      restart_mode: project.restartMode,
      restart_checks: project.restartChecks,
      session_outcome: project.sessionOutcome || null,
    }));

    const attachmentRows = state.projects.flatMap((project) =>
      project.attachments.map((attachment, index) => ({
        user_id: userId,
        project_id: project.id,
        attachment_id: attachment.id,
        label: attachment.label,
        url: attachment.url,
        position: index,
      })),
    );

    const sessionRows = state.sessions.map((entry) => ({
      user_id: userId,
      client_session_id: entry.id,
      project_id: entry.projectId,
      session_date: entry.date,
      time_of_day: entry.timeOfDay,
      minutes: entry.minutes,
      mood: entry.mood,
      energy: entry.energy,
      focus: entry.focus,
      goal: entry.goal,
      outcome: entry.outcome,
      note: entry.note,
      restart_cue: entry.restartCue,
      used_restart_mode: entry.usedRestartMode,
    }));

    if (projectRows.length) {
      const { error } = await supabase.from('projects').upsert(projectRows, { onConflict: 'user_id,project_id' });
      if (error) {
        setNuvemStatus('error');
        setNormalizedMessage('Failed to sync project mirror.');
        markQueued(nextSyncState, 'project-sync-failed', 'Failed to sync project mirror.');
        return;
      }
    }

    if (sessionRows.length) {
      const { error } = await supabase.from('sessions').upsert(sessionRows, { onConflict: 'user_id,client_session_id' });
      if (error) {
        setNuvemStatus('error');
        setNormalizedMessage('Failed to sync session mirror.');
        markQueued(nextSyncState, 'session-sync-failed', 'Failed to sync session mirror.');
        return;
      }
    }

    if (attachmentRows.length) {
      const { error } = await supabase.from('attachments').upsert(attachmentRows, { onConflict: 'user_id,project_id,attachment_id' });
      if (error) {
        setNuvemStatus('error');
        setNormalizedMessage('Attachments mirror sync failed.');
        markQueued(nextSyncState, 'attachment-sync-failed', 'Attachments mirror sync failed.');
        return;
      }
    }

    if (destructive) {
      const remoteProjectIds = snapshot.projectRows.map((row) => String(row.project_id));
      const localProjectIds = new Set(projectRows.map((row) => row.project_id));
      const staleProjectIds = remoteProjectIds.filter((id) => !localProjectIds.has(id));
      if (staleProjectIds.length) {
        const { error } = await supabase.from('projects').delete().eq('user_id', userId).in('project_id', staleProjectIds);
        if (error) {
          setNuvemStatus('error');
          setNormalizedMessage('Failed to clean up projects after sync.');
          markQueued(nextSyncState, 'project-cleanup-failed', 'Failed to clean up projects after sync.');
          return;
        }
      }

      const remoteSessionIds = snapshot.sessionRows.map((row) => String(row.client_session_id));
      const localSessionIds = new Set(sessionRows.map((row) => row.client_session_id));
      const staleSessionIds = remoteSessionIds.filter((id) => !localSessionIds.has(id));
      if (staleSessionIds.length) {
        const { error } = await supabase.from('sessions').delete().eq('user_id', userId).in('client_session_id', staleSessionIds);
        if (error) {
          setNuvemStatus('error');
          setNormalizedMessage('Failed to clean up sessions after sync.');
          markQueued(nextSyncState, 'session-cleanup-failed', 'Failed to clean up sessions after sync.');
          return;
        }
      }

      const remoteAttachmentIds = snapshot.attachmentRows.map((row) => String(row.attachment_id));
      const localAttachmentIds = new Set(attachmentRows.map((row) => row.attachment_id));
      const staleAttachmentIds = remoteAttachmentIds.filter((id) => !localAttachmentIds.has(id));
      if (staleAttachmentIds.length) {
        const { error } = await supabase.from('attachments').delete().eq('user_id', userId).in('attachment_id', staleAttachmentIds);
        if (error) {
          setNuvemStatus('error');
          setNormalizedMessage('Attachments cleanup failed after sync.');
          markQueued(nextSyncState, 'attachment-cleanup-failed', 'Attachments cleanup failed after sync.');
          return;
        }
      }
    }

    const refreshed = await readCloudSnapshot();
    if (!refreshed) {
      return;
    }

    if (profile) {
      const { error } = await supabase.from('profiles').update({ active_project_id: state.activeProjectId }).eq('user_id', userId);
      if (error) {
        setNuvemStatus('error');
        setNormalizedMessage('Projects synced, but active project was not persisted.');
        markQueued(nextSyncState, 'profile-sync-failed', 'Projects synced, but active project was not persisted.');
        return;
      }
    }

    lastSyncedStateRef.current = nextSyncState;
    lastRemoteStateRef.current = refreshed.state ? serializeSyncState(refreshed.state) : '';
    setRemoteSnapshot(refreshed.state);
    setRemoteUpdatedAt(refreshed.updatedAt);
    setSyncConflict(null);
    clearSyncQueue();
    setNormalizedMessage(
      destructive
        ? `Cloud replaced with local data: ${projectRows.length} projects, ${sessionRows.length} sessions, ${attachmentRows.length} attachments.`
        : `Cloud merged with local changes: ${projectRows.length} projects, ${sessionRows.length} sessions, ${attachmentRows.length} attachments.`,
    );
    setNuvemStatus('synced');
  }, [clearSyncQueue, markQueued, profile, readCloudSnapshot, state, supabase, userId]);

  useEffect(() => {
    if (!hydrated || !hasSupabaseConfig || !supabase || !userId) {
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        setNuvemStatus('loading');
        const snapshot = await readCloudSnapshot();
        if (cancelled || !snapshot) {
          return;
        }

        if (snapshot.state) {
          const serialized = serializeSyncState(snapshot.state);
          setState(snapshot.state);
          lastSyncedStateRef.current = serialized;
          lastRemoteStateRef.current = serialized;
          setRemoteSnapshot(snapshot.state);
          setRemoteUpdatedAt(snapshot.updatedAt);
        } else {
          lastSyncedStateRef.current = '';
          lastRemoteStateRef.current = '';
          setRemoteSnapshot(null);
          setRemoteUpdatedAt(null);
        }

        setRemoteLoaded(true);
        setSyncConflict(null);
        setNuvemStatus('synced');
      } catch {
        if (!cancelled) {
          setNuvemStatus('error');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, hasSupabaseConfig, readCloudSnapshot, setState, supabase, userId]);

  useEffect(() => {
    if (!hydrated || !hasSupabaseConfig || !supabase || !userId || !remoteLoaded) {
      if (!userId) {
        setRemoteLoaded(false);
        setRemoteSnapshot(null);
        setRemoteUpdatedAt(null);
        setNuvemStatus('local');
      }
      return;
    }

    const nextSyncState = serializeSyncState(state);
    if (lastSyncedStateRef.current === nextSyncState) {
      return;
    }

    markQueued(nextSyncState, typeof navigator !== 'undefined' && navigator.onLine ? 'local-change' : 'offline-change');
  }, [hydrated, hasSupabaseConfig, markQueued, remoteLoaded, state, supabase, syncStateToCloud, userId]);

  useEffect(() => {
    if (!hydrated || !hasSupabaseConfig || !supabase || !userId || !remoteLoaded || !syncQueue.pending) {
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setNuvemStatus('offline');
      return;
    }

    setNuvemStatus(syncQueue.attempts > 0 ? 'queued' : 'saving');
    const timer = window.setTimeout(() => {
      void syncStateToCloud(false, false);
    }, syncQueue.attempts > 0 ? 5000 : 1200);

    return () => window.clearTimeout(timer);
  }, [hydrated, hasSupabaseConfig, remoteLoaded, syncQueue.attempts, syncQueue.pending, state, supabase, syncStateToCloud, userId]);

  useEffect(() => {
    if (!syncQueue.pending || !remoteLoaded) {
      return;
    }

    const handleOnline = () => {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        void syncStateToCloud(false, false);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [remoteLoaded, syncQueue.pending, syncStateToCloud]);

  async function pullCloudState() {
    if (!supabase || !userId) {
      return;
    }

    setNuvemStatus('restoring');
    try {
      const snapshot = await readCloudSnapshot();
      if (!snapshot?.state) {
        setNuvemStatus('error');
        return;
      }

      const serialized = serializeSyncState(snapshot.state);
      setState(snapshot.state);
      lastSyncedStateRef.current = serialized;
      lastRemoteStateRef.current = serialized;
      setRemoteSnapshot(snapshot.state);
      setRemoteUpdatedAt(snapshot.updatedAt);
      setRemoteLoaded(true);
      setSyncConflict(null);
      clearSyncQueue();
      setNuvemStatus('synced');
    } catch {
      setNuvemStatus('error');
    }
  }

  async function pushLocalState() {
    await syncStateToCloud(false, true);
  }

  async function replaceCloudWithLocal() {
    await syncStateToCloud(true, true);
  }

  return {
    cloudStatus, setNuvemStatus,
    remoteLoaded, setRemoteLoaded,
    remoteSnapshot, setRemoteSnapshot,
    remoteUpdatedAt, setRemoteUpdatedAt,
    normalizedMessage, setNormalizedMessage,
    syncConflict,
    syncQueue,
    pullCloudState, pushLocalState, replaceCloudWithLocal
  };
}
