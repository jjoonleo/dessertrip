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
    href: "/dashboard/activity-builder",
    label: "Activity Builder",
    description: "Select participants, generate balanced groups, and save activities.",
  },
  {
    href: "/dashboard/activities",
    label: "Activities",
    description: "Browse saved Saturday activities and edit or delete them.",
  },
  {
    href: "/dashboard/stats",
    label: "Stats",
    description: "Review per-member participation counts across activities.",
  },
];
