"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isRegularActivity } from "../../lib/activity";
import { formatParticipationScore } from "../../lib/participation";
import { formatStatsMonthLabel, type StatsMonthKey } from "../../lib/stats";
import type { Activity, Member } from "../../lib/types/domain";
import { useI18n } from "../i18n/i18n-context";
import { SectionHeader } from "./section-header";

type MemberParticipationHistoryPageProps = {
  member: Member;
  activities: Activity[];
  availableMonths: StatsMonthKey[];
  selectedMonth: StatsMonthKey | null;
};

export function MemberParticipationHistoryPage({
  member,
  activities,
  availableMonths,
  selectedMonth,
}: MemberParticipationHistoryPageProps) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const participationScore = activities.reduce(
    (score, activity) => score + activity.participationWeight,
    0,
  );
  const monthOptions = [...new Set(
    selectedMonth ? [...availableMonths, selectedMonth] : availableMonths,
  )].sort((left, right) => right.localeCompare(left));
  const activeMonth = selectedMonth ?? monthOptions[0] ?? "";
  const selectedMonthLabel = selectedMonth
    ? formatStatsMonthLabel(selectedMonth, locale)
    : null;
  const backHref = selectedMonth
    ? `/dashboard/stats?month=${encodeURIComponent(selectedMonth)}`
    : "/dashboard/stats";

  function getActivityDetailHref(activityId: string) {
    const params = new URLSearchParams({
      memberId: member.id,
    });

    if (selectedMonth) {
      params.set("month", selectedMonth);
    }

    return `/dashboard/activities/${activityId}?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        badge={t("history.badge")}
        description={
          selectedMonthLabel
            ? t("history.descriptionMonth", {
                month: selectedMonthLabel,
                name: member.name,
              })
            : t("history.description", {
                name: member.name,
              })
        }
        title={t("history.title", {
          name: member.name,
        })}
      />

      <div className="stats stats-vertical w-full border border-base-300 bg-base-100 shadow lg:stats-horizontal">
        <div className="stat">
          <div className="stat-title">
            {t("history.stats.score.title")}
          </div>
          <div className="stat-value text-primary">
            {formatParticipationScore(participationScore)}
          </div>
          <div className="stat-desc">
            {selectedMonthLabel
              ? t("history.stats.score.descriptionMonth", {
                  month: selectedMonthLabel,
                })
              : t("history.stats.score.description")}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">{t("history.stats.role.title")}</div>
          <div className="stat-value text-secondary">
            {member.isManager
              ? t("common.role.manager")
              : t("common.role.member")}
          </div>
          <div className="stat-desc">{t("history.stats.role.description")}</div>
        </div>
        <div className="stat">
          <div className="stat-title">{t("history.stats.status.title")}</div>
          <div className="stat-value text-accent">
            {member.archivedAt
              ? t("common.status.archived")
              : t("common.status.active")}
          </div>
          <div className="stat-desc">
            {t("history.stats.status.description")}
          </div>
        </div>
      </div>

      <section className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/60">
              {t("stats.filters.periodTitle")}
            </h3>
            <p className="text-sm text-base-content/70">
              {selectedMonthLabel
                ? t("history.filters.periodDescriptionMonth", {
                    month: selectedMonthLabel,
                  })
                : t("history.filters.periodDescriptionAll")}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              className={`btn ${selectedMonth ? "btn-outline" : "btn-primary"}`}
              onClick={() => router.replace(pathname)}
              type="button"
            >
              {t("stats.filters.allTime")}
            </button>
            <select
              aria-label={t("stats.filters.month")}
              className="select select-bordered w-full min-w-52"
              disabled={monthOptions.length === 0}
              onChange={(event) =>
                router.replace(
                  `${pathname}?month=${encodeURIComponent(event.target.value)}`,
                )
              }
              value={activeMonth}
            >
              {monthOptions.length === 0 ? (
                <option value="">{t("history.filters.noMonths")}</option>
              ) : (
                monthOptions.map((month) => (
                  <option key={month} value={month}>
                    {formatStatsMonthLabel(month, locale)}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </section>

      <section className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body gap-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">
                {t("history.section.title")}
              </h3>
              <p className="text-sm text-base-content/70">
                {selectedMonthLabel
                  ? t("history.section.descriptionMonth", {
                      month: selectedMonthLabel,
                    })
                  : t("history.section.description")}
              </p>
            </div>

            <Link className="btn btn-outline" href={backHref}>
              {t("history.section.back")}
            </Link>
          </div>

          {activities.length === 0 ? (
            <div className="alert">
              <span>
                {selectedMonthLabel
                  ? t("history.emptyMonth", {
                      month: selectedMonthLabel,
                    })
                  : t("history.empty")}
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => {
                const memberGroup =
                  activity.groups.find((group) =>
                    group.memberIds.includes(member.id),
                  ) ?? null;

                return (
                  <div
                    key={activity.id}
                    className="card border border-base-300 bg-base-100 shadow-sm"
                  >
                    <div className="card-body gap-4 p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <h4 className="text-lg font-semibold">
                            {activity.activityName}
                          </h4>
                          <p className="text-sm text-base-content/60">
                            {activity.activityDate} • {activity.area}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className="badge badge-accent badge-outline">
                            {activity.activityType === "flash"
                              ? t("common.activityType.flash")
                              : t("common.activityType.regular")}
                          </span>
                          <span className="badge badge-primary badge-outline">
                            {t("activities.badge.participants", {
                              count: activity.participantMemberIds.length,
                            })}
                          </span>
                          {isRegularActivity(activity) ? (
                            <span className="badge badge-secondary badge-outline">
                              {t("activities.badge.groups", {
                                count: activity.groups.length,
                              })}
                            </span>
                          ) : null}
                          {isRegularActivity(activity) && memberGroup ? (
                            <span className="badge badge-accent badge-outline">
                              {t("history.badge.group", {
                                number: memberGroup.groupNumber,
                              })}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="card-actions justify-end">
                        <Link
                          className="btn btn-outline btn-sm"
                          href={getActivityDetailHref(activity.id)}
                        >
                          {t("history.openActivity")}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
