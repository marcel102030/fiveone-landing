import { useEffect, useMemo, useState } from 'react';
import { FormationKey, getUserByEmail } from '../services/userAccount';
import { getUserProfileDetails } from '../services/userProfile';
import { getCurrentUserId } from '../utils/user';

export type StoredPlatformUserProfile = {
  email: string;
  name: string | null;
  formation: FormationKey | null;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
};

const STORAGE_KEY = 'platform_user_profile';

export function readStoredPlatformProfile(): StoredPlatformUserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredPlatformUserProfile;
    if (parsed && parsed.email) {
      return {
        email: parsed.email.toLowerCase(),
        name: parsed.name ?? null,
        formation: (parsed.formation ?? null) as FormationKey | null,
        firstName: parsed.firstName ?? null,
        lastName: parsed.lastName ?? null,
        displayName: parsed.displayName ?? null,
      };
    }
  } catch {
    return null;
  }
  return null;
}

export function storePlatformProfile(profile: StoredPlatformUserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      email: profile.email.toLowerCase(),
      name: profile.name ?? null,
      formation: profile.formation ?? null,
      firstName: profile.firstName ?? null,
      lastName: profile.lastName ?? null,
      displayName: profile.displayName ?? profile.name ?? null,
    }));
    window.dispatchEvent(new Event('fiveone-profile-refresh'));
  } catch {
    /* ignore storage errors */
  }
}

export function clearStoredPlatformProfile(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('fiveone-profile-refresh'));
  } catch {}
}

function computeInitials(name: string | null | undefined, email: string): string {
  const source = (name && name.trim()) || email;
  const cleaned = source.replace(/@.*/, '');
  const parts = cleaned.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return email.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatFormationLabel(key: FormationKey): string {
  switch (key) {
    case 'APOSTOLO': return 'Apóstolo';
    case 'PROFETA': return 'Profeta';
    case 'EVANGELISTA': return 'Evangelista';
    case 'PASTOR': return 'Pastor';
    case 'MESTRE': return 'Mestre';
    default: return key;
  }
}

export function usePlatformUserProfile() {
  const [profile, setProfile] = useState<StoredPlatformUserProfile | null>(() => readStoredPlatformProfile());
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>(profile ? 'loaded' : 'idle');

  const email = typeof window !== 'undefined' ? getCurrentUserId() : null;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!email) {
      setProfile(null);
      setStatus('idle');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const stored = readStoredPlatformProfile();
    const fallbackFormation = (localStorage.getItem('platform_user_formation') as FormationKey | null) ?? null;

    if (stored && stored.email === normalizedEmail) {
      setProfile(stored);
      setStatus('loaded');
    } else {
      setProfile({ email: normalizedEmail, name: null, formation: fallbackFormation });
      setStatus('loading');
    }

    let cancelled = false;

    (async () => {
      try {
        const [row, details] = await Promise.all([
          getUserByEmail(normalizedEmail),
          getUserProfileDetails(normalizedEmail).catch(() => null),
        ]);
        if (cancelled) return;
        const formation = (row?.formation as FormationKey | null) ?? fallbackFormation ?? null;
        const firstName = details?.first_name || null;
        const lastName = details?.last_name || null;
        const preferredDisplayName = details?.display_name || null;
        const composedName = preferredDisplayName || [firstName, lastName].filter(Boolean).join(' ') || row?.name || null;
        const next: StoredPlatformUserProfile = {
          email: normalizedEmail,
          name: composedName,
          formation,
          firstName,
          lastName,
          displayName: preferredDisplayName,
        };
        setProfile(next);
        setStatus('loaded');
        storePlatformProfile(next);
        if (formation) {
          try { localStorage.setItem('platform_user_formation', formation); } catch {}
        }
      } catch {
        if (cancelled) return;
        setStatus('error');
        setProfile(prev => {
          if (prev && prev.email === normalizedEmail) return prev;
          return { email: normalizedEmail, name: null, formation: fallbackFormation };
        });
      }
    })();

    return () => { cancelled = true; };
  }, [email]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleSync = () => {
      const stored = readStoredPlatformProfile();
      if (stored) {
        setProfile(prev => {
          if (!prev) return stored;
          if (stored.email !== prev.email) return prev;
          return stored;
        });
      }
    };
    const storageHandler = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) handleSync();
    };
    window.addEventListener('storage', storageHandler);
    window.addEventListener('fiveone-profile-refresh', handleSync);
    return () => {
      window.removeEventListener('storage', storageHandler);
      window.removeEventListener('fiveone-profile-refresh', handleSync);
    };
  }, []);

  const decorated = useMemo(() => {
    if (!profile) return null;
    const displayName = (profile.displayName && profile.displayName.trim())
      || (profile.name && profile.name.trim())
      || profile.email;
    const initials = computeInitials(profile.displayName || profile.name, profile.email);
    const formationLabel = profile.formation ? formatFormationLabel(profile.formation) : null;
    return {
      ...profile,
      displayName,
      initials,
      formationLabel,
    };
  }, [profile]);

  return { profile: decorated, status };
}
