import type { NewsMessage } from "@/lib/types";

import { formatDateLong } from "@/lib/utils";

export function NewsSection({
  news,
  loading,
  animationDelay,
}: {
  news: NewsMessage[];
  loading: boolean;
  animationDelay?: string;
}) {
  return (
    <section
      className="rounded-2xl overflow-hidden animate-si-slide-up"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        boxShadow: "0 4px 24px oklch(0 0 0 / 0.2)",
        animationDelay,
      }}
    >
      <div
        className="px-5 py-4 flex items-center gap-2.5"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
          style={{ background: "rgba(245,158,11,0.15)" }}
        >
          <svg
            width={11}
            height={11}
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgb(251,191,36)"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
          </svg>
        </div>
        <h2
          className="text-sm font-semibold"
          style={{ color: "var(--foreground)" }}
        >
          Neuigkeiten
        </h2>
        {!loading && (
          <span
            className="ml-auto text-[11px]"
            style={{ color: "var(--muted-foreground)" }}
          >
            {news.length} {news.length === 1 ? "Meldung" : "Meldungen"}
          </span>
        )}
      </div>
      <div>
        {loading
          ? [0, 1].map((i) => (
              <div
                key={i}
                className="px-5 py-4"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <div
                  className="rounded animate-si-pulse mb-2"
                  style={{
                    height: 12,
                    width: "75%",
                    background: "var(--muted)",
                  }}
                />
                <div
                  className="rounded animate-si-pulse"
                  style={{
                    height: 10,
                    width: "40%",
                    background: "var(--muted)",
                  }}
                />
              </div>
            ))
          : news.map((item, i) => (
              <div
                key={i}
                className="px-5 py-4"
                style={{
                  borderBottom:
                    i < news.length - 1 ? "1px solid var(--border)" : "none",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--muted)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div className="flex items-start gap-3">
                  <span
                    className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: "rgb(251,191,36)" }}
                  />
                  <div>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--foreground)" }}
                    >
                      {item.message}
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {formatDateLong(item.date)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
      </div>
    </section>
  );
}
