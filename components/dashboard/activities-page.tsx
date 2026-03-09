"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { deleteRegularActivityAction } from "../../app/actions";
import { useI18n } from "../i18n/i18n-provider";
import { useActivitiesStore, selectVisibleActivities } from "../../lib/stores/activities-store";
import { useStatsStore } from "../../lib/stores/stats-store";
import type { Member, RegularActivity } from "../../lib/types/domain";
import { SectionHeader } from "./section-header";

type ActivitiesPageProps = {
  initialActivities: RegularActivity[];
  initialMembers: Member[];
};

export function ActivitiesPage({
  initialActivities,
  initialMembers,
}: ActivitiesPageProps) {
  const { locale, t } = useI18n();
  const router = useRouter();

  const activities = useActivitiesStore((state) => state.activities);
  const activitySearch = useActivitiesStore((state) => state.search);
  const selectedActivityId = useActivitiesStore((state) => state.selectedActivityId);
  const pendingDeleteId = useActivitiesStore((state) => state.pendingDeleteId);
  const activityPending = useActivitiesStore((state) => state.pending);
  const activityError = useActivitiesStore((state) => state.error);
  const hydrateActivities = useActivitiesStore((state) => state.hydrate);
  const setActivitySearch = useActivitiesStore((state) => state.setSearch);
  const selectActivity = useActivitiesStore((state) => state.selectActivity);
  const markDeletePending = useActivitiesStore((state) => state.markDeletePending);
  const setActivityPending = useActivitiesStore((state) => state.setPending);
  const setActivityError = useActivitiesStore((state) => state.setError);
  const removeActivity = useActivitiesStore((state) => state.removeActivity);
  const visibleActivities = useActivitiesStore(
    useShallow(selectVisibleActivities),
  );

  const hydrateStats = useStatsStore((state) => state.hydrate);
  const setStatsLocale = useStatsStore((state) => state.setLocale);

  useEffect(() => {
    hydrateActivities(initialActivities);
  }, [hydrateActivities, initialActivities]);

  useEffect(() => {
    setStatsLocale(locale);
  }, [locale, setStatsLocale]);

  const selectedActivity =
    activities.find((activity) => activity.id === selectedActivityId) ?? null;
  const memberNameById = new Map(
    initialMembers.map((member) => [member.id, member.name] as const),
  );

  async function handleDeleteActivity(activityId: string) {
    setActivityPending(true);
    setActivityError(null);

    const result = await deleteRegularActivityAction(activityId);

    if (!result.ok) {
      setActivityPending(false);
      setActivityError(result.error);
      return;
    }

    removeActivity(result.data.id);
    hydrateStats(result.data.stats, locale);
    router.refresh();
  }

  function handleEditActivity(activityId: string) {
    router.push(`/dashboard/activities/${activityId}/edit`);
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        badge={t("activities.badge")}
        description={t("activities.description")}
        title={t("activities.title")}
      />

      <div className="stats stats-vertical w-full border border-base-300 bg-base-100 shadow lg:stats-horizontal">
        <div className="stat">
          <div className="stat-title">{t("activities.stats.saved.title")}</div>
          <div className="stat-value text-primary">{activities.length}</div>
          <div className="stat-desc">
            {t("activities.stats.saved.description")}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">{t("activities.stats.visible.title")}</div>
          <div className="stat-value text-secondary">
            {visibleActivities.length}
          </div>
          <div className="stat-desc">
            {t("activities.stats.visible.description")}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">
            {t("activities.stats.openDetail.title")}
          </div>
          <div className="stat-value text-accent">
            {selectedActivity ? 1 : 0}
          </div>
          <div className="stat-desc">
            {t("activities.stats.openDetail.description")}
          </div>
        </div>
      </div>

      <section className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body gap-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">
                {t("activities.list.title")}
              </h3>
              <p className="text-sm text-base-content/70">
                {t("activities.list.description")}
              </p>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => router.push("/dashboard/activities/new")}
              type="button"
            >
              {t("activities.list.add")}
            </button>
          </div>

          <input
            className="input input-bordered w-full"
            onChange={(event) => setActivitySearch(event.target.value)}
            placeholder={t("activities.searchPlaceholder")}
            value={activitySearch}
          />

          {activityError ? (
            <div className="alert alert-error">
              <span>{activityError}</span>
            </div>
          ) : null}

          <div className="space-y-3">
            {visibleActivities.length === 0 ? (
              <div className="alert">
                <span>{t("activities.empty")}</span>
              </div>
            ) : (
              visibleActivities.map((activity) => {
                const selected = selectedActivity?.id === activity.id;

                return (
                  <div
                    key={activity.id}
                    className={`collapse collapse-arrow border border-base-300 bg-base-100 ${
                      selected ? "collapse-open" : "collapse-close"
                    }`}
                  >
                    <div
                      className="collapse-title cursor-pointer pr-12"
                      onClick={() => selectActivity(selected ? null : activity.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          selectActivity(selected ? null : activity.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-bold">{activity.activityName}</h2>
                          <span className="badge badge-outline">
                            {t("activities.badge.participants", {
                              count: activity.participantMemberIds.length,
                            })}
                          </span>
                          <span className="badge badge-secondary badge-outline">
                            {t("activities.badge.groups", {
                              count: activity.groups.length,
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-base-content/60">
                          {t("activities.collapse.hint")}
                        </p>
                      </div>
                    </div>

                    <div className="collapse-content space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleEditActivity(activity.id)}
                          type="button"
                        >
                          {t("activities.actions.edit")}
                        </button>

                        {pendingDeleteId === activity.id ? (
                          <>
                            <button
                              className="btn btn-error btn-sm"
                              disabled={activityPending}
                              onClick={() => handleDeleteActivity(activity.id)}
                              type="button"
                            >
                              {t("activities.actions.confirmDelete")}
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => markDeletePending(null)}
                              type="button"
                            >
                              {t("activities.actions.cancel")}
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn btn-outline btn-error btn-sm"
                            onClick={() => markDeletePending(activity.id)}
                            type="button"
                          >
                            {t("activities.actions.delete")}
                          </button>
                        )}
                      </div>

                      {activity.groups.length === 0 ? (
                        <div className="alert">
                          <span>{t("activities.groups.empty")}</span>
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          {activity.groups.map((group) => (
                            <div
                              key={group.groupNumber}
                              className="rounded-box border border-base-300 bg-base-200 p-4"
                            >
                              <div className="mb-3 flex items-center justify-between">
                                <h3 className="font-semibold">
                                  {t("activities.group.title", {
                                    number: group.groupNumber,
                                  })}
                                </h3>
                                <span className="badge badge-outline">
                                  {t("activities.badge.members", {
                                    count: group.memberIds.length,
                                  })}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {group.memberIds.map((memberId) => (
                                  <span
                                    key={memberId}
                                    className="badge badge-outline badge-lg"
                                  >
                                    {memberNameById.get(memberId) ??
                                      t("activities.unknownMember")}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
