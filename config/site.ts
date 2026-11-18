export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Vertretungsplan",
  description: "Vertretungsplan und Neuigkeiten aus dem Schul-Infoportal",
  schoolClasses: [
    ...[5, 6, 7, 8, 9, 10, 11].flatMap((g) =>
      ["a", "b", "c", "d"].map((l) => `${g}${l}`),
    ),
    "Q12",
    "Q13",
  ],
  // Timetable Manager promo banner — shown only to these usernames
  // (case-insensitive); ["*"] shows it to everyone, [] to nobody.
  promo: {
    usernames: ["demo"] as string[],
    website: "https://timetablemanager.app",
    appStore: "https://apps.apple.com/de/app/timetable-manager/id6738605424",
  },
};
