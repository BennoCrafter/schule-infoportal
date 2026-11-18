import type { Substitution } from "@/lib/types";

import { InfoBadge, PeriodBadge } from "./badges";

import { cn, isToday } from "@/lib/utils";

function formatDayHeader(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const weekday = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][date.getDay()];

  return { weekday, dm: `${d}.${m}.` };
}

function TimetableEntry({ sub }: { sub: Substitution }) {
  return (
    <div className="rounded-md bg-muted/60 px-2 py-1.5 text-xs">
      <p className="truncate">
        <span className="font-semibold mr-1.5">{sub.class_name}</span>
        <span className="text-muted-foreground">
          {sub.absent_teacher || "—"}
        </span>
        <span aria-label="vertreten durch" className="mx-1 text-faint">
          →
        </span>
        <span>{sub.substitution_teacher || "—"}</span>
      </p>
      {(sub.subject_abbreviation || sub.room || sub.info) && (
        <div className="mt-1 flex items-center gap-1.5 flex-wrap text-muted-foreground">
          {sub.subject_abbreviation && (
            <span className="font-mono">{sub.subject_abbreviation}</span>
          )}
          {sub.room && <span>{sub.room}</span>}
          {sub.info && <InfoBadge info={sub.info} />}
        </div>
      )}
    </div>
  );
}

export function WeekTimetable({
  days,
  periods,
  map,
  loading,
}: {
  days: string[];
  periods: number[];
  map: Map<string, Substitution[]>;
  loading: boolean;
}) {
  return (
    <section
      aria-label="Woche"
      className="rounded-lg border bg-card overflow-x-auto"
    >
      <table
        aria-busy={loading}
        className="w-full border-collapse table-fixed min-w-[780px]"
      >
        <thead>
          <tr className="border-b">
            <th
              className="w-14 text-left px-3 py-2.5 text-xs font-medium text-muted-foreground border-r"
              scope="col"
            >
              Std.
            </th>
            {days.map((day) => {
              const { weekday, dm } = formatDayHeader(day);
              const today = isToday(day);

              return (
                <th
                  key={day}
                  className={cn(
                    "text-left px-3 py-2.5 text-sm font-semibold whitespace-nowrap",
                    today && "bg-brand-soft/40",
                  )}
                  scope="col"
                >
                  {weekday}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    {dm}
                  </span>
                  {today && (
                    <span className="ml-1.5 text-xs font-medium text-brand-text">
                      Heute
                    </span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {periods.map((p) => (
            <tr key={p} className="border-b last:border-b-0">
              <th className="px-3 py-2 align-top border-r" scope="row">
                <PeriodBadge period={String(p)} />
              </th>
              {days.map((day) => {
                const subs = (map.get(day) ?? []).filter(
                  (s) => parseInt(s.period, 10) === p,
                );

                return (
                  <td
                    key={day}
                    className={cn(
                      "px-2 py-2 align-top",
                      isToday(day) && "bg-brand-soft/20",
                    )}
                  >
                    {loading ? (
                      <div className="h-9 rounded-md bg-muted animate-si-pulse" />
                    ) : (
                      <div className="flex flex-col gap-1">
                        {subs.map((sub, i) => (
                          <TimetableEntry key={i} sub={sub} />
                        ))}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
