"use client";

import Link from "next/link";
import { isRegularActivity } from "../../lib/activity";
import { formatParticipationScore } from "../../lib/participation";
import type { StatsMonthKey } from "../../lib/stats";
import type { Activity, Member } from "../../lib/types/domain";
import { useI18n } from "../i18n/i18n-context";
import { SectionHeader } from "./section-header";

type ActivityDetailPageProps = {
  activity: Activity;
  members: Member[];
  contextMemberId?: string | null;
  contextMonth?: StatsMonthKey | null;
};

export function ActivityDetailPage({
  activity,
  members,
  contextMemberId,
  contextMonth,
}: ActivityDetailPageProps) {
  const { t } = useI18n();
  const memberNameById = new Map(
    members.map((member) => [member.id, member.name] as const),
  );
  const backHref = contextMemberId
    ? `/dashboard/stats/${contextMemberId}${
        contextMonth ? `?month=${encodeURIComponent(contextMonth)}` : ""
      }`
    : "/dashboard/activities";

  function renderMemberTiles(memberIds: string[]) {
    return (
      <div className="flex flex-wrap gap-2">
        {memberIds.map((memberId) => (
          <span
            key={memberId}
            className="badge badge-outline badge-lg"
          >
            {memberNameById.get(memberId) ?? t("activities.unknownMember")}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        badge={t("activityDetail.badge")}
        description={t("activityDetail.description", {
          name: activity.activityName,
        })}
        title={t("activityDetail.title", {
          name: activity.activityName,
        })}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          className="btn btn-ghost justify-start px-0 sm:btn-outline sm:px-4"
          href={backHref}
        >
          {contextMemberId
            ? t("activityDetail.actions.backToHistory")
            : t("activityDetail.actions.backToActivities")}
        </Link>
        <Link
          className="btn btn-primary sm:min-w-36"
          href={`/dashboard/activities/${activity.id}/edit`}
        >
          {t("activityDetail.actions.edit")}
        </Link>
      </div>

      <div className="stats stats-vertical w-full border border-base-300 bg-base-100 shadow xl:stats-horizontal">
        <div className="stat">
          <div className="stat-title">{t("activityDetail.stats.type.title")}</div>
          <div className="stat-value text-primary text-2xl">
            {activity.activityType === "flash"
              ? t("common.activityType.flash")
              : t("common.activityType.regular")}
          </div>
          <div className="stat-desc">
            {t("activityDetail.stats.type.description")}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">{t("activityDetail.stats.date.title")}</div>
          <div className="stat-value text-secondary text-2xl">
            {activity.activityDate}
          </div>
          <div className="stat-desc">
            {t("activityDetail.stats.date.description")}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">{t("activityDetail.stats.area.title")}</div>
          <div className="stat-value text-accent text-2xl">{activity.area}</div>
          <div className="stat-desc">
            {t("activityDetail.stats.area.description")}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">
            {t("activityDetail.stats.participants.title")}
          </div>
          <div className="stat-value text-primary text-2xl">
            {activity.participantMemberIds.length}
          </div>
          <div className="stat-desc">
            {t("activityDetail.stats.participants.description")}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">{t("activityDetail.stats.score.title")}</div>
          <div className="stat-value text-secondary text-2xl">
            {formatParticipationScore(activity.participationWeight)}
          </div>
          <div className="stat-desc">
            {t("activityDetail.stats.score.description")}
          </div>
        </div>
        {isRegularActivity(activity) ? (
          <div className="stat">
            <div className="stat-title">
              {t("activityDetail.stats.groups.title")}
            </div>
            <div className="stat-value text-accent text-2xl">
              {activity.groups.length}
            </div>
            <div className="stat-desc">
              {t("activityDetail.stats.groups.description")}
            </div>
          </div>
        ) : null}
      </div>

      <section className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">
              {t("activityDetail.participants.title")}
            </h3>
            <p className="text-sm text-base-content/70">
              {t("activityDetail.participants.description")}
            </p>
          </div>

          {renderMemberTiles(activity.participantMemberIds)}
        </div>
      </section>

      {isRegularActivity(activity) ? (
        <section className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">
                {t("activityDetail.groups.title")}
              </h3>
              <p className="text-sm text-base-content/70">
                {t("activityDetail.groups.description")}
              </p>
            </div>

            {activity.groups.length === 0 ? (
              <div className="alert">
                <span>{t("activityDetail.groups.empty")}</span>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {activity.groups.map((group) => (
                  <div
                    key={group.groupNumber}
                    className="rounded-box border border-base-300 bg-base-200/20 p-4"
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-semibold">
                        {t("activities.group.title", {
                          number: group.groupNumber,
                        })}
                      </h4>
                      <span className="badge badge-outline">
                        {t("activities.badge.members", {
                          count: group.memberIds.length,
                        })}
                      </span>
                    </div>

                    {renderMemberTiles(group.memberIds)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
