"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useShallow } from "zustand/react/shallow";
import { formatParticipationScore } from "../../lib/participation";
import { useI18n } from "../i18n/i18n-provider";
import { useStatsStore, selectVisibleStats } from "../../lib/stores/stats-store";
import type { Member, MemberParticipationStat } from "../../lib/types/domain";
import { SectionHeader } from "./section-header";

type StatsPageProps = {
  initialStats: MemberParticipationStat[];
};

export function StatsPage({ initialStats }: StatsPageProps) {
  const { locale, t } = useI18n();
  const stats = useStatsStore((state) => state.stats);
  const statSearch = useStatsStore((state) => state.search);
  const statGenderFilter = useStatsStore((state) => state.genderFilter);
  const statArchiveFilter = useStatsStore((state) => state.archiveFilter);
  const statSortKey = useStatsStore((state) => state.sortKey);
  const statSortDirection = useStatsStore((state) => state.sortDirection);
  const hydrateStats = useStatsStore((state) => state.hydrate);
  const setStatSearch = useStatsStore((state) => state.setSearch);
  const setStatGenderFilter = useStatsStore((state) => state.setGenderFilter);
  const setStatArchiveFilter = useStatsStore((state) => state.setArchiveFilter);
  const setStatSortKey = useStatsStore((state) => state.setSortKey);
  const toggleStatSortDirection = useStatsStore(
    (state) => state.toggleSortDirection,
  );
  const visibleStats = useStatsStore(useShallow(selectVisibleStats));

  useEffect(() => {
    hydrateStats(initialStats, locale);
  }, [hydrateStats, initialStats, locale]);

  const archivedCount = stats.filter((member) => member.archivedAt !== null).length;

  return (
    <div className="space-y-6">
      <SectionHeader
        badge={t("stats.badge")}
        description={t("stats.description")}
        title={t("stats.title")}
      />

      <div className="stats stats-vertical w-full border border-base-300 bg-base-100 shadow lg:stats-horizontal">
        <div className="stat">
          <div className="stat-title">{t("stats.stats.tracked.title")}</div>
          <div className="stat-value text-primary">{stats.length}</div>
          <div className="stat-desc">
            {t("stats.stats.tracked.description")}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">{t("stats.stats.visible.title")}</div>
          <div className="stat-value text-secondary">{visibleStats.length}</div>
          <div className="stat-desc">
            {t("stats.stats.visible.description")}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">{t("stats.stats.archived.title")}</div>
          <div className="stat-value text-accent">{archivedCount}</div>
          <div className="stat-desc">
            {t("stats.stats.archived.description")}
          </div>
        </div>
      </div>

      <section className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body gap-5">
          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto]">
            <input
              className="input input-bordered w-full"
              onChange={(event) => setStatSearch(event.target.value)}
              placeholder={t("stats.filters.searchPlaceholder")}
              value={statSearch}
            />
            <select
              className="select select-bordered w-full"
              onChange={(event) =>
                setStatGenderFilter(event.target.value as "all" | Member["gender"])
              }
              value={statGenderFilter}
            >
              <option value="all">{t("members.filters.allGenders")}</option>
              <option value="female">{t("common.gender.female")}</option>
              <option value="male">{t("common.gender.male")}</option>
            </select>
            <select
              className="select select-bordered w-full"
              onChange={(event) =>
                setStatArchiveFilter(
                  event.target.value as "active" | "all" | "archived",
                )
              }
              value={statArchiveFilter}
            >
              <option value="active">{t("members.filters.activeOnly")}</option>
              <option value="all">{t("members.filters.allMembers")}</option>
              <option value="archived">
                {t("members.filters.archivedOnly")}
              </option>
            </select>
            <select
              className="select select-bordered w-full"
              onChange={(event) =>
                setStatSortKey(
                  event.target.value as "name" | "participationScore",
                )
              }
              value={statSortKey}
            >
              <option value="participationScore">
                {t("stats.filters.sortByCount")}
              </option>
              <option value="name">{t("stats.filters.sortByName")}</option>
            </select>
            <button
              className="btn btn-outline"
              onClick={toggleStatSortDirection}
              type="button"
            >
              {statSortDirection === "asc"
                ? t("stats.filters.ascending")
                : t("stats.filters.descending")}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>{t("stats.table.name")}</th>
                  <th>{t("stats.table.gender")}</th>
                  <th>{t("stats.table.role")}</th>
                  <th className="text-right">{t("stats.table.participations")}</th>
                </tr>
              </thead>
              <tbody>
                {visibleStats.length === 0 ? (
                  <tr>
                    <td className="text-base-content/60" colSpan={4}>
                      {t("stats.table.empty")}
                    </td>
                  </tr>
                ) : (
                  visibleStats.map((stat) => (
                    <tr key={stat.id}>
                      <td>
                        <Link
                          className="link link-hover font-medium text-primary"
                          href={`/dashboard/stats/${stat.id}`}
                        >
                          {stat.name}
                        </Link>
                      </td>
                      <td>
                        {stat.gender === "female"
                          ? t("common.gender.female")
                          : t("common.gender.male")}
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                          {stat.isManager ? (
                            <span className="badge badge-secondary badge-outline">
                              {t("common.role.manager")}
                            </span>
                          ) : (
                            <span className="badge badge-ghost">
                              {t("common.role.member")}
                            </span>
                          )}
                          {stat.archivedAt ? (
                            <span className="badge badge-warning badge-outline">
                              {t("common.status.archived")}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="text-right font-semibold">
                        {formatParticipationScore(stat.participationScore)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
