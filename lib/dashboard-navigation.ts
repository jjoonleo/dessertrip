export type DashboardNavItem = {
  href: string;
  label: string;
  description: string;
};

export const dashboardNavItems: DashboardNavItem[] = [
  {
    href: "/dashboard",
    label: "Overview",
    description: "See the club summary and jump into the main workflows.",
  },
  {
    href: "/dashboard/members",
    label: "Members",
    description: "Add members, manage manager roles, and filter the roster.",
  },
  {
    href: "/dashboard/activities",
    label: "Activities",
    description: "Browse activities, create new ones, and manage generated groups.",
  },
  {
    href: "/dashboard/stats",
    label: "Stats",
    description: "Review per-member participation counts across activities.",
  },
];
