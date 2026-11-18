import type { Substitution } from "@/lib/types";

import { EmptyState } from "./EmptyState";
import { InfoBadge, PeriodBadge, SubjectChip } from "./badges";
import { COL_HEADS } from "./theme";

const Dash = () => <span className="text-faint">—</span>;

function Teachers({ sub }: { sub: Substitution }) {
  return (
    <>
      <span className="text-muted-foreground">{sub.absent_teacher || "—"}</span>
      <span aria-label="vertreten durch" className="mx-1 text-faint">
        →
      </span>
      {sub.substitution_teacher ? (
        <span className="font-medium">{sub.substitution_teacher}</span>
      ) : (
        <Dash />
      )}
    </>
  );
}

// ─── Mobile row ───────────────────────────────────────────────────────────────
// [Class] [Period] Teacher → Sub
//                  Subject · Room
//                  [Info]

function MobileRow({ sub }: { sub: Substitution }) {
  return (
    <li className="px-4 py-3 border-b last:border-b-0 flex gap-3">
      <div className="flex items-center gap-2 shrink-0 self-start">
        <span className="font-semibold text-sm w-9">{sub.class_name}</span>
        <PeriodBadge period={sub.period} />
      </div>
      <div className="min-w-0 flex-1 text-sm">
        <p className="break-words">
          <Teachers sub={sub} />
        </p>
        {(sub.subject_abbreviation || sub.room) && (
          <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            {sub.subject_abbreviation && (
              <SubjectChip subject={sub.subject_abbreviation} />
            )}
            {sub.room && <span>Raum {sub.room}</span>}
          </p>
        )}
        {sub.info && (
          <div className="mt-1.5">
            <InfoBadge info={sub.info} />
          </div>
        )}
      </div>
    </li>
  );
}

function SkeletonBar({ w, h = 12 }: { w: number | string; h?: number }) {
  return (
    <div
      className="rounded bg-muted animate-si-pulse"
      style={{ width: w, height: h }}
    />
  );
}

function MobileSkeletonRows({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="px-4 py-3.5 border-b flex gap-3 items-center">
          <SkeletonBar w={28} />
          <SkeletonBar h={24} w={24} />
          <SkeletonBar w={[140, 110, 160][i % 3]} />
        </li>
      ))}
    </>
  );
}

// ─── Desktop table ────────────────────────────────────────────────────────────

function DesktopRows({ subs }: { subs: Substitution[] }) {
  return (
    <>
      {subs.map((sub, i) => (
        <tr key={i} className="border-b last:border-b-0 hover:bg-muted/50">
          <td className="px-4 py-2.5 font-semibold">{sub.class_name}</td>
          <td className="px-4 py-2.5">
            <PeriodBadge period={sub.period} />
          </td>
          <td className="px-4 py-2.5 text-muted-foreground">
            {sub.absent_teacher || <Dash />}
          </td>
          <td className="px-4 py-2.5 font-medium">
            {sub.substitution_teacher || <Dash />}
          </td>
          <td className="px-4 py-2.5">
            {sub.subject_abbreviation ? (
              <SubjectChip subject={sub.subject_abbreviation} />
            ) : (
              <Dash />
            )}
          </td>
          <td className="px-4 py-2.5 text-muted-foreground">
            {sub.room || <Dash />}
          </td>
          <td className="px-4 py-2.5">
            {sub.info ? <InfoBadge info={sub.info} /> : <Dash />}
          </td>
        </tr>
      ))}
    </>
  );
}

// ─── Responsive: list on <sm, table on ≥sm ────────────────────────────────────

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
      <div className="sm:hidden">
        {!loading && subs.length === 0 ? (
          <EmptyState text={emptyText} />
        ) : (
          <ul aria-busy={loading}>
            {loading ? (
              <MobileSkeletonRows count={skeletonCount} />
            ) : (
              subs.map((sub, i) => <MobileRow key={i} sub={sub} />)
            )}
          </ul>
        )}
      </div>

      <div className="hidden sm:block overflow-x-auto">
        <table aria-busy={loading} className="w-full text-sm min-w-[580px]">
          <thead>
            <tr className="border-b">
              {COL_HEADS.map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground whitespace-nowrap"
                  scope="col"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: skeletonCount }, (_, i) => (
                <tr key={i} className="border-b">
                  {COL_HEADS.map((h, j) => (
                    <td key={h} className="px-4 py-3.5">
                      <SkeletonBar w={[40, 24, 90, 100, 32, 36, 70][j]} />
                    </td>
                  ))}
                </tr>
              ))
            ) : subs.length === 0 ? (
              <tr>
                <td colSpan={COL_HEADS.length}>
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
