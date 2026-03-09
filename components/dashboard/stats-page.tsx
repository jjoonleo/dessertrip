"use client";

import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useStatsStore, selectVisibleStats } from "../../lib/stores/stats-store";
import type { Member, MemberParticipationStat } from "../../lib/types/domain";
import { SectionHeader } from "./section-header";

type StatsPageProps = {
  initialStats: MemberParticipationStat[];
};

export function StatsPage({ initialStats }: StatsPageProps) {
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
    hydrateStats(initialStats);
  }, [hydrateStats, initialStats]);

  const archivedCount = stats.filter((member) => member.archivedAt !== null).length;

  return (
    <div className="space-y-6">
      <SectionHeader
        badge="Stats"
        description="Participation counts remain derived from saved activity participants. Archived members remain in the history and can be filtered alongside the active roster."
        title="Member participation"
      />

      <div className="stats stats-vertical w-full border border-base-300 bg-base-100 shadow lg:stats-horizontal">
        <div className="stat">
          <div className="stat-title">Tracked members</div>
          <div className="stat-value text-primary">{stats.length}</div>
          <div className="stat-desc">Members included in participation stats</div>
        </div>
        <div className="stat">
          <div className="stat-title">Visible rows</div>
          <div className="stat-value text-secondary">{visibleStats.length}</div>
          <div className="stat-desc">Filtered and sorted result</div>
        </div>
        <div className="stat">
          <div className="stat-title">Archived members</div>
          <div className="stat-value text-accent">{archivedCount}</div>
          <div className="stat-desc">Historical roster retained</div>
        </div>
      </div>

      <section className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body gap-5">
          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto]">
            <input
              className="input input-bordered w-full"
              onChange={(event) => setStatSearch(event.target.value)}
              placeholder="Search stats"
              value={statSearch}
            />
            <select
              className="select select-bordered w-full"
              onChange={(event) =>
                setStatGenderFilter(event.target.value as "all" | Member["gender"])
              }
              value={statGenderFilter}
            >
              <option value="all">All genders</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
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
              <option value="active">Active only</option>
              <option value="all">All members</option>
              <option value="archived">Archived only</option>
            </select>
            <select
              className="select select-bordered w-full"
              onChange={(event) =>
                setStatSortKey(
                  event.target.value as "name" | "participationCount",
                )
              }
              value={statSortKey}
            >
              <option value="participationCount">Sort by count</option>
              <option value="name">Sort by name</option>
            </select>
            <button
              className="btn btn-outline"
              onClick={toggleStatSortDirection}
              type="button"
            >
              {statSortDirection === "asc" ? "Ascending" : "Descending"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Role</th>
                  <th className="text-right">Participations</th>
                </tr>
              </thead>
              <tbody>
                {visibleStats.length === 0 ? (
                  <tr>
                    <td className="text-base-content/60" colSpan={4}>
                      No members match the current filters.
                    </td>
                  </tr>
                ) : (
                  visibleStats.map((stat) => (
                    <tr key={stat.id}>
                      <td className="font-medium">{stat.name}</td>
                      <td>{stat.gender}</td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                          {stat.isManager ? (
                            <span className="badge badge-secondary badge-outline">
                              Manager
                            </span>
                          ) : (
                            <span className="badge badge-ghost">Member</span>
                          )}
                          {stat.archivedAt ? (
                            <span className="badge badge-warning badge-outline">
                              Archived
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="text-right font-semibold">
                        {stat.participationCount}
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
