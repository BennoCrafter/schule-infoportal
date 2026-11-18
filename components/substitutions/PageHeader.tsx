import type { LastUpdated } from "@/lib/types";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { GraduationCap, LogOut, Moon, RefreshCw, Sun } from "lucide-react";

import { MAX_LAST_UPDATED_HOURS } from "./theme";

import { formatDateTime } from "@/lib/utils";

const iconBtn =
  "inline-flex items-center justify-center size-9 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 transition-colors";

function updatedLabel(iso: string) {
  const mins = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 60000));
  const ago =
    mins < 1
      ? "gerade eben"
      : mins < 60
        ? `vor ${mins} Min.`
        : mins < 48 * 60
          ? `vor ${Math.floor(mins / 60)} Std.`
          : `vor ${Math.floor(mins / 1440)} Tagen`;
  const d = new Date(iso);
  const day =
    d.toDateString() === new Date().toDateString()
      ? ""
      : `${d.getDate()}.${d.getMonth() + 1}. `;

  return {
    // Today: just "vor 30 Min."; older: "14.9. 07:42 · vor 2 Tagen"
    text: day ? `${day}${formatDateTime(iso)} · ${ago}` : ago,
    full: `${d.getDate()}.${d.getMonth() + 1}. ${formatDateTime(iso)} Uhr`,
    fresh: mins < MAX_LAST_UPDATED_HOURS * 60,
  };
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  const dark = resolvedTheme === "dark";

  return (
    <button
      aria-label={dark ? "Helles Design" : "Dunkles Design"}
      className={iconBtn}
      title={dark ? "Helles Design" : "Dunkles Design"}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {mounted && (dark ? <Sun size={16} /> : <Moon size={16} />)}
    </button>
  );
}

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
  const updated =
    lastUpdated?.has_date && lastUpdated.last_update
      ? updatedLabel(lastUpdated.last_update)
      : null;

  return (
    <header className="sticky top-0 z-20 bg-background border-b">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <span className="size-7 rounded-md bg-brand text-brand-fg flex items-center justify-center">
            <GraduationCap size={16} />
          </span>
          <h1 className="font-semibold text-sm hidden sm:block">
            Vertretungsplan
          </h1>
        </div>

        <p
          className="flex-1 min-w-0 flex items-center justify-center gap-1.5 text-xs text-muted-foreground truncate"
          title={updated ? `Aktualisiert ${updated.full}` : undefined}
        >
          <span
            aria-hidden
            className="size-1.5 shrink-0 rounded-full"
            style={{
              background: updated?.fresh
                ? "var(--tone-green)"
                : "var(--muted-foreground)",
            }}
          />
          {updated ? (
            <span className="truncate">{updated.text}</span>
          ) : (
            <span className="truncate">Aktualisierung nicht verfügbar</span>
          )}
        </p>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            aria-label="Aktualisieren"
            className={iconBtn}
            disabled={loading}
            title="Aktualisieren"
            onClick={onRefresh}
          >
            <RefreshCw className={loading ? "animate-spin" : ""} size={16} />
          </button>
          <ThemeToggle />
          <button
            aria-label="Abmelden"
            className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            onClick={onLogout}
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Abmelden</span>
          </button>
        </div>
      </div>
    </header>
  );
}
