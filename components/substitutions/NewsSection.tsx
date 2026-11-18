import type { RawNewsMessage } from "@/lib/types";

import { useState } from "react";
import { ChevronDown, Megaphone } from "lucide-react";

import { formatDateLong } from "@/lib/utils";

// Collapsed: first message, clamped to 3 lines. Expanded: everything.
export function NewsSection({
  news,
  loading,
  showDates = false,
}: {
  news: RawNewsMessage[];
  loading: boolean;
  showDates?: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (loading) {
    return <div className="h-14 rounded-xl border bg-card animate-si-pulse" />;
  }
  if (news.length === 0) return null;

  const first = news[0].raw_text;
  const expandable =
    news.length > 1 || first.length > 220 || first.split("\n").length > 3;
  const shown = open ? news : news.slice(0, 1);

  return (
    <section
      aria-labelledby="news-heading"
      className="rounded-xl border bg-card px-4 sm:px-5 py-3"
    >
      <div className="flex items-start gap-3">
        <Megaphone className="mt-0.5 shrink-0 text-brand-text" size={16} />
        <div className="min-w-0 flex-1">
          <h2 className="sr-only" id="news-heading">
            Neuigkeiten
          </h2>
          <ul className="flex flex-col gap-3">
            {shown.map((item) => (
              <li key={item.date}>
                {showDates && (
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    {formatDateLong(item.date)}
                  </p>
                )}
                <p
                  className={`text-sm leading-relaxed whitespace-pre-line break-words ${open ? "" : "line-clamp-3"}`}
                >
                  {item.raw_text.trim()}
                </p>
              </li>
            ))}
          </ul>
          {expandable && (
            <button
              aria-expanded={open}
              className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setOpen((v) => !v)}
            >
              {open
                ? "Weniger anzeigen"
                : news.length > 1
                  ? `Alle ${news.length} Meldungen anzeigen`
                  : "Mehr anzeigen"}
              <ChevronDown
                className={open ? "rotate-180 transition" : "transition"}
                size={14}
              />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
