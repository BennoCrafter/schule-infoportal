import { getInfoTone, translateInfo } from "@/lib/utils";

export function InfoBadge({ info }: { info: string }) {
  const label = translateInfo(info);
  const tone = `var(--tone-${getInfoTone(label)})`;

  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap"
      style={{
        color: tone,
        background: `color-mix(in oklch, ${tone} 12%, transparent)`,
      }}
    >
      {label}
    </span>
  );
}

export function PeriodBadge({ period }: { period: string }) {
  return (
    <span className="inline-flex items-center justify-center min-w-6 h-6 px-1 rounded bg-muted text-xs font-semibold tabular-nums text-foreground">
      {period}
    </span>
  );
}

export function SubjectChip({ subject }: { subject: string }) {
  return (
    <span className="text-xs font-mono font-medium text-muted-foreground">
      {subject}
    </span>
  );
}
