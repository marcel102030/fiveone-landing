const LOCAL_STORAGE_KEY = 'platform_user_email';
const SESSION_STORAGE_KEY = 'platform_user_email_session';
const PROFILE_STORAGE_KEY = 'platform_user_profile';
const FORMATION_STORAGE_KEY = 'platform_user_formation';

export type StoredUserRecord = {
  email: string;
  remember?: boolean;
};

const getStorage = (type: 'local' | 'session'): Storage | null => {
  if (typeof window === 'undefined') return null;
  try {
    return type === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
};

const readFrom = (storage: Storage | null, key: string): StoredUserRecord | null => {
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const email = raw.trim().toLowerCase();
    if (!email) {
      storage.removeItem(key);
      return null;
    }
    return { email };
  } catch {
    try { storage?.removeItem(key); } catch {}
    return null;
  }
};

export function getStoredUser(): StoredUserRecord | null {
  const sessionUser = readFrom(getStorage('session'), SESSION_STORAGE_KEY);
  if (sessionUser) return { ...sessionUser, remember: false };
  const localUser = readFrom(getStorage('local'), LOCAL_STORAGE_KEY);
  if (localUser) return { ...localUser, remember: true };
  return null;
}

export function getCurrentUserId(): string | null {
  return getStoredUser()?.email ?? null;
}

export function setCurrentUser(email: string, remember = false): void {
  const normalized = email.trim().toLowerCase();
  try {
    const local = getStorage('local');
    const session = getStorage('session');
    if (remember) {
      session?.removeItem(SESSION_STORAGE_KEY);
      local?.setItem(LOCAL_STORAGE_KEY, normalized);
    } else {
      local?.removeItem(LOCAL_STORAGE_KEY);
      session?.setItem(SESSION_STORAGE_KEY, normalized);
    }
  } catch {
    /* ignore storage errors */
  }
}

export function clearCurrentUser(): void {
  try { getStorage('local')?.removeItem(LOCAL_STORAGE_KEY); } catch {}
  try { getStorage('session')?.removeItem(SESSION_STORAGE_KEY); } catch {}
  try { getStorage('local')?.removeItem(PROFILE_STORAGE_KEY); } catch {}
  try { getStorage('local')?.removeItem(FORMATION_STORAGE_KEY); } catch {}
}

export default {
  getCurrentUserId,
  setCurrentUser,
  clearCurrentUser,
  getStoredUser,
};
