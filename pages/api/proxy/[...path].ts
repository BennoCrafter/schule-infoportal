/**
 * Catch-all proxy: forwards every GET /api/proxy/<...path>?<qs>
 * to the real Schule-Infoportal API, injecting the Basic-Auth
 * credentials from the encrypted session cookie.
 *
 * This sidesteps CORS – the browser only ever talks to the same origin.
 */
import type { NextApiRequest, NextApiResponse } from "next";

import {
  API_BASE,
  basicAuth,
  SESSION_COOKIE,
  sessionCookie,
  unseal,
} from "@/lib/session";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Only allow GET (the upstream API is read-only)
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Pull path segments out of the catch-all param
  const { path: rawPath, ...queryRest } = req.query;
  const pathStr = Array.isArray(rawPath) ? rawPath.join("/") : (rawPath ?? "");

  // Rebuild remaining query params (skip Next.js internal 'path')
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(queryRest)) {
    if (Array.isArray(v)) v.forEach((val) => qs.append(k, val));
    else if (v != null) qs.set(k, String(v));
  }
  const queryStr = qs.toString();
  const targetUrl = `${API_BASE}/${pathStr}${queryStr ? `?${queryStr}` : ""}`;

  const token = req.cookies[SESSION_COOKIE];
  const creds = await unseal(token);

  if (!creds) return res.status(401).json({ error: "Not logged in" });
  // Rolling session: every request pushes the expiry out again
  res.setHeader("Set-Cookie", sessionCookie(token!));

  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: basicAuth(creds),
  };

  try {
    const upstream = await fetch(targetUrl, {
      headers,
      // Disable Next.js / Node fetch caching so data is always fresh
      cache: "no-store",
    });

    const contentType = upstream.headers.get("content-type") ?? "";
    res.setHeader("Content-Type", contentType || "application/json");
    res.status(upstream.status);

    if (contentType.includes("application/json")) {
      res.json(await upstream.json());
    } else {
      res.send(await upstream.text());
    }
  } catch (err) {
    console.error("[proxy]", err);
    res.status(502).json({ error: "Could not reach upstream API." });
  }
}
