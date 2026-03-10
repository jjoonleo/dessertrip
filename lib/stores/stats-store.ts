"use client";

import { create } from "zustand";
import type { AppLocale } from "../i18n/config";
import type {
  ArchiveFilter,
  Gender,
  MemberParticipationStat,
} from "../types/domain";

type StatsSortKey = "name" | "participationScore";
type SortDirection = "asc" | "desc";
type GenderFilter = Gender | "all";

export type StatsState = {
  stats: MemberParticipationStat[];
  locale: AppLocale;
  search: string;
  genderFilter: GenderFilter;
  archiveFilter: ArchiveFilter;
  sortKey: StatsSortKey;
  sortDirection: SortDirection;
  hydrate: (stats: MemberParticipationStat[], locale?: AppLocale) => void;
  setLocale: (locale: AppLocale) => void;
  upsertMemberStat: (stat: MemberParticipationStat) => void;
  setSearch: (search: string) => void;
  setGenderFilter: (genderFilter: GenderFilter) => void;
  setArchiveFilter: (archiveFilter: ArchiveFilter) => void;
  setSortKey: (sortKey: StatsSortKey) => void;
  toggleSortDirection: () => void;
};

export const useStatsStore = create<StatsState>((set) => ({
  stats: [],
  locale: "ko",
  search: "",
  genderFilter: "all",
  archiveFilter: "active",
  sortKey: "participationScore",
  sortDirection: "desc",
  hydrate: (stats, locale = "ko") => set({ stats, locale }),
  setLocale: (locale) => set({ locale }),
  upsertMemberStat: (stat) =>
    set((state) => ({
      stats: [...state.stats.filter((current) => current.id !== stat.id), stat].sort(
        (left, right) => left.name.localeCompare(right.name, state.locale),
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
      return left.name.localeCompare(right.name, state.locale) * direction;
    }

    return (left.participationScore - right.participationScore) * direction;
  });

  return filteredStats;
}
