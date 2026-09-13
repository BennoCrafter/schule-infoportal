"use client";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hexToRgb = (hex: string): [number, number, number] => {
  const bigint = parseInt(hex.slice(1), 16);

  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};

// ─── Date helpers ────────────────────────────────────────────────────────────

const DAYS_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const DAYS_LONG = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
];
const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mär",
  "Apr",
  "Mai",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Okt",
  "Nov",
  "Dez",
];
const MONTHS_LONG = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

function parseDateStr(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);

  return new Date(y, m - 1, d);
}

function serializeDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

export function getTodayStr(): string {
  return serializeDate(new Date());
}

export function addDays(dateStr: string, n: number): string {
  const d = parseDateStr(dateStr);

  d.setDate(d.getDate() + n);

  return serializeDate(d);
}

export function isToday(dateStr: string): boolean {
  return dateStr === getTodayStr();
}

export function formatDateShort(dateStr: string): string {
  const d = parseDateStr(dateStr);

  return `${DAYS_SHORT[d.getDay()]}, ${d.getDate()}. ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateLong(dateStr: string): string {
  const d = parseDateStr(dateStr);

  return `${DAYS_LONG[d.getDay()]}, ${d.getDate()}. ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateTime(isoStr: string | null): string {
  if (!isoStr) return "—";
  try {
    return new Date(isoStr).toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

// ─── Class sorting ──────────────────────────────────────────────────────────────
// Handles: "5a", "5b", "10c", "EF", "Q1", "Q2" etc.

function parseGrade(cls: string): [number, string] {
  const m = cls.match(/^(\d+)([a-zA-Z]*)$/);
  if (m) return [parseInt(m[1], 10), m[2].toLowerCase()];
  const lower = cls.toLowerCase();
  if (lower === "ef") return [190, ""];
  const qm = lower.match(/^q(\d+)$/);
  if (qm) return [200 + parseInt(qm[1], 10), ""];
  return [999, lower];
}

export function classComparator(a: string, b: string): number {
  const [an, as_] = parseGrade(a);
  const [bn, bs] = parseGrade(b);
  if (an !== bn) return an - bn;
  return as_.localeCompare(bs);
}

// ─── Week helpers ─────────────────────────────────────────────────────────────

export function getMondayOfWeek(dateStr: string): string {
  const d = parseDateStr(dateStr);
  const dow = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  if (dow === 6) {
    // Saturday
    d.setDate(d.getDate() + 2);
  } else if (dow === 0) {
    // Sunday
    d.setDate(d.getDate() + 1);
  } else {
    // Monday to Friday: monday in same week
    d.setDate(d.getDate() - (dow - 1));
  }

  return serializeDate(d);
}

export function getWeekDays(mondayStr: string): string[] {
  return Array.from({ length: 5 }, (_, i) => addDays(mondayStr, i));
}

export function getISOWeek(dateStr: string): number {
  const d = parseDateStr(dateStr);
  const utc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = utc.getUTCDay() || 7;

  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));

  return Math.ceil(
    ((utc.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  );
}

export function formatWeekLabel(mondayStr: string): string {
  const friday = parseDateStr(addDays(mondayStr, 4));
  const monday = parseDateStr(mondayStr);

  const kw = getISOWeek(mondayStr);

  if (monday.getMonth() === friday.getMonth()) {
    return `KW\u00a0${kw}\u2002\u00b7\u2002${monday.getDate()}.\u2013${friday.getDate()}. ${MONTHS_SHORT[monday.getMonth()]} ${monday.getFullYear()}`;
  }

  return `KW\u00a0${kw}\u2002\u00b7\u2002${monday.getDate()}. ${MONTHS_SHORT[monday.getMonth()]}\u2013${friday.getDate()}. ${MONTHS_SHORT[friday.getMonth()]} ${friday.getFullYear()}`;
}

// ─── Info badge styling ───────────────────────────────────────────────────────

export interface InfoStyle {
  bg: string;
  text: string;
  border: string;
}

export function getInfoStyle(info: string): InfoStyle {
  const l = info.toLowerCase();
  if (l.includes("entfällt") || l.includes("entfallt") || l.includes("frei"))
    return {
      bg: "rgba(239,68,68,0.1)",
      text: "rgb(252,165,165)",
      border: "rgba(239,68,68,0.25)",
    };
  if (l.includes("raumänderung") || l.includes("raumaenderung"))
    return {
      bg: "rgba(245,158,11,0.1)",
      text: "rgb(252,211,77)",
      border: "rgba(245,158,11,0.25)",
    };
  if (l.includes("selbst") || l.includes("eigenver"))
    return {
      bg: "rgba(34,197,94,0.1)",
      text: "rgb(134,239,172)",
      border: "rgba(34,197,94,0.25)",
    };
  if (l.includes("klausur") || l.includes("prüfung") || l.includes("test"))
    return {
      bg: "rgba(139,92,246,0.1)",
      text: "rgb(196,181,253)",
      border: "rgba(139,92,246,0.25)",
    };
  if (l.includes("vertretung"))
    return {
      bg: "rgba(59,130,246,0.1)",
      text: "rgb(147,197,253)",
      border: "rgba(59,130,246,0.25)",
    };
  return {
    bg: "rgba(113,113,122,0.15)",
    text: "rgb(161,161,170)",
    border: "rgba(113,113,122,0.3)",
  };
}
