const SESSION_KEY = "lex_user";

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = "login.html";
}

export function requireRole(role) {
  const user = getSession();
  if (!user || user.role !== role) {
    window.location.href = "login.html";
    return null;
  }
  return user;
}
