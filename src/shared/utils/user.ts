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

  // Salva o email do usuário que está saindo para comparação no próximo login.
  // CRÍTICO: se o MESMO usuário voltar, o cache de progresso é preservado.
  // Se um USUÁRIO DIFERENTE entrar, o isolamento em plataforma.tsx apaga o cache.
  try {
    const outgoingEmail =
      readFrom(session, SESSION_STORAGE_KEY)?.email ||
      readFrom(local, LOCAL_STORAGE_KEY)?.email ||
      null;
    if (outgoingEmail) local?.setItem('fiveone_last_active_email', outgoingEmail);
  } catch {}

  try { local?.removeItem(LOCAL_STORAGE_KEY); } catch {}
  try { session?.removeItem(SESSION_STORAGE_KEY); } catch {}
  try { local?.removeItem(PROFILE_STORAGE_KEY); } catch {}
  try { local?.removeItem(FORMATION_STORAGE_KEY); } catch {}

  // Marca como "deslogado" — permite distinguir logout de simples reload
  try { local?.setItem('fiveone_active_user', '__logged_out__'); } catch {}

  // NÃO apaga dados de progresso aqui. O isolamento por usuário é feito em
  // plataforma.tsx: se o mesmo usuário volta, o cache é reutilizado; se for
  // um usuário diferente, o cache é apagado nesse momento.
  // Isso evita que o "Continuar Assistindo" suma quando o mesmo usuário sai e volta.

  // Limpa throttle de sync do sessionStorage — o próximo usuário não deve
  // herdar os timestamps de throttle do usuário anterior
  try {
    if (session) {
      const syncKeys: string[] = [];
      for (let i = 0; i < session.length; i++) {
        const k = session.key(i);
        if (k?.startsWith('fiveone_progress_sync_')) syncKeys.push(k);
      }
      syncKeys.forEach(k => { try { session.removeItem(k); } catch {} });
    }
  } catch {}
}

export default {
  getCurrentUserId,
  setCurrentUser,
  clearCurrentUser,
  getStoredUser,
};
