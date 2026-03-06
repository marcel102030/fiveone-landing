const LOCAL_STORAGE_KEY = "fiveone_admin_auth";
const SESSION_STORAGE_KEY = "fiveone_admin_auth_session";

const getStorage = (type: "local" | "session"): Storage | null => {
  if (typeof window === "undefined") return null;
  try {
    return type === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
};

export type AdminAuthData = {
  email: string;
  ts: number; // epoch ms
  remember?: boolean;
};

type AuthRecord = {
  data: AdminAuthData | null;
  source: "local" | "session" | null;
};

const EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

function readFrom(storage: Storage | null, key: string): AdminAuthData | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw) as AdminAuthData;
    if (!data?.email) return null;
    if (!data.ts || Date.now() - data.ts > EXPIRATION_MS) {
      storage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    try { storage.removeItem(key); } catch {}
    return null;
  }
}

function getAuthRecord(): AuthRecord {
  const sessionData = readFrom(getStorage("session"), SESSION_STORAGE_KEY);
  if (sessionData) {
    return { data: sessionData, source: "session" };
  }
  const localData = readFrom(getStorage("local"), LOCAL_STORAGE_KEY);
  if (localData) {
    return { data: localData, source: "local" };
  }
  return { data: null, source: null };
}

export function isAdminAuthenticated(): boolean {
  return !!getAuthRecord().data;
}

export function setAdminAuthenticated(email: string, remember = false) {
  const payload: AdminAuthData = { email, ts: Date.now(), remember };
  try {
    const local = getStorage("local");
    const session = getStorage("session");
    if (remember) {
      session?.removeItem(SESSION_STORAGE_KEY);
      local?.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    } else {
      local?.removeItem(LOCAL_STORAGE_KEY);
      session?.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
    }
  } catch {
    // ignore storage errors
  }
}

export function clearAdminAuthenticated() {
  try { getStorage("local")?.removeItem(LOCAL_STORAGE_KEY); } catch {}
  try { getStorage("session")?.removeItem(SESSION_STORAGE_KEY); } catch {}
}

export function getAdminEmail(): string | null {
  return getAuthRecord().data?.email ?? null;
}

export function getAdminAuthData(): AdminAuthData | null {
  return getAuthRecord().data;
}

export default {
  isAdminAuthenticated,
  setAdminAuthenticated,
  clearAdminAuthenticated,
  getAdminEmail,
  getAdminAuthData,
};
