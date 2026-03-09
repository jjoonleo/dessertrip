"use client";

import { create } from "zustand";
import type {
  ArchiveFilter,
  Gender,
  MemberParticipationStat,
} from "../types/domain";

type StatsSortKey = "name" | "participationCount";
type SortDirection = "asc" | "desc";
type GenderFilter = Gender | "all";

export type StatsState = {
  stats: MemberParticipationStat[];
  search: string;
  genderFilter: GenderFilter;
  archiveFilter: ArchiveFilter;
  sortKey: StatsSortKey;
  sortDirection: SortDirection;
  hydrate: (stats: MemberParticipationStat[]) => void;
  upsertMemberStat: (stat: MemberParticipationStat) => void;
  setSearch: (search: string) => void;
  setGenderFilter: (genderFilter: GenderFilter) => void;
  setArchiveFilter: (archiveFilter: ArchiveFilter) => void;
  setSortKey: (sortKey: StatsSortKey) => void;
  toggleSortDirection: () => void;
};

export const useStatsStore = create<StatsState>((set) => ({
  stats: [],
  search: "",
  genderFilter: "all",
  archiveFilter: "active",
  sortKey: "participationCount",
  sortDirection: "desc",
  hydrate: (stats) => set({ stats }),
  upsertMemberStat: (stat) =>
    set((state) => ({
      stats: [...state.stats.filter((current) => current.id !== stat.id), stat].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
  })),
  setSearch: (search) => set({ search }),
  setGenderFilter: (genderFilter) => set({ genderFilter }),
  setArchiveFilter: (archiveFilter) => set({ archiveFilter }),
  setSortKey: (sortKey) => set({ sortKey }),
  toggleSortDirection: () =>
    set((state) => ({
      sortDirection: state.sortDirection === "asc" ? "desc" : "asc",
    })),
}));

export function selectVisibleStats(state: StatsState) {
  const normalizedSearch = state.search.trim().toLowerCase();
  const filteredStats = state.stats.filter((member) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      member.name.toLowerCase().includes(normalizedSearch);
    const matchesGender =
      state.genderFilter === "all" || member.gender === state.genderFilter;
    const matchesArchive =
      state.archiveFilter === "all" ||
      (state.archiveFilter === "active"
        ? member.archivedAt === null
        : member.archivedAt !== null);

    return matchesSearch && matchesGender && matchesArchive;
  });

  filteredStats.sort((left, right) => {
    const direction = state.sortDirection === "asc" ? 1 : -1;

    if (state.sortKey === "name") {
      return left.name.localeCompare(right.name) * direction;
    }

    return (left.participationCount - right.participationCount) * direction;
  });

  return filteredStats;
}
