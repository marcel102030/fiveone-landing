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

