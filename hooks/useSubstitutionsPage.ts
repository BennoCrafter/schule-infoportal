import type { LastUpdated, NewsMessage, Substitution } from "@/lib/types";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";

import { SchuleInfoportalAPI } from "@/lib/schule-infoportal-api";
import {
  addDays,
  classComparator,
  getMondayOfWeek,
  getTodayStr,
  getWeekDays,
  isToday,
} from "@/lib/utils";
import {
  API_URL,
  CLASS_STORAGE_KEY,
  VIEW_STORAGE_KEY,
  type ViewMode,
} from "@/components/substitutions/theme";

export function useSubstitutionsPage() {
  const router = useRouter();
  const apiRef = useRef<SchuleInfoportalAPI | null>(null);

  // ── View / filter ──────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>("week");
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
  const [weekNews, setWeekNews] = useState<NewsMessage[]>([]);
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

  // ── Restore persisted class filter / view mode ──────────────────────────────
  // The write-effects below must not fire on the very first render — at that
  // point state still holds its default ("all" / "week"), not yet the value the
  // restore-effect is about to set, so an unguarded write would immediately
  // clobber whatever was persisted from a previous visit.
  const skipClassWrite = useRef(true);
  const skipViewWrite = useRef(true);

  useEffect(() => {
    try {
      const storedClass = localStorage.getItem(CLASS_STORAGE_KEY);

      if (storedClass) setSelectedClass(storedClass);
      const storedView = localStorage.getItem(VIEW_STORAGE_KEY);

      if (storedView === "day" || storedView === "week")
        setViewMode(storedView);
    } catch {}
  }, []);

  useEffect(() => {
    if (skipClassWrite.current) {
      skipClassWrite.current = false;

      return;
    }
    try {
      localStorage.setItem(CLASS_STORAGE_KEY, selectedClass);
    } catch {}
  }, [selectedClass]);

  useEffect(() => {
    if (skipViewWrite.current) {
      skipViewWrite.current = false;

      return;
    }
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, viewMode);
    } catch {}
  }, [viewMode]);

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

  const dayFetchId = useRef(0);
  const weekFetchId = useRef(0);

  // ── Day fetch ──────────────────────────────────────────────────────────────
  const fetchDayData = useCallback(async () => {
    if (!apiRef.current) return;
    const requestId = ++dayFetchId.current;

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

      if (requestId !== dayFetchId.current) return;
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
      if (requestId !== dayFetchId.current) return;
      handleError(e);
    } finally {
      if (requestId === dayFetchId.current) setDayLoading(false);
    }
  }, [selectedDate, handleError]);

  // ── Week fetch ─────────────────────────────────────────────────────────────
  const fetchWeekData = useCallback(async () => {
    if (!apiRef.current) return;
    const requestId = ++weekFetchId.current;

    setWeekLoading(true);
    setError(null);
    try {
      const weekEnd = addDays(weekStart, 4);
      const [subs, allNews, updated] = await Promise.all([
        apiRef.current.getSubstitutions({
          start_date: weekStart,
          end_date: weekEnd,
        }),
        apiRef.current.getAllNews(),
        apiRef.current.getLastUpdated(),
      ]);

      if (requestId !== weekFetchId.current) return;
      setWeekSubs(subs);
      setWeekNews(
        allNews
          .filter((n) => n.date >= weekStart && n.date <= weekEnd)
          .sort((a, b) => a.date.localeCompare(b.date)),
      );
      setLastUpdated(updated);
    } catch (e) {
      if (requestId !== weekFetchId.current) return;
      handleError(e);
    } finally {
      if (requestId === weekFetchId.current) setWeekLoading(false);
    }
  }, [weekStart, handleError]);

  // Fetch on mount / when params change
  useEffect(() => {
    fetchDayData();
  }, [fetchDayData]);
  useEffect(() => {
    if (viewMode === "week") fetchWeekData();
  }, [viewMode, fetchWeekData]);

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

  // Week timetable rows: union of periods across the (unfiltered) week, so the
  // grid shape stays stable while the class filter changes
  const weekPeriods = useMemo(() => {
    const nums = weekSubs
      .map((s) => parseInt(s.period, 10))
      .filter((n) => Number.isFinite(n) && n > 0);
    const max = nums.length > 0 ? Math.max(6, ...nums) : 6;

    return Array.from({ length: max }, (_, i) => i + 1);
  }, [weekSubs]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    try {
      localStorage.removeItem("schule_auth");
    } catch {}
    router.replace("/");
  }, [router]);

  const loading = viewMode === "day" ? dayLoading : weekLoading;
  const handleRefresh = useCallback(
    () => (viewMode === "day" ? fetchDayData() : fetchWeekData()),
    [viewMode, fetchDayData, fetchWeekData],
  );

  return {
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
  };
}
