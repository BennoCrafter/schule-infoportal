import type { LastUpdated, RawNewsMessage, Substitution } from "@/lib/types";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";

import { siteConfig } from "@/config/site";
import { SchuleInfoportalAPI } from "@/lib/schule-infoportal-api";
import {
  logout as endSession,
  getSessionUser,
  migrateLegacyAuth,
} from "@/lib/auth";
import {
  addDays,
  classComparator,
  getMondayOfWeek,
  getTodayStr,
  getWeekDays,
} from "@/lib/utils";
import {
  API_URL,
  CLASS_STORAGE_KEY,
  VIEW_STORAGE_KEY,
  type ViewMode,
} from "@/components/substitutions/theme";

export function useSubstitutionsPage() {
  const router = useRouter();
  const apiRef = useRef(new SchuleInfoportalAPI(API_URL));
  // Data fetches wait until legacy credentials (if any) became a session cookie
  const [ready, setReady] = useState(false);

  // ── View / filter ──────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedClass, setSelectedClass] = useState("all");

  // ── Week data (both views show one week) ────────────────────────────────────
  const [lastUpdated, setLastUpdated] = useState<LastUpdated | null>(null);
  const [weekStart, setWeekStart] = useState(() =>
    getMondayOfWeek(getTodayStr()),
  );
  const [weekSubs, setWeekSubs] = useState<Substitution[]>([]);
  const [weekNews, setWeekNews] = useState<RawNewsMessage[]>([]);
  const [weekLoading, setWeekLoading] = useState(true);

  // ── Shared ─────────────────────────────────────────────────────────────────
  const [error, setError] = useState<string | null>(null);
  // Every class seen in the full substitution history (the API has no class list)
  const [allClasses, setAllClasses] = useState<string[]>([]);

  // ── Session bootstrap ──────────────────────────────────────────────────────
  // No explicit guard: the proxy answers 401 without a session, and
  // handleError sends the user to the login page.
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    migrateLegacyAuth()
      .then(getSessionUser)
      .then((user) => {
        setUsername(user);
        setReady(true);
      });
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

      if (storedView === "list" || storedView === "week")
        setViewMode(storedView);
      else if (storedView === "day") setViewMode("list"); // pre-"Liste" value
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
      endSession().then(() => router.replace("/"));
    } else {
      setError("Fehler beim Laden der Daten.");
    }
  }, []);

  const weekFetchId = useRef(0);

  // ── Week fetch ─────────────────────────────────────────────────────────────
  const fetchWeekData = useCallback(async () => {
    if (!ready) return;
    const requestId = ++weekFetchId.current;

    setWeekLoading(true);
    setError(null);
    try {
      const weekEnd = addDays(weekStart, 4);
      const [subs, newsData, updated] = await Promise.all([
        apiRef.current.getSubstitutions({
          start_date: weekStart,
          end_date: weekEnd,
        }),
        apiRef.current.getRawNews({ start_date: weekStart, end_date: weekEnd }),
        apiRef.current.getLastUpdated(),
      ]);

      if (requestId !== weekFetchId.current) return;
      setWeekSubs(subs);
      setWeekNews(
        newsData
          .filter((n) => n.raw_text.trim())
          .sort((a, b) => a.date.localeCompare(b.date)),
      );
      setLastUpdated(updated);
    } catch (e) {
      if (requestId !== weekFetchId.current) return;
      handleError(e);
    } finally {
      if (requestId === weekFetchId.current) setWeekLoading(false);
    }
  }, [ready, weekStart, handleError]);

  useEffect(() => {
    if (!ready) return;
    apiRef.current
      .getSubstitutions()
      .then((subs) => setAllClasses(subs.map((s) => s.class_name)))
      .catch(() => {}); // picker falls back to the classes currently loaded
  }, [ready]);

  // Fetch on mount / when the week changes, and auto-refresh every 5 min
  useEffect(() => {
    fetchWeekData();
    const id = setInterval(fetchWeekData, 5 * 60_000);

    return () => clearInterval(id);
  }, [fetchWeekData]);

  // ── Derived state ──────────────────────────────────────────────────────────

  // Classes for the filter — natural-sorted, from all known data, so every
  // class stays pickable even on days it has no entries.
  const availableClasses = useMemo(() => {
    const names = new Set([
      ...siteConfig.schoolClasses,
      ...allClasses,
      ...weekSubs.map((s) => s.class_name),
    ]);

    if (selectedClass !== "all") names.add(selectedClass);

    return Array.from(names).filter(Boolean).sort(classComparator);
  }, [allClasses, weekSubs, selectedClass]);

  // Group by day → filter → sort by period, then class
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

      result.set(
        day,
        [...filtered].sort((a, b) => {
          const pp =
            (parseInt(a.period, 10) || 0) - (parseInt(b.period, 10) || 0);

          return pp !== 0 ? pp : classComparator(a.class_name, b.class_name);
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
    endSession().then(() => router.replace("/"));
  }, [router]);

  return {
    viewMode,
    setViewMode,
    selectedClass,
    setSelectedClass,
    weekStart,
    setWeekStart,
    weekNews,
    lastUpdated,
    loading: weekLoading,
    error,
    availableClasses,
    weekByDay,
    weekPeriods,
    handleRefresh: fetchWeekData,
    username,
    logout,
  };
}
