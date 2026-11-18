import { ChevronLeft, ChevronRight, TriangleAlert } from "lucide-react";

import { useSubstitutionsPage } from "@/hooks/useSubstitutionsPage";
import {
  ClassPicker,
  NavBtn,
  ViewToggle,
} from "@/components/substitutions/NavControls";
import { DayList } from "@/components/substitutions/DayList";
import { NewsSection } from "@/components/substitutions/NewsSection";
import { PageHeader } from "@/components/substitutions/PageHeader";
import { PromoBanner } from "@/components/substitutions/PromoBanner";
import { WeekSwiper } from "@/components/substitutions/WeekSwiper";
import { WeekTimetable } from "@/components/substitutions/WeekTimetable";
import {
  addDays,
  cn,
  formatWeekLabel,
  getMondayOfWeek,
  getTodayStr,
} from "@/lib/utils";

export default function SubstitutionsPage() {
  const {
    viewMode,
    setViewMode,
    selectedClass,
    setSelectedClass,
    weekStart,
    setWeekStart,
    weekNews,
    lastUpdated,
    loading,
    error,
    availableClasses,
    weekByDay,
    weekPeriods,
    handleRefresh,
    logout,
    username,
  } = useSubstitutionsPage();

  const atToday = weekStart === getMondayOfWeek(getTodayStr());
  const step = (dir: 1 | -1) => setWeekStart((w) => addDays(w, 7 * dir));
  const hasNews = loading || weekNews.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        lastUpdated={lastUpdated}
        loading={loading}
        onRefresh={handleRefresh}
        onLogout={logout}
      />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-4">
        <PromoBanner username={username} />

        {/* ── Controls ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center min-w-0">
              <NavBtn label="Vorherige Woche" onClick={() => step(-1)}>
                <ChevronLeft size={18} />
              </NavBtn>
              <h2
                aria-live="polite"
                className="px-1 text-sm sm:text-base font-semibold whitespace-nowrap truncate"
              >
                {formatWeekLabel(weekStart)}
              </h2>
              <NavBtn label="Nächste Woche" onClick={() => step(1)}>
                <ChevronRight size={18} />
              </NavBtn>
              {atToday ? (
                <span className="ml-1 hidden sm:inline text-xs font-medium text-brand-text">
                  Diese Woche
                </span>
              ) : (
                <button
                  className="ml-1 h-8 px-2.5 rounded-md border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  onClick={() => setWeekStart(getMondayOfWeek(getTodayStr()))}
                >
                  Heute
                </button>
              )}
            </div>
            <div className="ml-auto">
              <ViewToggle mode={viewMode} onChange={setViewMode} />
            </div>
          </div>

          <ClassPicker
            classes={availableClasses}
            selected={selectedClass}
            onSelect={setSelectedClass}
          />
        </div>

        {/* ── Error ────────────────────────────────────────────────────────── */}
        {error && (
          <div
            className="flex items-center gap-3 rounded-lg border px-4 py-3 text-sm"
            role="alert"
            style={{
              color: "var(--tone-red)",
              borderColor:
                "color-mix(in oklch, var(--tone-red) 35%, transparent)",
            }}
          >
            <TriangleAlert className="shrink-0" size={16} />
            <span className="flex-1">{error}</span>
            <button
              className="font-medium underline underline-offset-2 shrink-0"
              onClick={handleRefresh}
            >
              Erneut versuchen
            </button>
          </div>
        )}

        {/* News: above the plan on small screens, beside it on wide ones */}
        <div
          className={cn(
            "flex flex-col gap-4",
            hasNews &&
              "xl:grid xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start",
          )}
        >
          {hasNews && (
            <aside className="xl:col-start-2 xl:row-start-1 xl:sticky xl:top-18">
              <NewsSection loading={loading} showDates news={weekNews} />
            </aside>
          )}
          <div className="min-w-0 xl:col-start-1 xl:row-start-1 flex flex-col gap-4">
            {viewMode === "list" ? (
              <DayList
                days={weekByDay.days}
                loading={loading}
                map={weekByDay.map}
              />
            ) : (
              /* ── Week view ──────────────────────────────────────────────────── */
              <>
                <div className="sm:hidden">
                  <WeekSwiper
                    days={weekByDay.days}
                    loading={loading}
                    map={weekByDay.map}
                  />
                </div>

                <div className="hidden sm:block">
                  <WeekTimetable
                    days={weekByDay.days}
                    loading={loading}
                    map={weekByDay.map}
                    periods={weekPeriods}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
