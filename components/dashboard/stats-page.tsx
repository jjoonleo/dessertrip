"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { formatParticipationScore } from "../../lib/participation";
import {
  formatStatsMonthLabel,
  getAvailableStatsMonths,
  getCurrentStatsMonthInKst,
  getParticipationScoreForPeriod,
  type StatsPeriod,
} from "../../lib/stats";
import { useI18n } from "../i18n/i18n-context";
import { useStatsStore, selectVisibleStats } from "../../lib/stores/stats-store";
import type { Member, MemberParticipationStat } from "../../lib/types/domain";
import { SectionHeader } from "./section-header";

type StatsPageProps = {
  initialStats: MemberParticipationStat[];
  initialSelectedPeriod?: StatsPeriod;
};

function getMemberHistoryHref(memberId: string, selectedPeriod: StatsPeriod) {
  if (selectedPeriod === "all") {
    return `/dashboard/stats/${memberId}`;
  }

  return `/dashboard/stats/${memberId}?month=${encodeURIComponent(selectedPeriod)}`;
}

function isNestedInteractiveElement(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    target.closest("a, button, input, select, textarea") !== null
  );
}

export function StatsPage({
  initialStats,
  initialSelectedPeriod,
}: StatsPageProps) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const stats = useStatsStore((state) => state.stats);
  const statSearch = useStatsStore((state) => state.search);
  const statGenderFilter = useStatsStore((state) => state.genderFilter);
  const statArchiveFilter = useStatsStore((state) => state.archiveFilter);
  const selectedPeriod = useStatsStore((state) => state.selectedPeriod);
  const statSortKey = useStatsStore((state) => state.sortKey);
  const statSortDirection = useStatsStore((state) => state.sortDirection);
  const hydrateStats = useStatsStore((state) => state.hydrate);
  const setStatSearch = useStatsStore((state) => state.setSearch);
  const setStatGenderFilter = useStatsStore((state) => state.setGenderFilter);
  const setStatArchiveFilter = useStatsStore((state) => state.setArchiveFilter);
  const setSelectedPeriod = useStatsStore((state) => state.setSelectedPeriod);
  const setStatSortKey = useStatsStore((state) => state.setSortKey);
  const toggleStatSortDirection = useStatsStore(
    (state) => state.toggleSortDirection,
  );
  const visibleStats = useStatsStore(useShallow(selectVisibleStats));

  useEffect(() => {
    hydrateStats(initialStats, locale);
  }, [hydrateStats, initialStats, locale]);

  useEffect(() => {
    if (initialSelectedPeriod) {
      setSelectedPeriod(initialSelectedPeriod);
      return;
    }

    if (useStatsStore.getState().selectedPeriod !== "all") {
      setSelectedPeriod(getCurrentStatsMonthInKst());
    }
  }, [initialSelectedPeriod, setSelectedPeriod]);

  const archivedCount = stats.filter((member) => member.archivedAt !== null).length;
  const currentMonth = getCurrentStatsMonthInKst();
  const monthOptions = getAvailableStatsMonths(stats, {
    currentMonth,
    selectedPeriod,
  });
  const activeMonth = selectedPeriod === "all" ? currentMonth : selectedPeriod;
  const activeMonthLabel = formatStatsMonthLabel(activeMonth, locale);
  const monthlyParticipants = stats.filter(
    (member) => getParticipationScoreForPeriod(member, activeMonth) > 0,
  ).length;
  const monthlyParticipationTotal = stats.reduce(
    (sum, member) => sum + getParticipationScoreForPeriod(member, activeMonth),
    0,
  );
  const participationHeader =
    selectedPeriod === "all"
      ? t("stats.table.participationsAllTime")
      : t("stats.table.participationsMonth", {
          month: activeMonthLabel,
        });

  function openMemberHistory(memberId: string) {
    router.push(getMemberHistoryHref(memberId, selectedPeriod));
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        badge={t("stats.badge")}
        description={t("stats.description")}
        title={t("stats.title")}
      />

      {selectedPeriod === "all" ? (
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
      ) : (
        <div className="stats stats-vertical w-full border border-base-300 bg-base-100 shadow lg:stats-horizontal">
          <div className="stat">
            <div className="stat-title">
              {t("stats.stats.selectedMonth.title")}
            </div>
            <div className="stat-value text-primary text-3xl">
              {activeMonthLabel}
            </div>
            <div className="stat-desc">
              {t("stats.stats.selectedMonth.description")}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">
              {t("stats.stats.monthParticipants.title")}
            </div>
            <div className="stat-value text-secondary">{monthlyParticipants}</div>
            <div className="stat-desc">
              {t("stats.stats.monthParticipants.description")}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">
              {t("stats.stats.monthTotal.title")}
            </div>
            <div className="stat-value text-accent">
              {formatParticipationScore(monthlyParticipationTotal)}
            </div>
            <div className="stat-desc">
              {t("stats.stats.monthTotal.description")}
            </div>
          </div>
        </div>
      )}

      <section className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body gap-5">
          <div className="flex flex-col gap-4 rounded-box border border-base-300 bg-base-200/30 p-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/60">
                {t("stats.filters.periodTitle")}
              </h3>
              <p className="text-sm text-base-content/70">
                {selectedPeriod === "all"
                  ? t("stats.filters.periodDescriptionAll")
                  : t("stats.filters.periodDescriptionMonth", {
                      month: activeMonthLabel,
                    })}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                className={`btn ${selectedPeriod === "all" ? "btn-primary" : "btn-outline"}`}
                onClick={() => {
                  setSelectedPeriod("all");
                  router.replace(pathname);
                }}
                type="button"
              >
                {t("stats.filters.allTime")}
              </button>
              <select
                aria-label={t("stats.filters.month")}
                className="select select-bordered w-full min-w-52"
                onChange={(event) => {
                  const nextPeriod = event.target.value as StatsPeriod;

                  setSelectedPeriod(nextPeriod);

                  if (nextPeriod !== "all") {
                    router.replace(
                      `${pathname}?month=${encodeURIComponent(nextPeriod)}`,
                    );
                  }
                }}
                value={activeMonth}
              >
                {monthOptions.map((month) => (
                  <option key={month} value={month}>
                    {formatStatsMonthLabel(month, locale)}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
                  <th className="text-right">{participationHeader}</th>
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
                    <tr
                      key={stat.id}
                      className="cursor-pointer transition-colors hover:bg-base-200/60 focus-within:bg-base-200/60"
                      onClick={(event) => {
                        if (isNestedInteractiveElement(event.target)) {
                          return;
                        }

                        openMemberHistory(stat.id);
                      }}
                      onKeyDown={(event) => {
                        if (
                          isNestedInteractiveElement(event.target) ||
                          (event.key !== "Enter" && event.key !== " ")
                        ) {
                          return;
                        }

                        event.preventDefault();
                        openMemberHistory(stat.id);
                      }}
                      tabIndex={0}
                    >
                      <td>
                        <Link
                          className="link link-hover font-medium text-primary"
                          href={getMemberHistoryHref(stat.id, selectedPeriod)}
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
                        {formatParticipationScore(
                          getParticipationScoreForPeriod(stat, selectedPeriod),
                        )}
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
