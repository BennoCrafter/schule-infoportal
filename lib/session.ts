/**
 * Encrypted session cookie holding the upstream Basic-Auth credentials.
 * Server-only: the cookie is httpOnly, so browser JS never sees the password.
 */
export interface Credentials {
  username: string;
  password: string;
}

export const API_BASE = "https://schule-infoportal-api.vercel.app";
export const SESSION_COOKIE = "schule_session";
// Browsers cap cookie lifetime at 400 days; renewed on every proxied request.
const MAX_AGE_SECONDS = 400 * 24 * 60 * 60;

const { subtle } = globalThis.crypto;
const text = new TextEncoder();

async function key(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET;

  if (!secret) throw new Error("SESSION_SECRET is not set");
  const raw = await subtle.digest("SHA-256", text.encode(secret));

  return subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}

// Token = base64url(iv[12] || AES-256-GCM ciphertext+tag)
export async function seal(creds: Credentials): Promise<string> {
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const data = await subtle.encrypt(
    { name: "AES-GCM", iv },
    await key(),
    text.encode(JSON.stringify(creds)),
  );
  const out = new Uint8Array(12 + data.byteLength);

  out.set(iv);
  out.set(new Uint8Array(data), 12);

  return Buffer.from(out).toString("base64url");
}

export async function unseal(
  token: string | undefined,
): Promise<Credentials | null> {
  if (!token) return null;
  try {
    const buf = new Uint8Array(Buffer.from(token, "base64url"));
    const plain = await subtle.decrypt(
      { name: "AES-GCM", iv: buf.subarray(0, 12) },
      await key(),
      buf.subarray(12),
    );
    const { username, password } = JSON.parse(new TextDecoder().decode(plain));

    return typeof username === "string" && typeof password === "string"
      ? { username, password }
      : null;
  } catch {
    return null;
  }
}

function cookie(value: string, maxAge: number): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export const sessionCookie = (token: string) => cookie(token, MAX_AGE_SECONDS);
export const clearedSessionCookie = () => cookie("", 0);

export const basicAuth = ({ username, password }: Credentials) =>
  `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
