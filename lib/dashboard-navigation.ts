import type { TranslationKey } from "./i18n/config";

export type DashboardNavItem = {
  href: string;
  labelKey: TranslationKey;
  descriptionKey: TranslationKey;
};

export const dashboardNavItems: DashboardNavItem[] = [
  {
    href: "/dashboard",
    labelKey: "nav.overview.label",
    descriptionKey: "nav.overview.description",
  },
  {
    href: "/dashboard/members",
    labelKey: "nav.members.label",
    descriptionKey: "nav.members.description",
  },
  {
    href: "/dashboard/activities",
    labelKey: "nav.activities.label",
    descriptionKey: "nav.activities.description",
  },
  {
    href: "/dashboard/stats",
    labelKey: "nav.stats.label",
    descriptionKey: "nav.stats.description",
  },
];
