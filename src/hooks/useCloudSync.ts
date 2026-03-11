import React, { useState, useEffect, useRef } from 'react';
import type { NuvemStatus, AppState, Profile, ProjectAttachment, SessionResultado, Mood, Energy, Focus, CueTheme, Project } from '../types';
import { ambientPresets, goalLibrary, DEFAULT_PROJECT_ID } from '../constants';
import { buildStateFromNormalizedTables, serializeSyncState } from '../utils/storage';
import { getTodayKey } from '../utils/date';

export function useCloudSync(
  supabase: any,
  hasSupabaseConfig: boolean,
  session: any,
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

  const lastSyncedStateRef = useRef<string>('');

  useEffect(() => {
    if (!hydrated || !hasSupabaseConfig || !supabase || !session?.user) {
      return;
    }

    let cancelled = false;
    const client = supabase;

    const loadRemoteState = async () => {
      setNuvemStatus('loading');
      const [projectResult, sessionResult, attachmentResult, profileResult] = await Promise.all([
        client
          .from('projects')
          .select('*')
          .eq('user_id', session.user.id)
          .order('updated_at', { ascending: false }),
        client
          .from('sessions')
          .select('*')
          .eq('user_id', session.user.id)
          .order('session_date', { ascending: true }),
        client
          .from('attachments')
          .select('*')
          .eq('user_id', session.user.id)
          .order('position', { ascending: true }),
        client
          .from('profiles')
          .select('active_project_id, updated_at')
          .eq('user_id', session.user.id)
          .maybeSingle(),
      ]);

      if (cancelled) {
        return;
      }

      const error = projectResult.error ?? sessionResult.error ?? attachmentResult.error ?? profileResult.error;
      if (error) {
        setNuvemStatus('error');
        return;
      }

      if ((projectResult.data?.length ?? 0) > 0 || (sessionResult.data?.length ?? 0) > 0 || (attachmentResult.data?.length ?? 0) > 0) {
        const remoteState = buildStateFromNormalizedTables(
          (projectResult.data ?? []) as any[],
          (sessionResult.data ?? []) as any[],
          (attachmentResult.data ?? []) as any[],
          profileResult.data?.active_project_id ?? null,
        );
        setState(remoteState);
        lastSyncedStateRef.current = serializeSyncState(remoteState);
        setRemoteSnapshot(remoteState);
        const timestamps = [
          ...(projectResult.data ?? []).map((row: any) => row.updated_at).filter(Boolean),
          ...(attachmentResult.data ?? []).map((row: any) => row.updated_at).filter(Boolean),
          ...(sessionResult.data ?? []).map((row: any) => row.created_at).filter(Boolean),
          profileResult.data?.updated_at,
        ].filter(Boolean) as string[];
        const latestTimestamp = timestamps.sort().at(-1) ?? null;
        setRemoteUpdatedAt(latestTimestamp);
      } else {
        lastSyncedStateRef.current = serializeSyncState(state);
        setRemoteSnapshot(state);
        setRemoteUpdatedAt(null);
      }

      setRemoteLoaded(true);
      setNuvemStatus('synced');
    };

    void loadRemoteState();

    return () => {
      cancelled = true;
    };
  }, [hydrated, session?.user?.id, hasSupabaseConfig, supabase]);

  useEffect(() => {
    if (!hydrated || !hasSupabaseConfig || !supabase || !session?.user || !remoteLoaded) {
      if (!session) {
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

    const client = supabase;
    const timer = window.setTimeout(async () => {
      setNuvemStatus('saving');
      const projectRows = state.projects.map((project) => ({
        user_id: session.user.id,
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
          user_id: session.user.id,
          project_id: project.id,
          attachment_id: attachment.id,
          label: attachment.label,
          url: attachment.url,
          position: index,
        })),
      );

      const sessionRows = state.sessions.map((entry) => ({
        user_id: session.user.id,
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

      const [existingProjetos, existingSessões, existingAnexos] = await Promise.all([
        client.from('projects').select('project_id').eq('user_id', session.user.id),
        client.from('sessions').select('client_session_id').eq('user_id', session.user.id),
        client.from('attachments').select('attachment_id').eq('user_id', session.user.id),
      ]);

      const lookupError = existingProjetos.error ?? existingSessões.error ?? existingAnexos.error;
      if (lookupError) {
        setNormalizedMessage('Initial sync check failed.');
        return;
      }

      if (projectRows.length) {
        const { error } = await client.from('projects').upsert(projectRows, { onConflict: 'user_id,project_id' });
        if (error) {
          setNormalizedMessage('Failed to sync project mirror.');
          return;
        }
      }

      if (sessionRows.length) {
        const { error } = await client.from('sessions').upsert(sessionRows, { onConflict: 'user_id,client_session_id' });
        if (error) {
          setNormalizedMessage('Failed to sync session mirror.');
          return;
        }
      }

      if (attachmentRows.length) {
        const { error } = await client.from('attachments').upsert(attachmentRows, { onConflict: 'user_id,project_id,attachment_id' });
        if (error) {
          setNormalizedMessage('Attachments mirror sync failed.');
          return;
        }
      }

      const remoteProjectIds = (existingProjetos.data ?? []).map((row: any) => String(row.project_id));
      const localProjectIds = new Set(projectRows.map((row: any) => row.project_id));
      const staleProjectIds = remoteProjectIds.filter((id: any) => !localProjectIds.has(id));
      if (staleProjectIds.length) {
        const { error } = await client.from('projects').delete().eq('user_id', session.user.id).in('project_id', staleProjectIds);
        if (error) {
          setNormalizedMessage('Failed to clean up projects after sync.');
          return;
        }
      }

      const remoteSessionIds = (existingSessões.data ?? []).map((row: any) => String(row.client_session_id));
      const localSessionIds = new Set(sessionRows.map((row: any) => row.client_session_id));
      const staleSessionIds = remoteSessionIds.filter((id: any) => !localSessionIds.has(id));
      if (staleSessionIds.length) {
        const { error } = await client.from('sessions').delete().eq('user_id', session.user.id).in('client_session_id', staleSessionIds);
        if (error) {
          setNormalizedMessage('Failed to clean up sessions after sync.');
          return;
        }
      }

      const remoteAnexoIds = (existingAnexos.data ?? []).map((row: any) => String(row.attachment_id));
      const localAnexoIds = new Set(attachmentRows.map((row: any) => row.attachment_id));
      const staleAnexoIds = remoteAnexoIds.filter((id: any) => !localAnexoIds.has(id));
      if (staleAnexoIds.length) {
        const { error } = await client.from('attachments').delete().eq('user_id', session.user.id).in('attachment_id', staleAnexoIds);
        if (error) {
          setNormalizedMessage('Attachments cleanup failed after sync.');
          return;
        }
      }

      if (profile) {
        const { error } = await client
          .from('profiles')
          .update({ active_project_id: state.activeProjectId })
          .eq('user_id', session.user.id);
        if (error) {
          setNormalizedMessage('Projects synced, but active project was not persisted.');
          return;
        }
      }

      setNormalizedMessage(
        `Normalized tables synchronized: ${projectRows.length} projects, ${sessionRows.length} sessions, ${attachmentRows.length} attachments.`,
      );
      lastSyncedStateRef.current = nextSyncState;
      setRemoteSnapshot(state);
      setRemoteUpdatedAt(new Date().toISOString());
      setNuvemStatus('synced');
    }, 900);

    return () => window.clearTimeout(timer);
  }, [hydrated, profile, remoteLoaded, session?.user?.id, state, hasSupabaseConfig, supabase]);

  async function pullCloudState() {
    if (!supabase || !session?.user) {
      return;
    }
    setNuvemStatus('restoring');
    const [projectResult, sessionResult, attachmentResult, profileResult] = await Promise.all([
      supabase.from('projects').select('*').eq('user_id', session.user.id).order('updated_at', { ascending: false }),
      supabase.from('sessions').select('*').eq('user_id', session.user.id).order('session_date', { ascending: true }),
      supabase.from('attachments').select('*').eq('user_id', session.user.id).order('position', { ascending: true }),
      supabase.from('profiles').select('active_project_id, updated_at').eq('user_id', session.user.id).maybeSingle(),
    ]);

    const error = projectResult.error ?? sessionResult.error ?? attachmentResult.error ?? profileResult.error;
    if (error || ((projectResult.data?.length ?? 0) === 0 && (sessionResult.data?.length ?? 0) === 0 && (attachmentResult.data?.length ?? 0) === 0)) {
      setNuvemStatus('error');
      return;
    }

    const nextState = buildStateFromNormalizedTables(
      (projectResult.data ?? []) as any[],
      (sessionResult.data ?? []) as any[],
      (attachmentResult.data ?? []) as any[],
      profileResult.data?.active_project_id ?? null,
    );
    setState(nextState);
    lastSyncedStateRef.current = serializeSyncState(nextState);
    setRemoteSnapshot(nextState);
    const timestamps = [
      ...(projectResult.data ?? []).map((row: any) => row.updated_at).filter(Boolean),
      ...(attachmentResult.data ?? []).map((row: any) => row.updated_at).filter(Boolean),
      ...(sessionResult.data ?? []).map((row: any) => row.created_at).filter(Boolean),
      profileResult.data?.updated_at,
    ].filter(Boolean) as string[];
    setRemoteUpdatedAt(timestamps.sort().at(-1) ?? null);
    setRemoteLoaded(true);
    setNuvemStatus('synced');
  }

  async function pushLocalState() {
    if (!supabase || !session?.user) {
      return;
    }
    setNuvemStatus('saving');
    const nextSyncState = serializeSyncState(state);
    const projectRows = state.projects.map((project) => ({
      user_id: session.user.id,
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
        user_id: session.user.id,
        project_id: project.id,
        attachment_id: attachment.id,
        label: attachment.label,
        url: attachment.url,
        position: index,
      })),
    );
    const sessionRows = state.sessions.map((entry) => ({
      user_id: session.user.id,
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

    const [existingProjetos, existingSessões, existingAnexos] = await Promise.all([
      supabase.from('projects').select('project_id').eq('user_id', session.user.id),
      supabase.from('sessions').select('client_session_id').eq('user_id', session.user.id),
      supabase.from('attachments').select('attachment_id').eq('user_id', session.user.id),
    ]);

    const lookupError = existingProjetos.error ?? existingSessões.error ?? existingAnexos.error;
    if (lookupError) {
      setNuvemStatus('error');
      return;
    }

    if (projectRows.length) {
      const { error } = await supabase.from('projects').upsert(projectRows, { onConflict: 'user_id,project_id' });
      if (error) {
        setNuvemStatus('error');
        return;
      }
    }
    if (sessionRows.length) {
      const { error } = await supabase.from('sessions').upsert(sessionRows, { onConflict: 'user_id,client_session_id' });
      if (error) {
        setNuvemStatus('error');
        return;
      }
    }
    if (attachmentRows.length) {
      const { error } = await supabase.from('attachments').upsert(attachmentRows, { onConflict: 'user_id,project_id,attachment_id' });
      if (error) {
        setNuvemStatus('error');
        return;
      }
    }

    const staleProjectIds = (existingProjetos.data ?? [])
      .map((row: any) => String(row.project_id))
      .filter((id: any) => !projectRows.some((row: any) => row.project_id === id));
    if (staleProjectIds.length) {
      await supabase.from('projects').delete().eq('user_id', session.user.id).in('project_id', staleProjectIds);
    }

    const staleSessionIds = (existingSessões.data ?? [])
      .map((row: any) => String(row.client_session_id))
      .filter((id: any) => !sessionRows.some((row: any) => row.client_session_id === id));
    if (staleSessionIds.length) {
      await supabase.from('sessions').delete().eq('user_id', session.user.id).in('client_session_id', staleSessionIds);
    }

    const staleAnexoIds = (existingAnexos.data ?? [])
      .map((row: any) => String(row.attachment_id))
      .filter((id: any) => !attachmentRows.some((row: any) => row.attachment_id === id));
    if (staleAnexoIds.length) {
      await supabase.from('attachments').delete().eq('user_id', session.user.id).in('attachment_id', staleAnexoIds);
    }

    if (profile) {
      await supabase.from('profiles').update({ active_project_id: state.activeProjectId }).eq('user_id', session.user.id);
    }

    lastSyncedStateRef.current = nextSyncState;
    setRemoteSnapshot(state);
    setRemoteUpdatedAt(new Date().toISOString());
    setRemoteLoaded(true);
    setNuvemStatus('synced');
  }

  return {
    cloudStatus, setNuvemStatus,
    remoteLoaded, setRemoteLoaded,
    remoteSnapshot, setRemoteSnapshot,
    remoteUpdatedAt, setRemoteUpdatedAt,
    normalizedMessage, setNormalizedMessage,
    pullCloudState, pushLocalState
  };
}
