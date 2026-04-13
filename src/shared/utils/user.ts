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
  const local = getStorage('local');
  const session = getStorage('session');
  try { local?.removeItem(LOCAL_STORAGE_KEY); } catch {}
  try { session?.removeItem(SESSION_STORAGE_KEY); } catch {}
  try { local?.removeItem(PROFILE_STORAGE_KEY); } catch {}
  try { local?.removeItem(FORMATION_STORAGE_KEY); } catch {}
  // Marca logout explícito para que a plataforma saiba limpar o estado correto
  try { local?.setItem('fiveone_active_user', '__logged_out__'); } catch {}
  // Limpa todos os dados de progresso do usuário anterior
  try { local?.removeItem('videos_assistidos'); } catch {}
  try { local?.removeItem('fiveone_last_lesson'); } catch {}
  try { local?.removeItem('fiveone_completed_lessons_v1'); } catch {}
  try {
    if (local) {
      const keys: string[] = [];
      for (let i = 0; i < local.length; i++) {
        const k = local.key(i);
        if (k?.startsWith('fiveone_progress::')) keys.push(k);
      }
      keys.forEach(k => { try { local.removeItem(k); } catch {} });
    }
  } catch {}
}

export default {
  getCurrentUserId,
  setCurrentUser,
  clearCurrentUser,
  getStoredUser,
};
