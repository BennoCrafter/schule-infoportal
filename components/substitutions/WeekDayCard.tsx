import type { Substitution } from "@/lib/types";

import { SubsTable } from "./SubsTable";
import { ACCENT } from "./theme";

import { formatDateLong, isToday } from "@/lib/utils";

export function WeekDayCard({
  date,
  subs,
  loading,
}: {
  date: string;
  subs: Substitution[];
  loading: boolean;
}) {
  const todayDate = isToday(date);
  const hasEntries = loading || subs.length > 0;

  return (
    <div
      className="rounded-xl overflow-hidden animate-si-slide-up"
      style={{
        background: "var(--card)",
        border: `1px solid ${todayDate ? ACCENT.glow(0.4) : "var(--border)"}`,
        boxShadow: todayDate
          ? `0 0 0 1px ${ACCENT.glow(0.15)}, 0 4px 20px oklch(0 0 0 / 0.18)`
          : "0 2px 12px oklch(0 0 0 / 0.15)",
      }}
    >
      {/* Day header */}
      <div
        className="px-4 py-3 flex items-center justify-between gap-3"
        style={{
          borderBottom: hasEntries ? "1px solid var(--border)" : "none",
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {todayDate && (
            <span
              className="shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest"
              style={{
                background: ACCENT.soft(0.15),
                color: ACCENT.mid,
                border: `1px solid ${ACCENT.soft(0.3)}`,
              }}
            >
              Heute
            </span>
          )}
          <span
            className="text-sm font-semibold truncate"
            style={{ color: "var(--foreground)" }}
          >
            {formatDateLong(date)}
          </span>
        </div>

        <span
          className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={
            loading
              ? { background: "var(--muted)", color: "var(--muted-foreground)" }
              : subs.length === 0
                ? { background: "var(--muted)", color: "oklch(0.45 0 0)" }
                : {
                    background: ACCENT.soft(0.15),
                    color: ACCENT.mid,
                    border: `1px solid ${ACCENT.soft(0.2)}`,
                  }
          }
        >
          {loading
            ? "…"
            : subs.length === 0
              ? "Keine Einträge"
              : `${subs.length} ${subs.length === 1 ? "Eintrag" : "Einträge"}`}
        </span>
      </div>

      {/* Table (only when there's something to show) */}
      {hasEntries && (
        <SubsTable
          compact
          subs={subs}
          loading={loading}
          emptyText="Keine Vertretungen"
        />
      )}
    </div>
  );
}
