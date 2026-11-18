import { useEffect, useState } from "react";
import { ExternalLink, X } from "lucide-react";

import { siteConfig } from "@/config/site";

const DISMISS_KEY = "schule_promo_dismissed";

function isTargeted(username: string | null) {
  const list = siteConfig.promo.usernames.map((u) => u.toLowerCase());

  return (
    list.includes("*") || (!!username && list.includes(username.toLowerCase()))
  );
}

// Ad for the Timetable Manager iOS app, for the usernames in siteConfig.promo
export function PromoBanner({ username }: { username: string | null }) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  if (dismissed || !isTargeted(username)) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  return (
    <aside
      aria-label="Anzeige: Timetable Manager"
      className="relative flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border bg-card p-4 pr-11"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <img
          alt=""
          className="size-12 shrink-0 rounded-xl"
          height={48}
          src="/timetablemanager-icon.png"
          width={48}
        />
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold">
            Timetable Manager
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase leading-none tracking-wide text-muted-foreground">
              Anzeige
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            Deine Vertretungen auch in der App – zusammen mit Stundenplan,
            Aufgaben und Prüfungen. Kostenlos für iPhone und iPad.
          </p>
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <a
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border text-sm font-medium hover:bg-muted transition-colors"
          href={siteConfig.promo.website}
          rel="noreferrer"
          target="_blank"
        >
          Website
          <ExternalLink size={14} />
        </a>
        <a
          className="inline-flex items-center h-9 px-3 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
          href={siteConfig.promo.appStore}
          rel="noreferrer"
          target="_blank"
        >
          Im App Store laden
        </a>
      </div>
      <button
        aria-label="Anzeige ausblenden"
        className="absolute top-1/2 right-2 -translate-y-1/2 size-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        onClick={dismiss}
      >
        <X size={16} />
      </button>
    </aside>
  );
}
