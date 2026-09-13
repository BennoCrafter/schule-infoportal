import { getInfoStyle } from "@/lib/utils";

export function InfoBadge({ info }: { info: string }) {
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

export function PeriodBadge({ period }: { period: string }) {
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

export function SubjectChip({ subject }: { subject: string }) {
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
