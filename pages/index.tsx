import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import { SchuleInfoportalAPI } from "@/lib/schule-infoportal-api";

const API_URL = "/api/proxy";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    try {
      if (sessionStorage.getItem("schule_auth")) {
        router.replace("/substitutions");
      }
    } catch {}
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const api = new SchuleInfoportalAPI(API_URL, username, password);
      await api.authCheck();
      sessionStorage.setItem(
        "schule_auth",
        JSON.stringify({ username, password }),
      );
      router.push("/substitutions");
    } catch {
      setError("Ungültige Anmeldedaten. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--background)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
          style={{
            borderColor: "oklch(0.5 0.2 280)",
            borderTopColor: "transparent",
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute rounded-full"
          style={{
            top: "-20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 600,
            background:
              "radial-gradient(ellipse, oklch(0.45 0.22 280 / 0.12) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            bottom: "-20%",
            right: "20%",
            width: 500,
            height: 500,
            background:
              "radial-gradient(ellipse, oklch(0.45 0.22 240 / 0.08) 0%, transparent 70%)",
          }}
        />
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(oklch(1 0 0 / 0.04) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative w-full max-w-[340px] animate-si-slide-up">
        {/* Logo block */}
        <div className="flex flex-col items-center mb-7">
          <div
            className="w-13 h-13 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
            style={{
              width: 52,
              height: 52,
              background:
                "linear-gradient(135deg, oklch(0.55 0.22 285) 0%, oklch(0.45 0.25 275) 100%)",
              boxShadow: "0 8px 32px oklch(0.5 0.22 280 / 0.35)",
            }}
          >
            <svg
              width={26}
              height={26}
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
            </svg>
          </div>
          <h1
            className="text-xl font-bold tracking-tight"
            style={{ color: "var(--foreground)" }}
          >
            Vertretungsplan
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "var(--muted-foreground)" }}
          >
            Schule Infoportal
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-7 shadow-2xl"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-username"
                className="text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: "var(--muted-foreground)" }}
              >
                Benutzername
              </label>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Benutzername"
                autoComplete="username"
                required
                disabled={loading}
                className="h-9 rounded-xl px-3.5 text-sm outline-none transition-all"
                style={{
                  background: "var(--input)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 0 0 2px oklch(0.55 0.22 285 / 0.4)")
                }
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-password"
                className="text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: "var(--muted-foreground)" }}
              >
                Passwort
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Passwort"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  className="h-9 w-full rounded-xl px-3.5 pr-10 text-sm outline-none transition-all"
                  style={{
                    background: "var(--input)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 0 0 2px oklch(0.55 0.22 285 / 0.4)")
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {showPw ? (
                    <svg
                      width={16}
                      height={16}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg
                      width={16}
                      height={16}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <circle cx={12} cy={12} r={3} />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-start gap-2.5 rounded-xl px-3.5 py-2.5 text-xs animate-si-fade-in"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "rgb(252,165,165)",
                }}
              >
                <svg
                  width={14}
                  height={14}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5 shrink-0"
                >
                  <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="h-9 rounded-xl text-sm font-semibold transition-all mt-0.5 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.22 285) 0%, oklch(0.45 0.25 275) 100%)",
                color: "white",
                boxShadow: "0 4px 16px oklch(0.5 0.22 280 / 0.3)",
              }}
            >
              {loading ? (
                <>
                  <span
                    className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin"
                    style={{
                      borderColor: "rgba(255,255,255,0.4)",
                      borderTopColor: "transparent",
                    }}
                  />
                  Anmelden…
                </>
              ) : (
                "Anmelden"
              )}
            </button>
          </form>
        </div>

        <p
          className="text-center text-[11px] mt-5"
          style={{ color: "oklch(0.4 0 0)" }}
        >
          Schule Infoportal · Vertretungsplan
        </p>
      </div>
    </div>
  );
}
