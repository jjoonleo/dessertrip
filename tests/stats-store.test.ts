import { beforeEach, describe, expect, it } from "vitest";
import { selectVisibleStats, useStatsStore } from "../lib/stores/stats-store";

describe("stats store", () => {
  beforeEach(() => {
    useStatsStore.setState({
      stats: [],
      search: "",
      genderFilter: "all",
      archiveFilter: "active",
      selectedPeriod: "2026-03",
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
        monthlyParticipationScores: {
          "2026-03": 1,
        },
      },
      {
        id: "2",
        name: "Ben",
        gender: "male",
        isManager: true,
        archivedAt: null,
        participationScore: 5,
        monthlyParticipationScores: {
          "2026-03": 3,
        },
      },
      {
        id: "3",
        name: "Coco",
        gender: "female",
        isManager: false,
        archivedAt: null,
        participationScore: 1,
        monthlyParticipationScores: {
          "2026-02": 1,
        },
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
        monthlyParticipationScores: {
          "2026-03": 2,
        },
      },
      {
        id: "2",
        name: "Ben",
        gender: "male",
        isManager: true,
        archivedAt: "2026-03-09T00:00:00.000Z",
        participationScore: 5,
        monthlyParticipationScores: {
          "2026-03": 5,
        },
      },
    ]);
    useStatsStore.getState().setArchiveFilter("archived");

    const visibleStats = selectVisibleStats(useStatsStore.getState());

    expect(visibleStats.map((member) => member.name)).toEqual(["Ben"]);
  });

  it("sorts by the selected month's score before switching back to all-time", () => {
    useStatsStore.getState().hydrate([
      {
        id: "1",
        name: "Ari",
        gender: "female",
        isManager: false,
        archivedAt: null,
        participationScore: 5,
        monthlyParticipationScores: {
          "2026-02": 1,
        },
      },
      {
        id: "2",
        name: "Ben",
        gender: "male",
        isManager: true,
        archivedAt: null,
        participationScore: 2,
        monthlyParticipationScores: {
          "2026-02": 3,
        },
      },
      {
        id: "3",
        name: "Coco",
        gender: "female",
        isManager: false,
        archivedAt: null,
        participationScore: 9,
        monthlyParticipationScores: {},
      },
    ]);

    useStatsStore.getState().setSelectedPeriod("2026-02");

    expect(selectVisibleStats(useStatsStore.getState()).map((member) => member.name)).toEqual([
      "Ben",
      "Ari",
      "Coco",
    ]);

    useStatsStore.getState().setSelectedPeriod("all");

    expect(selectVisibleStats(useStatsStore.getState()).map((member) => member.name)).toEqual([
      "Coco",
      "Ari",
      "Ben",
    ]);
  });
});
