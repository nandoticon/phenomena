import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import type { Profile, AuthView } from '../types';

export function useAuth(
  supabase: any,
  hasSupabaseConfig: boolean,
  createProfile: (userId: string, timezone: string) => Profile
) {
  const [session, setSession] = useState<Session | null>(null);
  const [authView, setAuthView] = useState<AuthView>('sign-in');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authPasswordConfirm, setAuthPasswordConfirm] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  const [passwordMessage, setSenhaMessage] = useState('');

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data }: any) => {
      setSession(data.session ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, nextSession: Session | null) => {
      if (_event === 'PASSWORD_RECOVERY') {
        setAuthView('recovery');
        setAuthMessage('Reset link accepted. Enter a new password within the app.');
      }
      if (_event === 'SIGNED_IN' && nextSession) {
        setAuthView('sign-in');
      }
      setSession(nextSession);
      if (!nextSession) {
        setProfile(null);
        setProfileLoaded(false);
        setSenhaMessage('');
      }
    });

    return () => subscription.unsubscribe();
  }, [hasSupabaseConfig, supabase]);

  useEffect(() => {
    if (!session?.user || !hasSupabaseConfig || !supabase) {
      return;
    }

    let cancelled = false;
    const client = supabase;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

    const loadProfile = async () => {
      const { data, error } = await client.from('profiles').select('*').eq('user_id', session.user.id).maybeSingle();
      if (cancelled) {
        return;
      }
      if (error) {
        setProfileMessage('Failed to pull your profile details.');
        return;
      }
      if (data) {
        setProfile(data as Profile);
        setProfileLoaded(true);
        return;
      }
      const initialProfile = createProfile(session.user.id, timezone);
      const { data: inserted, error: insertError } = await client
        .from('profiles')
        .insert(initialProfile)
        .select('*')
        .single();
      if (cancelled) {
        return;
      }
      if (insertError) {
        setProfileMessage('Could not create profile settings.');
        return;
      }
      setProfile(inserted as Profile);
      setProfileLoaded(true);
    };

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, hasSupabaseConfig, supabase, createProfile]);

  useEffect(() => {
    if (!profileLoaded || !profile || !session?.user || !supabase) {
      return;
    }
    const client = supabase;
    const timer = window.setTimeout(async () => {
      const { error } = await client.from('profiles').upsert(profile, { onConflict: 'user_id' });
      if (error) {
        setProfileMessage('Failed to save profile settings.');
        return;
      }
      setProfileMessage('Profile settings sealed in the cloud.');
    }, 600);
    return () => window.clearTimeout(timer);
  }, [profile, profileLoaded, session?.user?.id, supabase]);

  async function signInWithPassword() {
    if (!supabase || !authEmail.trim() || !authPassword) {
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail.trim(),
      password: authPassword,
    });
    setAuthMessage(error ? error.message : 'Logged in.');
  }

  async function signUpWithPassword() {
    if (!supabase || !authEmail.trim() || !authPassword) {
      return;
    }
    if (authPassword !== authPasswordConfirm) {
      setAuthMessage('The password confirmation does not match.');
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email: authEmail.trim(),
      password: authPassword,
    });
    if (error) {
      setAuthMessage(error.message);
      return;
    }
    setAuthMessage(
      data.session
        ? 'Account created and logged in.'
        : 'Account created. Check your email if the project requires confirmation before login.',
    );
    setAuthView('sign-in');
  }

  async function sendPasswordReset() {
    if (!supabase || !authEmail.trim()) {
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(authEmail.trim(), {
      redirectTo: window.location.origin,
    });
    setAuthMessage(
      error ? error.message : 'The key to the castle was sent to your email. Open the link on this device to define a new password inside the app.',
    );
  }

  async function updatePassword() {
    if (!supabase || !authPassword) {
      return;
    }
    if (authPassword !== authPasswordConfirm) {
      setSenhaMessage('The password confirmation does not match.');
      return;
    }
    const { error } = await supabase.auth.updateUser({
      password: authPassword,
    });
    if (error) {
      setSenhaMessage(error.message);
      return;
    }
    setSenhaMessage('New password set.');
    setAuthMessage('New password set.');
    setAuthPassword('');
    setAuthPasswordConfirm('');
    if (authView === 'recovery') {
      setAuthView('sign-in');
    }
  }

  async function signOut() {
    if (!supabase) {
      return;
    }
    await supabase.auth.signOut();
    setAuthMessage('Session terminated. Local data remains in this terminal.');
    setAuthPassword('');
    setAuthPasswordConfirm('');
    setSenhaMessage('');
    setAuthView('sign-in');
  }

  return {
    session, setSession, authView, setAuthView, authEmail, setAuthEmail,
    authPassword, setAuthPassword, authPasswordConfirm, setAuthPasswordConfirm,
    authMessage, setAuthMessage, passwordMessage, setSenhaMessage,
    profile, setProfile, profileLoaded, setProfileLoaded, profileMessage, setProfileMessage,
    signInWithPassword, signUpWithPassword, sendPasswordReset, updatePassword, signOut
  };
}
