import Link from "next/link";
import { SectionHeader } from "../../components/dashboard/section-header";
import { getOverviewSnapshot } from "../../lib/dashboard-data";
import { dashboardNavItems } from "../../lib/dashboard-navigation";
import { getRequestI18n } from "../../lib/i18n/server";

export default async function DashboardPage() {
  const snapshot = await getOverviewSnapshot();
  const { t } = await getRequestI18n();
  const featureLinks = dashboardNavItems.filter((item) => item.href !== "/dashboard");

  return (
    <div className="space-y-6">
      <SectionHeader
        badge={t("overview.badge")}
        description={t("overview.description")}
        title={t("overview.title")}
      />

      <div className="stats stats-vertical w-full border border-base-300 bg-base-100 shadow lg:stats-horizontal">
        <div className="stat">
          <div className="stat-title">{t("overview.stats.members.title")}</div>
          <div className="stat-value text-primary">{snapshot.memberCount}</div>
          <div className="stat-desc">
            {t("overview.stats.members.description", {
              count: snapshot.managerCount,
            })}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">
            {t("overview.stats.activities.title")}
          </div>
          <div className="stat-value text-secondary">
            {snapshot.activityCount}
          </div>
          <div className="stat-desc">
            {snapshot.latestActivity
              ? t("overview.stats.activities.latest", {
                  name: snapshot.latestActivity.activityName,
                })
              : t("overview.stats.activities.empty")}
          </div>
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
              <span className="badge badge-primary badge-outline">
                {t("overview.cta.open")}
              </span>
              <h2 className="card-title text-xl">{t(item.labelKey)}</h2>
              <p className="text-sm leading-6 text-base-content/70">
                {t(item.descriptionKey)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
