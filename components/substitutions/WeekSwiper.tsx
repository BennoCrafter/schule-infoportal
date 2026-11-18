import type { Substitution } from "@/lib/types";

import { useEffect, useRef, useState } from "react";

import { SubsTable } from "./SubsTable";

import { cn, isToday } from "@/lib/utils";

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr"];

// Phone week view: one day per screen, swipe (CSS scroll-snap) or tap a tab.
export function WeekSwiper({
  days,
  map,
  loading,
}: {
  days: string[];
  map: Map<string, Substitution[]>;
  loading: boolean;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const scrollTo = (i: number, behavior: ScrollBehavior = "smooth") => {
    const row = rowRef.current;

    row?.scrollTo({ left: i * row.clientWidth, behavior });
  };

  // Open on today (or Monday) whenever the week changes
  useEffect(() => {
    const i = Math.max(0, days.findIndex(isToday));

    setIndex(i);
    scrollTo(i, "instant");
  }, [days[0]]);

  return (
    <section aria-label="Woche" className="rounded-lg border bg-card">
      <div className="grid grid-cols-5 border-b" role="tablist">
        {days.map((day, i) => {
          const count = map.get(day)?.length ?? 0;

          return (
            <button
              key={day}
              aria-controls={`day-${day}`}
              aria-selected={i === index}
              className={cn(
                "py-2 flex flex-col items-center gap-0.5 text-xs border-b-2 -mb-px",
                i === index
                  ? "border-brand-text text-foreground font-semibold"
                  : "border-transparent text-muted-foreground",
              )}
              role="tab"
              onClick={() => scrollTo(i)}
            >
              <span className={isToday(day) ? "text-brand-text" : ""}>
                {WEEKDAYS[i]} {Number(day.slice(8))}.
              </span>
              <span className="tabular-nums">
                {loading ? "·" : count}
                <span className="sr-only"> Einträge</span>
              </span>
            </button>
          );
        })}
      </div>
      <div
        ref={rowRef}
        className="snap-row flex overflow-x-auto scrollbar-hide"
        onScroll={(e) => {
          const el = e.currentTarget;

          setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
      >
        {days.map((day) => (
          <div
            key={day}
            className="w-full shrink-0"
            id={`day-${day}`}
            role="tabpanel"
          >
            <SubsTable
              compact
              emptyText="Keine Vertretungen an diesem Tag."
              loading={loading}
              subs={map.get(day) ?? []}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
