import type { Substitution } from "@/lib/types";

import { SubsTable } from "./SubsTable";

import { cn, formatDateLong, isToday } from "@/lib/utils";

// "Liste" view: the week's days stacked top to bottom. Empty days collapse to
// a single header line so the days with entries stand out.
export function DayList({
  days,
  map,
  loading,
}: {
  days: string[];
  map: Map<string, Substitution[]>;
  loading: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      {days.map((day) => {
        const subs = map.get(day) ?? [];
        const today = isToday(day);
        const empty = !loading && subs.length === 0;

        return (
          <section
            key={day}
            aria-label={formatDateLong(day)}
            className={cn(
              "rounded-xl border bg-card overflow-hidden",
              today && "border-brand-text/50",
            )}
          >
            <div
              className={cn(
                "px-4 sm:px-5 py-3 flex items-baseline gap-2",
                !empty && "border-b",
              )}
            >
              <h3 className="text-sm font-semibold">{formatDateLong(day)}</h3>
              {today && (
                <span className="text-xs font-medium text-brand-text">
                  Heute
                </span>
              )}
              <span className="ml-auto text-xs text-muted-foreground">
                {loading
                  ? ""
                  : empty
                    ? "Keine Vertretungen"
                    : `${subs.length} ${subs.length === 1 ? "Eintrag" : "Einträge"}`}
              </span>
            </div>
            {!empty && (
              <SubsTable compact emptyText="" loading={loading} subs={subs} />
            )}
          </section>
        );
      })}
    </div>
  );
}
