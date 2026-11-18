// Client-side session helpers. Credentials live in an httpOnly cookie set by
// /api/session; the browser only ever sends them once, at login.

const LEGACY_AUTH_KEY = "schule_auth";

export async function login(username: string, password: string) {
  const res = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  return res.status;
}

export async function logout() {
  await fetch("/api/session", { method: "DELETE" }).catch(() => {});
}

// Logged-in username, or null without a valid session
export async function getSessionUser(): Promise<string | null> {
  const res = await fetch("/api/session", { cache: "no-store" }).catch(
    () => null,
  );

  return res?.ok ? (await res.json()).username : null;
}

// Older versions kept plaintext credentials in localStorage. Move them into
// the session cookie once; keep them only if the server couldn't be reached.
export async function migrateLegacyAuth() {
  let raw: string | null = null;

  try {
    raw = localStorage.getItem(LEGACY_AUTH_KEY);
  } catch {}
  if (!raw) return;
  try {
    const { username, password } = JSON.parse(raw);

    await login(username, password);
  } catch (e) {
    if (e instanceof TypeError) return; // network error: retry next visit
  }
  try {
    localStorage.removeItem(LEGACY_AUTH_KEY);
  } catch {}
}
