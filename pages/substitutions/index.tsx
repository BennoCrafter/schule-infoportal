import { useSubstitutionsPage } from "@/hooks/useSubstitutionsPage";
import {
  Divider,
  FilterPill,
  NavBtn,
  ViewToggle,
} from "@/components/substitutions/NavControls";
import { NewsSection } from "@/components/substitutions/NewsSection";
import { PageHeader } from "@/components/substitutions/PageHeader";
import { SubsTable } from "@/components/substitutions/SubsTable";
import { ACCENT } from "@/components/substitutions/theme";
import { WeekDayCard } from "@/components/substitutions/WeekDayCard";
import { WeekTimetable } from "@/components/substitutions/WeekTimetable";
import {
  addDays,
  formatDateLong,
  formatDateShort,
  formatWeekLabel,
  isToday,
} from "@/lib/utils";

export default function SubstitutionsPage() {
  const {
    viewMode,
    setViewMode,
    selectedClass,
    setSelectedClass,
    selectedDate,
    setSelectedDate,
    daySubs,
    filteredDaySubs,
    news,
    weekStart,
    setWeekStart,
    weekNews,
    lastUpdated,
    dayLoading,
    weekLoading,
    loading,
    error,
    availableClasses,
    weekByDay,
    weekPeriods,
    handleRefresh,
    logout,
  } = useSubstitutionsPage();

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <PageHeader
        lastUpdated={lastUpdated}
        loading={loading}
        onRefresh={handleRefresh}
        onLogout={logout}
      />

      {/* ─── Content ──────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col gap-4">
        {/* ── Controls row ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date / week navigation */}
          <div className="flex items-center gap-0.5 shrink-0">
            <NavBtn
              label="Zurück"
              onClick={() =>
                viewMode === "day"
                  ? setSelectedDate((d) => addDays(d, -1))
                  : setWeekStart((w) => addDays(w, -7))
              }
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
                    background: ACCENT.soft(0.15),
                    color: ACCENT.mid,
                    border: `1px solid ${ACCENT.soft(0.25)}`,
                  }}
                >
                  Heute
                </span>
              )}
            </div>

            <NavBtn
              label="Vor"
              onClick={() =>
                viewMode === "day"
                  ? setSelectedDate((d) => addDays(d, 1))
                  : setWeekStart((w) => addDays(w, 7))
              }
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
          </div>

          <Divider hideOnMobile />
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

            {!availableClasses.includes(selectedClass) &&
              selectedClass !== "all" && (
                <>
                  <Divider />
                  <FilterPill
                    key={selectedClass}
                    active={true}
                    grayedOut={true}
                    onClick={() => {}}
                  >
                    {selectedClass}
                  </FilterPill>
                </>
              )}
          </div>

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
              className="text-xs font-semibold underline underline-offset-2 shrink-0"
              onClick={handleRefresh}
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
                              background: ACCENT.soft(0.15),
                              color: ACCENT.mid,
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

            {(dayLoading || news.length > 0) && (
              <NewsSection news={news} loading={dayLoading} />
            )}
          </>
        ) : (
          /* ── Week view ────────────────────────────────────────────────── */
          <>
            {/* Mobile: stacked day cards */}
            <div className="flex flex-col gap-3 sm:hidden">
              {weekByDay.days.map((day) => (
                <WeekDayCard
                  key={day}
                  date={day}
                  subs={weekByDay.map.get(day) ?? []}
                  loading={weekLoading}
                />
              ))}
            </div>

            {/* Desktop: real weekday × period timetable */}
            <div className="hidden sm:block">
              <WeekTimetable
                days={weekByDay.days}
                periods={weekPeriods}
                map={weekByDay.map}
                loading={weekLoading}
              />
            </div>

            {(weekLoading || weekNews.length > 0) && (
              <NewsSection
                news={weekNews}
                loading={weekLoading}
                animationDelay="0.05s"
              />
            )}
          </>
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
