export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "schule-infoportal",
  description: "View your school substitutions",
  navItems: [
    {
      label: "Substitutions",
      href: "/substitutions",
    },
    {
      label: "News",
      href: "/news",
    },
    {
      label: "Infoscreen",
      href: "/infoscreen",
    },
    {
      label: "Account",
      href: "/account",
    },
  ],
  navMenuItems: [],
  links: {
    github: "https://github.com/BennoCrafter/schule-infoportal",
  },
};
