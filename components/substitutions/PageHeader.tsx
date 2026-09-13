import type { LastUpdated } from "@/lib/types";

import { ACCENT, MAX_LAST_UPDATED_HOURS } from "./theme";

import { formatDateTime } from "@/lib/utils";

export function PageHeader({
  lastUpdated,
  loading,
  onRefresh,
  onLogout,
}: {
  lastUpdated: LastUpdated | null;
  loading: boolean;
  onRefresh: () => void;
  onLogout: () => void;
}) {
  const hoursSinceUpdate =
    lastUpdated?.has_date && lastUpdated.last_update
      ? Math.floor(
          (Date.now() - new Date(lastUpdated.last_update).getTime()) / 3600000,
        )
      : null;
  const isFresh =
    hoursSinceUpdate !== null && hoursSinceUpdate < MAX_LAST_UPDATED_HOURS;

  return (
    <header
      className="sticky top-0 z-20"
      style={{
        background: "oklch(from var(--background) l c h / 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: `linear-gradient(135deg, ${ACCENT.base}, ${ACCENT.deep})`,
              boxShadow: `0 2px 8px ${ACCENT.glow(0.35)}`,
            }}
          >
            <svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke={ACCENT.fg}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
            </svg>
          </div>
          <span
            className="font-semibold text-sm hidden sm:block"
            style={{ color: "var(--foreground)" }}
          >
            Vertretungsplan
          </span>
        </div>

        <div
          className="hidden md:flex items-center gap-1.5 text-xs select-none"
          style={{ color: "var(--muted-foreground)" }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-si-pulse"
            style={{
              background: isFresh ? "rgb(34,197,94)" : "rgb(255, 38, 71)",
            }}
          />
          {lastUpdated?.has_date && lastUpdated.last_update ? (
            <span>
              Aktualisiert {formatDateTime(lastUpdated.last_update)} Uhr (vor{" "}
              {hoursSinceUpdate} Stunden)
            </span>
          ) : (
            <span>Aktualisierung nicht verfügbar</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            disabled={loading}
            title="Aktualisieren"
            className="p-2 rounded-lg transition-all disabled:opacity-30"
            style={{ color: "var(--muted-foreground)" }}
            onClick={onRefresh}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--muted)";
              e.currentTarget.style.color = "var(--foreground)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--muted-foreground)";
            }}
          >
            <svg
              width={15}
              height={15}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={loading ? { animation: "spin 1.2s linear infinite" } : {}}
            >
              <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
          <button
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              color: "var(--muted-foreground)",
              border: "1px solid var(--border)",
            }}
            onClick={onLogout}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--foreground)";
              e.currentTarget.style.borderColor = "var(--ring)";
              e.currentTarget.style.background = "var(--muted)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--muted-foreground)";
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <svg
              width={13}
              height={13}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
            <span className="hidden sm:inline">Abmelden</span>
          </button>
        </div>
      </div>
    </header>
  );
}
