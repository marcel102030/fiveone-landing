export function getCurrentUserId(): string | null {
  try {
    const email = localStorage.getItem('platform_user_email');
    if (!email) return null;
    return email.trim().toLowerCase();
  } catch {
    return null;
  }
}

export function setCurrentUser(email: string) {
  try { localStorage.setItem('platform_user_email', email.trim().toLowerCase()); } catch {}
}

export function clearCurrentUser() {
  try {
    localStorage.removeItem('platform_user_email');
    localStorage.removeItem('platform_user_profile');
    localStorage.removeItem('platform_user_formation');
  } catch {}
}
