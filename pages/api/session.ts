/**
 * GET    → 200 { username } if a valid session cookie exists, else 401
 * POST   → { username, password }: verify upstream, then set the session cookie
 * DELETE → log out (clear the cookie)
 */
import type { NextApiRequest, NextApiResponse } from "next";

import {
  API_BASE,
  basicAuth,
  clearedSessionCookie,
  seal,
  SESSION_COOKIE,
  sessionCookie,
  unseal,
} from "@/lib/session";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!process.env.SESSION_SECRET) {
    console.error("[session] SESSION_SECRET is not set");

    return res.status(500).json({ error: "SESSION_SECRET is not set" });
  }

  if (req.method === "GET") {
    const creds = await unseal(req.cookies[SESSION_COOKIE]);

    return creds
      ? res.status(200).json({ username: creds.username })
      : res.status(401).json({});
  }

  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", clearedSessionCookie());

    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST, DELETE");

    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, password } = req.body ?? {};

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !username ||
    !password
  ) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  let upstream: Response;

  try {
    upstream = await fetch(`${API_BASE}/auth/check`, {
      headers: { Authorization: basicAuth({ username, password }) },
      cache: "no-store",
    });
  } catch (err) {
    console.error("[session]", err);

    return res.status(502).json({ error: "Could not reach upstream API." });
  }

  if (upstream.status === 401 || upstream.status === 403) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!upstream.ok) {
    return res
      .status(502)
      .json({ error: `Upstream API answered ${upstream.status}` });
  }

  res.setHeader(
    "Set-Cookie",
    sessionCookie(await seal({ username, password })),
  );

  return res.status(204).end();
}
