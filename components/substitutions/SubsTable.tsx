import type { Substitution } from "@/lib/types";

import { EmptyState } from "./EmptyState";
import { InfoBadge, PeriodBadge, SubjectChip } from "./badges";
import { COL_HEADS } from "./theme";

// ─── Mobile compact row ───────────────────────────────────────────────────────
// Two-line layout: [Class] [Period] Teacher → Sub  [InfoBadge]
//                  [SubjectChip] [Room]

function MobileRow({ sub }: { sub: Substitution }) {
  const hasSecondLine = !!(sub.subject_abbreviation || sub.room);

  return (
    <div
      className="px-4 py-3"
      style={{ borderBottom: "1px solid var(--border)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--muted)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Line 1 */}
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="font-black text-sm shrink-0"
          style={{ color: "var(--foreground)", minWidth: "2.25rem" }}
        >
          {sub.class_name}
        </span>
        <PeriodBadge period={sub.period} />
        <span
          className="text-sm min-w-0 flex-1 truncate"
          style={{ color: "var(--muted-foreground)" }}
        >
          {sub.absent_teacher || "—"}
          <span className="mx-1" style={{ color: "oklch(0.45 0 0)" }}>
            →
          </span>
          <span
            style={{
              color: sub.substitution_teacher
                ? "var(--foreground)"
                : "oklch(0.4 0 0)",
              fontWeight: sub.substitution_teacher ? 500 : 400,
            }}
          >
            {sub.substitution_teacher || "—"}
          </span>
        </span>
        {sub.info && (
          <span className="shrink-0">
            <InfoBadge info={sub.info} />
          </span>
        )}
      </div>
      {/* Line 2 — subject + room */}
      {hasSecondLine && (
        <div
          className="flex items-center gap-2 mt-1.5"
          style={{ paddingLeft: "calc(2.25rem + 1.5rem + 0.5rem)" }}
        >
          {sub.subject_abbreviation && (
            <SubjectChip subject={sub.subject_abbreviation} />
          )}
          {sub.room && (
            <span
              className="text-[11px] font-mono"
              style={{ color: "var(--muted-foreground)" }}
            >
              Raum&nbsp;{sub.room}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function MobileSkeletonRows({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="px-4 py-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="rounded animate-si-pulse shrink-0"
              style={{ height: 14, width: 32, background: "var(--muted)" }}
            />
            <div
              className="rounded-lg animate-si-pulse shrink-0"
              style={{ height: 24, width: 26, background: "var(--muted)" }}
            />
            <div
              className="rounded animate-si-pulse flex-1"
              style={{
                height: 12,
                background: "var(--muted)",
                maxWidth: [120, 90, 140, 100, 80][i % 5],
              }}
            />
            <div
              className="rounded-md animate-si-pulse shrink-0"
              style={{
                height: 18,
                width: [60, 70, 55, 65, 72][i % 5],
                background: "var(--muted)",
              }}
            />
          </div>
          {i % 2 === 0 && (
            <div
              className="flex gap-2 mt-1.5"
              style={{ paddingLeft: "calc(2.25rem + 1.5rem + 0.5rem)" }}
            >
              <div
                className="rounded-md animate-si-pulse"
                style={{ height: 18, width: 32, background: "var(--muted)" }}
              />
              <div
                className="rounded animate-si-pulse"
                style={{
                  height: 12,
                  width: 50,
                  background: "var(--muted)",
                  marginTop: 3,
                }}
              />
            </div>
          )}
        </div>
      ))}
    </>
  );
}

// ─── Desktop table skeleton + rows ───────────────────────────────────────────

function SkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const seed = [80, 60, 90, 70, 55][i % 5];

        return (
          <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
            {[
              seed * 0.5,
              26,
              seed * 0.9,
              seed,
              seed * 0.4,
              seed * 0.35,
              seed * 0.75,
            ].map((w, j) => (
              <td key={j} className="px-4 py-3">
                <div
                  className="rounded animate-si-pulse"
                  style={{
                    height: 12,
                    width: `${Math.max(20, Math.min(110, w))}px`,
                    background: "var(--muted)",
                  }}
                />
              </td>
            ))}
          </tr>
        );
      })}
    </>
  );
}

function DesktopRows({ subs }: { subs: Substitution[] }) {
  return (
    <>
      {subs.map((sub, i) => (
        <tr
          key={i}
          style={{ borderBottom: "1px solid var(--border)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--muted)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <td className="px-4 py-2.5">
            <span
              className="font-bold text-sm"
              style={{ color: "var(--foreground)" }}
            >
              {sub.class_name}
            </span>
          </td>
          <td className="px-4 py-2.5">
            <PeriodBadge period={sub.period} />
          </td>
          <td
            className="px-4 py-2.5 text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            {sub.absent_teacher || "—"}
          </td>
          <td
            className="px-4 py-2.5 text-sm font-medium"
            style={{
              color: sub.substitution_teacher
                ? "var(--foreground)"
                : "oklch(0.4 0 0)",
            }}
          >
            {sub.substitution_teacher || "—"}
          </td>
          <td className="px-4 py-2.5">
            {sub.subject_abbreviation ? (
              <SubjectChip subject={sub.subject_abbreviation} />
            ) : (
              <span className="text-sm" style={{ color: "oklch(0.4 0 0)" }}>
                —
              </span>
            )}
          </td>
          <td
            className="px-4 py-2.5 text-sm font-mono"
            style={{ color: "var(--muted-foreground)" }}
          >
            {sub.room || "—"}
          </td>
          <td className="px-4 py-2.5">
            {sub.info ? (
              <InfoBadge info={sub.info} />
            ) : (
              <span className="text-sm" style={{ color: "oklch(0.4 0 0)" }}>
                —
              </span>
            )}
          </td>
        </tr>
      ))}
    </>
  );
}

// ─── Responsive table: mobile rows on <sm, full table on ≥sm ─────────────────

export function SubsTable({
  subs,
  loading,
  emptyText,
  compact = false,
}: {
  subs: Substitution[];
  loading?: boolean;
  emptyText: string;
  compact?: boolean;
}) {
  const skeletonCount = compact ? 3 : 5;

  return (
    <>
      {/* ── Mobile: compact rows (hidden on sm+) ── */}
      <div className="sm:hidden">
        {loading ? (
          <MobileSkeletonRows count={skeletonCount} />
        ) : subs.length === 0 ? (
          <EmptyState text={emptyText} />
        ) : (
          subs.map((sub, i) => <MobileRow key={i} sub={sub} />)
        )}
      </div>

      {/* ── Desktop: full table (hidden below sm) ── */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: 580 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {COL_HEADS.map((h) => (
                <th
                  key={h}
                  className={`text-left px-4 ${compact ? "py-2" : "py-2.5"} text-[10px] font-bold uppercase tracking-widest whitespace-nowrap`}
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows count={skeletonCount} />
            ) : subs.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <EmptyState text={emptyText} />
                </td>
              </tr>
            ) : (
              <DesktopRows subs={subs} />
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
