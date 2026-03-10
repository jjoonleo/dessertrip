import { beforeEach, describe, expect, it } from "vitest";
import { selectVisibleStats, useStatsStore } from "../lib/stores/stats-store";

describe("stats store", () => {
  beforeEach(() => {
    useStatsStore.setState({
      stats: [],
      search: "",
      genderFilter: "all",
      archiveFilter: "active",
      sortKey: "participationScore",
      sortDirection: "desc",
    });
  });

  it("filters and sorts participation stats", () => {
    useStatsStore.getState().hydrate([
      {
        id: "1",
        name: "Ari",
        gender: "female",
        isManager: false,
        archivedAt: null,
        participationScore: 2,
      },
      {
        id: "2",
        name: "Ben",
        gender: "male",
        isManager: true,
        archivedAt: null,
        participationScore: 5,
      },
      {
        id: "3",
        name: "Coco",
        gender: "female",
        isManager: false,
        archivedAt: null,
        participationScore: 1,
      },
    ]);
    useStatsStore.getState().setGenderFilter("female");
    useStatsStore.getState().setSortKey("name");
    useStatsStore.getState().toggleSortDirection();

    const visibleStats = selectVisibleStats(useStatsStore.getState());

    expect(visibleStats.map((member) => member.name)).toEqual(["Ari", "Coco"]);
  });

  it("filters archived members separately", () => {
    useStatsStore.getState().hydrate([
      {
        id: "1",
        name: "Ari",
        gender: "female",
        isManager: false,
        archivedAt: null,
        participationScore: 2,
      },
      {
        id: "2",
        name: "Ben",
        gender: "male",
        isManager: true,
        archivedAt: "2026-03-09T00:00:00.000Z",
        participationScore: 5,
      },
    ]);
    useStatsStore.getState().setArchiveFilter("archived");

    const visibleStats = selectVisibleStats(useStatsStore.getState());

    expect(visibleStats.map((member) => member.name)).toEqual(["Ben"]);
  });
});
