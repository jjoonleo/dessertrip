import Link from "next/link";
import { SectionHeader } from "../../components/dashboard/section-header";
import { getOverviewSnapshot } from "../../lib/dashboard-data";
import { dashboardNavItems } from "../../lib/dashboard-navigation";

export default async function DashboardPage() {
  const snapshot = await getOverviewSnapshot();
  const featureLinks = dashboardNavItems.filter((item) => item.href !== "/dashboard");

  return (
    <div className="space-y-6">
      <SectionHeader
        badge="Overview"
        description="Use the sidebar to move between dedicated pages for members, activity planning, saved activities, and participation stats."
        title="Weekly dessert club control center"
      />

      <div className="stats stats-vertical w-full border border-base-300 bg-base-100 shadow lg:stats-horizontal">
        <div className="stat">
          <div className="stat-title">Members</div>
          <div className="stat-value text-primary">{snapshot.memberCount}</div>
          <div className="stat-desc">
            {snapshot.managerCount} managers in the roster
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">Regular activities</div>
          <div className="stat-value text-secondary">
            {snapshot.activityCount}
          </div>
          <div className="stat-desc">
            {snapshot.latestActivity
              ? `Latest: ${snapshot.latestActivity.activityName}`
              : "No activities saved yet"}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">Navigation mode</div>
          <div className="stat-value text-accent">Multi-page</div>
          <div className="stat-desc">Sidebar links now change routes</div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {featureLinks.map((item) => (
          <Link
            key={item.href}
            className="card border border-base-300 bg-base-100 shadow-sm transition hover:border-primary hover:shadow-md"
            href={item.href}
          >
            <div className="card-body gap-3">
              <span className="badge badge-primary badge-outline">Open</span>
              <h2 className="card-title text-xl">{item.label}</h2>
              <p className="text-sm leading-6 text-base-content/70">
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
