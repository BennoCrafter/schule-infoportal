import { ACCENT, type ViewMode } from "./theme";

export function NavBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      className="p-1.5 rounded-lg transition-all"
      style={{ color: "var(--muted-foreground)" }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--muted)";
        e.currentTarget.style.color = "var(--foreground)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--muted-foreground)";
      }}
    >
      {children}
    </button>
  );
}

export function Divider({ hideOnMobile = false }: { hideOnMobile?: boolean }) {
  return (
    <div
      className={`w-px h-4 shrink-0 ${hideOnMobile ? "hidden sm:block" : ""}`}
      style={{ background: "var(--border)" }}
    />
  );
}

export function FilterPill({
  active,
  onClick,
  children,
  grayedOut = false,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  grayedOut?: boolean;
}) {
  const style =
    active && grayedOut
      ? {
          background: "var(--muted)",
          color: "var(--muted-foreground)",
          border: `1px solid ${ACCENT.soft(0.4)}`,
        }
      : active
        ? {
            background: `linear-gradient(135deg, ${ACCENT.base}, ${ACCENT.deep})`,
            color: ACCENT.fg,
            boxShadow: `0 2px 8px ${ACCENT.glow(0.35)}`,
          }
        : {
            background: "var(--muted)",
            color: "var(--muted-foreground)",
            border: "1px solid var(--border)",
          };

  return (
    <button
      className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all disabled:cursor-not-allowed"
      style={style}
      disabled={grayedOut}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function ViewToggle({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (m: ViewMode) => void;
}) {
  return (
    <div
      className="flex items-center rounded-lg p-0.5 shrink-0"
      style={{ background: "var(--muted)", border: "1px solid var(--border)" }}
    >
      {(["day", "week"] as ViewMode[]).map((m) => {
        const active = mode === m;

        return (
          <button
            key={m}
            title={m === "day" ? "Tagesansicht" : "Wochenansicht"}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all"
            style={
              active
                ? {
                    background: "var(--card)",
                    color: "var(--foreground)",
                    boxShadow: "0 1px 4px oklch(0 0 0 / 0.25)",
                  }
                : { color: "var(--muted-foreground)" }
            }
            onClick={() => onChange(m)}
          >
            {m === "day" ? (
              <>
                <svg
                  width={12}
                  height={12}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                <span className="hidden sm:inline">Tag</span>
              </>
            ) : (
              <>
                <svg
                  width={12}
                  height={12}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                <span className="hidden sm:inline">Woche</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
