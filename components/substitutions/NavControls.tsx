import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, List } from "lucide-react";

import { type ViewMode } from "./theme";

import { classGrade, cn } from "@/lib/utils";

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
      className="inline-flex items-center justify-center size-9 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Chip({
  active,
  open = false,
  grade,
  onClick,
  children,
}: {
  active: boolean;
  open?: boolean;
  grade?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-pressed={active}
      data-grade={grade}
      className={cn(
        "shrink-0 h-8 min-w-10 px-3 rounded-md border text-sm font-medium transition-colors",
        active
          ? "bg-brand text-brand-fg border-transparent"
          : open
            ? "border-foreground/40 text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted",
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// Two-step picker: grades first, then that grade's classes. A grade with a
// single class selects it directly.
export function ClassPicker({
  classes,
  selected,
  onSelect,
}: {
  classes: string[];
  selected: string;
  onSelect: (cls: string) => void;
}) {
  const groups = useMemo(() => {
    const map = new Map<string, string[]>();

    for (const cls of classes) {
      const g = classGrade(cls);

      map.set(g, [...(map.get(g) ?? []), cls]);
    }

    return map;
  }, [classes]);
  const selectedGrade = selected === "all" ? null : classGrade(selected);
  const [openGrade, setOpenGrade] = useState<string | null>(null);
  const shownGrade = openGrade ?? selectedGrade;
  const letters = shownGrade ? groups.get(shownGrade) : undefined;

  // Line the class row up under its grade chip, clamped so it stays on screen
  const gradeRowRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const align = useCallback(() => {
    const row = gradeRowRef.current;
    const chip = row?.querySelector<HTMLElement>(
      `[data-grade="${shownGrade}"]`,
    );

    if (!row || !chip || !lettersRef.current) return;
    const max = row.clientWidth - lettersRef.current.scrollWidth;

    setOffset(Math.max(0, Math.min(chip.offsetLeft - row.scrollLeft, max)));
  }, [shownGrade]);

  useEffect(() => {
    align();
    window.addEventListener("resize", align);

    return () => window.removeEventListener("resize", align);
  }, [align, letters]);

  const pick = (cls: string) => {
    onSelect(cls);
    setOpenGrade(null);
  };

  return (
    <div className="flex flex-col gap-2 min-w-0">
      <div
        ref={gradeRowRef}
        aria-label="Klasse wählen"
        className="relative flex gap-1.5 overflow-x-auto scrollbar-hide"
        role="group"
        onScroll={align}
      >
        <Chip active={selected === "all"} onClick={() => pick("all")}>
          Alle
        </Chip>
        {[...groups].map(([grade, list]) => (
          <Chip
            key={grade}
            active={selectedGrade === grade}
            grade={grade}
            open={shownGrade === grade}
            onClick={() =>
              list.length === 1
                ? pick(list[0])
                : setOpenGrade(openGrade === grade ? null : grade)
            }
          >
            {list.length === 1 ? list[0] : grade}
          </Chip>
        ))}
      </div>
      {letters && letters.length > 1 && (
        <div
          ref={lettersRef}
          aria-label={`Klassen im Jahrgang ${shownGrade}`}
          className="flex w-max max-w-full gap-1.5 overflow-x-auto scrollbar-hide"
          role="group"
          style={{ marginLeft: offset }}
        >
          {letters.map((cls) => (
            <Chip key={cls} active={selected === cls} onClick={() => pick(cls)}>
              {cls}
            </Chip>
          ))}
        </div>
      )}
    </div>
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
      aria-label="Ansicht"
      className="flex items-center rounded-md border p-0.5 shrink-0"
      role="group"
    >
      {(["list", "week"] as ViewMode[]).map((m) => (
        <button
          key={m}
          aria-pressed={mode === m}
          className={cn(
            "flex items-center gap-1.5 h-8 px-3 rounded text-sm font-medium transition-colors",
            mode === m
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => onChange(m)}
        >
          {m === "list" ? <List size={15} /> : <CalendarDays size={15} />}
          {m === "list" ? "Liste" : "Woche"}
        </button>
      ))}
    </div>
  );
}
