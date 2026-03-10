"use client";

import Link from "next/link";
import { isRegularActivity } from "../../lib/activity";
import { formatParticipationScore } from "../../lib/participation";
import type { Activity, Member } from "../../lib/types/domain";
import { useI18n } from "../i18n/i18n-provider";
import { SectionHeader } from "./section-header";

type MemberParticipationHistoryPageProps = {
  member: Member;
  activities: Activity[];
};

export function MemberParticipationHistoryPage({
  member,
  activities,
}: MemberParticipationHistoryPageProps) {
  const { t } = useI18n();
  const participationScore = activities.reduce(
    (score, activity) => score + activity.participationWeight,
    0,
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        badge={t("history.badge")}
        description={t("history.description", {
          name: member.name,
        })}
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
            {t("history.stats.score.description")}
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
        <div className="card-body gap-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">
                {t("history.section.title")}
              </h3>
              <p className="text-sm text-base-content/70">
                {t("history.section.description")}
              </p>
            </div>

            <Link className="btn btn-outline" href="/dashboard/stats">
              {t("history.section.back")}
            </Link>
          </div>

          {activities.length === 0 ? (
            <div className="alert">
              <span>{t("history.empty")}</span>
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
                          href={`/dashboard/activities/${activity.id}/edit`}
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
