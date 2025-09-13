const STORAGE_KEY = "fiveone_admin_auth";

export type AdminAuthData = {
  email: string;
  ts: number; // epoch ms
};

export function isAdminAuthenticated(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw) as AdminAuthData;
    // Optional: expire after 7 days
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    return !!data?.email && Date.now() - (data.ts || 0) < sevenDaysMs;
  } catch {
    return false;
  }
}

export function setAdminAuthenticated(email: string) {
  const payload: AdminAuthData = { email, ts: Date.now() };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch {}
}

export function clearAdminAuthenticated() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

export function getAdminEmail(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as AdminAuthData;
    return data?.email || null;
  } catch {
    return null;
  }
}

export default {
  isAdminAuthenticated,
  setAdminAuthenticated,
  clearAdminAuthenticated,
  getAdminEmail,
};

