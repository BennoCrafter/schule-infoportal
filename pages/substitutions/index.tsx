import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";

import { SchuleInfoportalAPI } from "@/lib/schule-infoportal-api";
import type { LastUpdated, NewsMessage, Substitution } from "@/lib/types";
import {
  addDays,
  classComparator,
  formatDateLong,
  formatDateShort,
  formatDateTime,
  formatWeekLabel,
  getMondayOfWeek,
  getInfoStyle,
  getTodayStr,
  getWeekDays,
  isToday,
} from "@/lib/utils";

const API_URL = "/api/proxy";

type ViewMode = "day" | "week";

// ─── Shared micro-components ──────────────────────────────────────────────────

function InfoBadge({ info }: { info: string }) {
  const s = getInfoStyle(info);
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap"
      style={{
        background: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
      }}
    >
      {info}
    </span>
  );
}

function PeriodBadge({ period }: { period: string }) {
  return (
    <span
      className="inline-flex items-center justify-center min-w-[26px] h-[24px] px-1 rounded-lg text-[11px] font-bold font-mono tabular-nums"
      style={{
        background: "var(--muted)",
        color: "var(--foreground)",
        border: "1px solid var(--border)",
      }}
    >
      {period}
    </span>
  );
}

function SubjectChip({ subject }: { subject: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold"
      style={{
        background: "var(--muted)",
        color: "var(--muted-foreground)",
        border: "1px solid var(--border)",
      }}
    >
      {subject}
    </span>
  );
}

const COL_HEADS = [
  "Klasse",
  "Std.",
  "Fehlender Lehrer",
  "Vertretung",
  "Fach",
  "Raum",
  "Info",
];

// ─── Empty state (shared) ─────────────────────────────────────────────────────

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: "var(--muted)" }}
      >
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: "var(--muted-foreground)" }}
        >
          <path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
        </svg>
      </div>
      <p
        className="text-xs font-medium"
        style={{ color: "var(--muted-foreground)" }}
      >
        {text}
      </p>
    </div>
  );
}

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

function SubsTable({
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

// ─── Week-view day card ───────────────────────────────────────────────────────

function WeekDayCard({
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
        border: `1px solid ${todayDate ? "oklch(0.55 0.22 285 / 0.4)" : "var(--border)"}`,
        boxShadow: todayDate
          ? "0 0 0 1px oklch(0.55 0.22 285 / 0.15), 0 4px 20px oklch(0 0 0 / 0.18)"
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
                background: "oklch(0.55 0.22 285 / 0.15)",
                color: "oklch(0.75 0.18 285)",
                border: "1px solid oklch(0.55 0.22 285 / 0.3)",
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
                    background: "oklch(0.55 0.22 285 / 0.15)",
                    color: "oklch(0.75 0.18 285)",
                    border: "1px solid oklch(0.55 0.22 285 / 0.2)",
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
          subs={subs}
          loading={loading}
          emptyText="Keine Vertretungen"
          compact
        />
      )}
    </div>
  );
}

// ─── Reusable nav/filter primitives ──────────────────────────────────────────

function NavBtn({
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
      onClick={onClick}
      aria-label={label}
      className="p-1.5 rounded-lg transition-all"
      style={{ color: "var(--muted-foreground)" }}
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

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all"
      style={
        active
          ? {
              background:
                "linear-gradient(135deg, oklch(0.55 0.22 285), oklch(0.45 0.25 275))",
              color: "white",
              boxShadow: "0 2px 8px oklch(0.5 0.22 280 / 0.3)",
            }
          : {
              background: "var(--muted)",
              color: "var(--muted-foreground)",
              border: "1px solid var(--border)",
            }
      }
    >
      {children}
    </button>
  );
}

function ViewToggle({
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
            onClick={() => onChange(m)}
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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SubstitutionsPage() {
  const router = useRouter();
  const apiRef = useRef<SchuleInfoportalAPI | null>(null);

  // ── View / filter ──────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [selectedClass, setSelectedClass] = useState("all");

  // ── Day-view state ─────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(getTodayStr);
  const [daySubs, setDaySubs] = useState<Substitution[]>([]);
  const [news, setNews] = useState<NewsMessage[]>([]);
  const [lastUpdated, setLastUpdated] = useState<LastUpdated | null>(null);
  const [dayLoading, setDayLoading] = useState(true);

  // ── Week-view state ────────────────────────────────────────────────────────
  const [weekStart, setWeekStart] = useState(() =>
    getMondayOfWeek(getTodayStr()),
  );
  const [weekSubs, setWeekSubs] = useState<Substitution[]>([]);
  const [weekLoading, setWeekLoading] = useState(false);

  // ── Shared ─────────────────────────────────────────────────────────────────
  const [error, setError] = useState<string | null>(null);

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem("schule_auth");
      if (!raw) {
        router.replace("/");
        return;
      }
      const { username, password } = JSON.parse(raw);
      apiRef.current = new SchuleInfoportalAPI(API_URL, username, password);
    } catch {
      router.replace("/");
    }
  }, []);

  // ── Auth error helper ──────────────────────────────────────────────────────
  const handleError = useCallback((err: unknown) => {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("401") || msg.toLowerCase().includes("unauthorized")) {
      localStorage.removeItem("schule_auth");
      router.replace("/");
    } else {
      setError("Fehler beim Laden der Daten.");
    }
  }, []);

  // ── Day fetch ──────────────────────────────────────────────────────────────
  const fetchDayData = useCallback(async () => {
    if (!apiRef.current) return;
    setDayLoading(true);
    setError(null);
    try {
      const [subs, newsData, updated] = await Promise.all([
        apiRef.current.getSubstitutions({ date: selectedDate }),
        isToday(selectedDate)
          ? apiRef.current.getTodayNews()
          : apiRef.current.getNewsForDate(selectedDate),
        apiRef.current.getLastUpdated(),
      ]);
      // Day view: sort by period first, then class
      setDaySubs(
        [...subs].sort((a, b) => {
          const pp =
            (parseInt(a.period, 10) || 0) - (parseInt(b.period, 10) || 0);
          return pp !== 0 ? pp : classComparator(a.class_name, b.class_name);
        }),
      );
      setNews(newsData);
      setLastUpdated(updated);
    } catch (e) {
      handleError(e);
    } finally {
      setDayLoading(false);
    }
  }, [selectedDate, handleError]);

  // ── Week fetch ─────────────────────────────────────────────────────────────
  const fetchWeekData = useCallback(async () => {
    if (!apiRef.current) return;
    setWeekLoading(true);
    setError(null);
    try {
      const [subs, updated] = await Promise.all([
        apiRef.current.getSubstitutions({
          start_date: weekStart,
          end_date: addDays(weekStart, 4),
        }),
        apiRef.current.getLastUpdated(),
      ]);
      setWeekSubs(subs);
      setLastUpdated(updated);
    } catch (e) {
      handleError(e);
    } finally {
      setWeekLoading(false);
    }
  }, [weekStart, handleError]);

  // Fetch on mount / when params change
  useEffect(() => {
    fetchDayData();
  }, [fetchDayData]);
  useEffect(() => {
    if (viewMode === "week") fetchWeekData();
  }, [viewMode, fetchWeekData]);

  // Reset class filter when navigating dates / weeks / switching views
  useEffect(() => {
    setSelectedClass("all");
  }, [selectedDate, weekStart, viewMode]);

  // Auto-refresh every 5 min
  useEffect(() => {
    const id = setInterval(() => {
      if (viewMode === "day") fetchDayData();
      else fetchWeekData();
    }, 5 * 60_000);
    return () => clearInterval(id);
  }, [viewMode, fetchDayData, fetchWeekData]);

  // ── Derived state ──────────────────────────────────────────────────────────

  // Available classes for the filter — natural-sorted, from the active view's data
  const availableClasses = useMemo(() => {
    const src = viewMode === "day" ? daySubs : weekSubs;
    return Array.from(new Set(src.map((s) => s.class_name))).sort(
      classComparator,
    );
  }, [viewMode, daySubs, weekSubs]);

  // Day view: filter
  const filteredDaySubs = useMemo(
    () =>
      selectedClass === "all"
        ? daySubs
        : daySubs.filter((s) => s.class_name === selectedClass),
    [daySubs, selectedClass],
  );

  // Week view: group by day → sort within each day → filter
  const weekByDay = useMemo(() => {
    const days = getWeekDays(weekStart);
    const map = new Map<string, Substitution[]>(days.map((d) => [d, []]));
    for (const sub of weekSubs) {
      if (map.has(sub.date)) map.get(sub.date)!.push(sub);
    }
    const result = new Map<string, Substitution[]>();
    for (const [day, subs] of map) {
      const filtered =
        selectedClass === "all"
          ? subs
          : subs.filter((s) => s.class_name === selectedClass);
      // Week view: sort by CLASS first (natural), then period within each class
      result.set(
        day,
        [...filtered].sort((a, b) => {
          const cc = classComparator(a.class_name, b.class_name);
          return cc !== 0
            ? cc
            : (parseInt(a.period, 10) || 0) - (parseInt(b.period, 10) || 0);
        }),
      );
    }
    return { days, map: result };
  }, [weekSubs, weekStart, selectedClass]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const logout = () => {
    try {
      localStorage.removeItem("schule_auth");
    } catch {}
    router.replace("/");
  };
  const loading = viewMode === "day" ? dayLoading : weekLoading;
  const handleRefresh = () =>
    viewMode === "day" ? fetchDayData() : fetchWeekData();

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* ─── Navbar ─────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-20"
        style={{
          background: "oklch(from var(--background) l c h / 0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.22 285), oklch(0.45 0.25 275))",
                boxShadow: "0 2px 8px oklch(0.5 0.22 280 / 0.3)",
              }}
            >
              <svg
                width={14}
                height={14}
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
              </svg>
            </div>
            <span
              className="font-semibold text-sm hidden sm:block"
              style={{ color: "var(--foreground)" }}
            >
              Vertretungsplan
            </span>
          </div>

          {lastUpdated?.has_date && lastUpdated.last_update && (
            <div
              className="hidden md:flex items-center gap-1.5 text-xs select-none"
              style={{ color: "var(--muted-foreground)" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-si-pulse"
                style={{ background: "rgb(34,197,94)" }}
              />
              Aktualisiert {formatDateTime(lastUpdated.last_update)} Uhr
            </div>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={handleRefresh}
              disabled={loading}
              title="Aktualisieren"
              className="p-2 rounded-lg transition-all disabled:opacity-30"
              style={{ color: "var(--muted-foreground)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--muted)";
                e.currentTarget.style.color = "var(--foreground)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--muted-foreground)";
              }}
            >
              <svg
                width={15}
                height={15}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={
                  loading ? { animation: "spin 1.2s linear infinite" } : {}
                }
              >
                <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                color: "var(--muted-foreground)",
                border: "1px solid var(--border)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--foreground)";
                e.currentTarget.style.borderColor = "var(--ring)";
                e.currentTarget.style.background = "var(--muted)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--muted-foreground)";
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <svg
                width={13}
                height={13}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
              <span className="hidden sm:inline">Abmelden</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Content ──────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col gap-4">
        {/* ── Controls row ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date / week navigation */}
          <div className="flex items-center gap-0.5 shrink-0">
            <NavBtn
              onClick={() =>
                viewMode === "day"
                  ? setSelectedDate((d) => addDays(d, -1))
                  : setWeekStart((w) => addDays(w, -7))
              }
              label="Zurück"
            >
              <svg
                width={14}
                height={14}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </NavBtn>

            <div className="flex items-center gap-2 px-1.5">
              <span
                className="text-sm font-semibold whitespace-nowrap"
                style={{ color: "var(--foreground)" }}
              >
                {viewMode === "day"
                  ? formatDateShort(selectedDate)
                  : formatWeekLabel(weekStart)}
              </span>
              {viewMode === "day" && isToday(selectedDate) && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide"
                  style={{
                    background: "oklch(0.55 0.22 285 / 0.15)",
                    color: "oklch(0.75 0.18 285)",
                    border: "1px solid oklch(0.55 0.22 285 / 0.25)",
                  }}
                >
                  Heute
                </span>
              )}
            </div>

            <NavBtn
              onClick={() =>
                viewMode === "day"
                  ? setSelectedDate((d) => addDays(d, 1))
                  : setWeekStart((w) => addDays(w, 7))
              }
              label="Vor"
            >
              <svg
                width={14}
                height={14}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </NavBtn>

            {/* "Heute" jump button — only show when not on today */}
            {((viewMode === "day" && !isToday(selectedDate)) ||
              (viewMode === "week" &&
                weekStart !== getMondayOfWeek(getTodayStr()))) && (
              <button
                onClick={() => {
                  const today = getTodayStr();
                  if (viewMode === "day") setSelectedDate(today);
                  else setWeekStart(getMondayOfWeek(today));
                }}
                className="ml-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all"
                style={{
                  background: "var(--muted)",
                  color: "var(--muted-foreground)",
                  border: "1px solid var(--border)",
                }}
              >
                Heute
              </button>
            )}
          </div>

          {/* Class filter — only if classes are known */}
          {availableClasses.length > 0 && (
            <>
              <div
                className="w-px h-4 hidden sm:block shrink-0"
                style={{ background: "var(--border)" }}
              />
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-0.5 min-w-0">
                <FilterPill
                  active={selectedClass === "all"}
                  onClick={() => setSelectedClass("all")}
                >
                  Alle
                </FilterPill>
                {availableClasses.map((cls) => (
                  <FilterPill
                    key={cls}
                    active={selectedClass === cls}
                    onClick={() => setSelectedClass(cls)}
                  >
                    {cls}
                  </FilterPill>
                ))}
              </div>
            </>
          )}

          {/* View toggle — pushed to the end */}
          <div className="ml-auto shrink-0">
            <ViewToggle mode={viewMode} onChange={setViewMode} />
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm animate-si-fade-in"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "rgb(252,165,165)",
            }}
          >
            <svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <span className="flex-1">{error}</span>
            <button
              onClick={handleRefresh}
              className="text-xs font-semibold underline underline-offset-2 shrink-0"
            >
              Erneut versuchen
            </button>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────────────── */}
        {viewMode === "day" ? (
          /* ── Day view ─────────────────────────────────────────────────── */
          <>
            <section
              className="rounded-2xl overflow-hidden animate-si-slide-up"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                boxShadow: "0 4px 24px oklch(0 0 0 / 0.2)",
              }}
            >
              {/* Card header */}
              <div
                className="px-5 py-4 flex items-center justify-between gap-4"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <svg
                      width={15}
                      height={15}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        color: "var(--muted-foreground)",
                        flexShrink: 0,
                      }}
                    >
                      <path d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                    <h2
                      className="text-sm font-semibold"
                      style={{ color: "var(--foreground)" }}
                    >
                      Vertretungen
                    </h2>
                  </div>
                  <p
                    className="text-xs mt-0.5 truncate"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {formatDateLong(selectedDate)}
                  </p>
                </div>
                {!dayLoading && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className="inline-flex items-center justify-center min-w-[26px] h-5 px-2 rounded-full text-[11px] font-bold"
                      style={
                        filteredDaySubs.length === 0
                          ? {
                              background: "var(--muted)",
                              color: "var(--muted-foreground)",
                            }
                          : {
                              background: "oklch(0.55 0.22 285 / 0.15)",
                              color: "oklch(0.75 0.18 285)",
                            }
                      }
                    >
                      {filteredDaySubs.length}
                    </span>
                    {filteredDaySubs.length !== daySubs.length && (
                      <span
                        className="text-[11px]"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        von {daySubs.length}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <SubsTable
                subs={filteredDaySubs}
                loading={dayLoading}
                emptyText="Für diesen Tag sind keine Einträge vorhanden."
              />
            </section>

            {/* News */}
            {(dayLoading || news.length > 0) && (
              <section
                className="rounded-2xl overflow-hidden animate-si-slide-up"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 4px 24px oklch(0 0 0 / 0.2)",
                  animationDelay: "0.05s",
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
                  {!dayLoading && (
                    <span
                      className="ml-auto text-[11px]"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {news.length}{" "}
                      {news.length === 1 ? "Meldung" : "Meldungen"}
                    </span>
                  )}
                </div>
                <div>
                  {dayLoading
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
                              i < news.length - 1
                                ? "1px solid var(--border)"
                                : "none",
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
            )}
          </>
        ) : (
          /* ── Week view ────────────────────────────────────────────────── */
          <div className="flex flex-col gap-3">
            {weekByDay.days.map((day) => (
              <WeekDayCard
                key={day}
                date={day}
                subs={weekByDay.map.get(day) ?? []}
                loading={weekLoading}
              />
            ))}
          </div>
        )}

        <p
          className="text-center text-[11px] py-4"
          style={{ color: "oklch(0.35 0 0)" }}
        >
          Schule Infoportal · Vertretungsplan
        </p>
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
