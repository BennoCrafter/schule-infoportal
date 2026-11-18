import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Eye,
  EyeOff,
  GraduationCap,
  LoaderCircle,
  TriangleAlert,
} from "lucide-react";

import { getSessionUser, login, migrateLegacyAuth } from "@/lib/auth";

const inputClass =
  "h-10 w-full rounded-xl border bg-input/40 px-3.5 text-base sm:text-sm outline-none transition focus:border-brand-text focus:ring-2 focus:ring-brand-soft disabled:opacity-60";
const labelClass =
  "text-[11px] font-semibold uppercase tracking-widest text-muted-foreground";
const brandGradient =
  "linear-gradient(135deg, var(--brand), var(--brand-deep))";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  // Already logged in (or migrating old saved credentials)? Skip the form.
  useEffect(() => {
    migrateLegacyAuth()
      .then(getSessionUser)
      .then((ok) => {
        if (ok) router.replace("/substitutions");
        else setChecking(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const status = await login(username, password);

      if (status === 204) return void router.push("/substitutions");
      setError(
        status === 401
          ? "Benutzername oder Passwort ist falsch."
          : "Anmeldung gerade nicht möglich. Bitte später erneut versuchen.",
      );
    } catch {
      setError("Keine Verbindung. Bitte Internetverbindung prüfen.");
    }
    setLoading(false);
  };

  if (checking) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <LoaderCircle
          aria-label="Lädt"
          className="animate-spin text-muted-foreground"
          size={20}
        />
      </div>
    );
  }

  return (
    <main className="relative min-h-dvh flex items-center justify-center p-4 overflow-hidden">
      {/* Background: faint dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklch, var(--foreground) 7%, transparent) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative w-full max-w-[340px]">
        <div className="flex flex-col items-center mb-7">
          <span
            className="size-13 rounded-2xl text-brand-fg flex items-center justify-center mb-4"
            style={{ background: brandGradient }}
          >
            <GraduationCap size={26} strokeWidth={1.6} />
          </span>
          <h1 className="text-xl font-bold tracking-tight">Vertretungsplan</h1>
          <p className="text-sm mt-0.5 text-muted-foreground">
            Schule Infoportal
          </p>
        </div>

        <form
          className="flex flex-col gap-4 rounded-2xl border bg-card p-7"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="login-username">
              Benutzername
            </label>
            <input
              required
              autoCapitalize="none"
              autoComplete="username"
              className={inputClass}
              disabled={loading}
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="login-password">
              Passwort
            </label>
            <div className="relative">
              <input
                required
                autoComplete="current-password"
                className={`${inputClass} pr-10`}
                disabled={loading}
                id="login-password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                aria-label={showPw ? "Passwort verbergen" : "Passwort anzeigen"}
                aria-pressed={showPw}
                className="absolute right-1 top-1/2 -translate-y-1/2 size-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
                type="button"
                onClick={() => setShowPw((v) => !v)}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p
              className="flex items-start gap-2 text-sm"
              role="alert"
              style={{ color: "var(--tone-red)" }}
            >
              <TriangleAlert className="mt-0.5 shrink-0" size={16} />
              {error}
            </p>
          )}

          <button
            className="mt-1 h-10 rounded-xl text-brand-fg text-sm font-semibold flex items-center justify-center gap-2 transition hover:brightness-95 active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait"
            disabled={loading}
            style={{ background: brandGradient }}
            type="submit"
          >
            {loading && <LoaderCircle className="animate-spin" size={16} />}
            {loading ? "Anmelden…" : "Anmelden"}
          </button>
        </form>

        <p className="mt-5 text-center text-[11px] text-muted-foreground">
          Schule Infoportal · Vertretungsplan
        </p>
      </div>
    </main>
  );
}
