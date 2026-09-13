import type { Substitution } from "@/lib/types";

import { InfoBadge, PeriodBadge } from "./badges";
import { ACCENT } from "./theme";

import { isToday } from "@/lib/utils";

function formatDayHeader(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const weekday = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][date.getDay()];

  return { weekday, dm: `${d}.${m}.` };
}

function TimetableEntry({ sub }: { sub: Substitution }) {
  return (
    <div
      className="inline-flex w-fit max-w-full flex-col gap-1 py-1.5 px-2 rounded-lg"
      style={{ background: "var(--muted)" }}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span
          className="font-black text-[11px] shrink-0"
          style={{ color: "var(--foreground)" }}
        >
          {sub.class_name}
        </span>
        <span
          className="text-[10px] min-w-0 truncate"
          style={{ color: "var(--muted-foreground)" }}
        >
          {sub.absent_teacher || "—"}
          <span className="mx-0.5" style={{ color: "oklch(0.45 0 0)" }}>
            →
          </span>
          <span
            style={{
              color: sub.substitution_teacher
                ? "var(--foreground)"
                : "oklch(0.4 0 0)",
            }}
          >
            {sub.substitution_teacher || "—"}
          </span>
        </span>
      </div>
      {(sub.subject_abbreviation || sub.room || sub.info) && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {sub.subject_abbreviation && (
            <span
              className="text-[9px] font-mono font-bold"
              style={{ color: "var(--muted-foreground)" }}
            >
              {sub.subject_abbreviation}
            </span>
          )}
          {sub.room && (
            <span
              className="text-[9px] font-mono"
              style={{ color: "var(--muted-foreground)" }}
            >
              {sub.room}
            </span>
          )}
          {sub.info && <InfoBadge info={sub.info} />}
        </div>
      )}
    </div>
  );
}

function TimetableCell({ subs }: { subs: Substitution[] }) {
  if (subs.length === 0) {
    return (
      <span className="text-xs" style={{ color: "oklch(0.32 0 0)" }}>
        –
      </span>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      {subs.map((sub, i) => (
        <TimetableEntry key={i} sub={sub} />
      ))}
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
      className="rounded-2xl overflow-hidden animate-si-slide-up"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        boxShadow: "0 4px 24px oklch(0 0 0 / 0.2)",
      }}
    >
      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse"
          style={{ minWidth: 780, tableLayout: "fixed" }}
        >
          <thead>
            <tr>
              <th
                className="text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"
                style={{
                  color: "var(--muted-foreground)",
                  borderBottom: "1px solid var(--border)",
                  borderRight: "1px solid var(--border)",
                  width: 56,
                }}
              >
                Std.
              </th>
              {days.map((day) => {
                const { weekday, dm } = formatDayHeader(day);
                const todayCol = isToday(day);

                return (
                  <th
                    key={day}
                    className="text-left px-3 py-2.5 whitespace-nowrap"
                    style={{
                      borderBottom: "1px solid var(--border)",
                      background: todayCol ? ACCENT.soft(0.08) : "transparent",
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-xs font-bold"
                        style={{
                          color: todayCol ? ACCENT.mid : "var(--foreground)",
                        }}
                      >
                        {weekday}
                      </span>
                      <span
                        className="text-[10px] font-normal normal-case tracking-normal"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {dm}
                      </span>
                      {todayCol && (
                        <span
                          className="text-[8px] font-black px-1 py-0.5 rounded uppercase tracking-widest"
                          style={{
                            background: ACCENT.soft(0.15),
                            color: ACCENT.mid,
                          }}
                        >
                          Heute
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading
              ? periods.map((p) => (
                  <tr
                    key={p}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td
                      className="px-3 py-2.5 align-top"
                      style={{ borderRight: "1px solid var(--border)" }}
                    >
                      <div
                        className="rounded animate-si-pulse"
                        style={{
                          height: 18,
                          width: 22,
                          background: "var(--muted)",
                        }}
                      />
                    </td>
                    {days.map((day) => (
                      <td key={day} className="px-2 py-2.5 align-top">
                        <div
                          className="rounded-lg animate-si-pulse"
                          style={{ height: 36, background: "var(--muted)" }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              : periods.map((p) => (
                  <tr
                    key={p}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td
                      className="px-3 py-2.5 align-top"
                      style={{ borderRight: "1px solid var(--border)" }}
                    >
                      <PeriodBadge period={String(p)} />
                    </td>
                    {days.map((day) => {
                      const subs = (map.get(day) ?? []).filter(
                        (s) => parseInt(s.period, 10) === p,
                      );

                      return (
                        <td
                          key={day}
                          className="px-2 py-2.5 align-top"
                          style={{
                            background: isToday(day)
                              ? ACCENT.soft(0.04)
                              : "transparent",
                          }}
                        >
                          <TimetableCell subs={subs} />
                        </td>
                      );
                    })}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
