import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getActivityFormSnapshot,
  getMemberParticipationHistorySnapshot,
} from "../lib/dashboard-data";

const mocks = vi.hoisted(() => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined),
  listMembers: vi.fn(),
  getRegularActivity: vi.fn(),
  listRegularActivities: vi.fn(),
  getMemberParticipationStats: vi.fn(),
}));

vi.mock("../lib/mongodb", () => ({
  connectToDatabase: mocks.connectToDatabase,
}));

vi.mock("../lib/services/members", () => ({
  listMembers: mocks.listMembers,
}));

vi.mock("../lib/services/regular-activities", () => ({
  getRegularActivity: mocks.getRegularActivity,
  listRegularActivities: mocks.listRegularActivities,
}));

vi.mock("../lib/services/member-stats", () => ({
  getMemberParticipationStats: mocks.getMemberParticipationStats,
}));

describe("dashboard data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses only active members when opening a fresh builder draft", async () => {
    mocks.listMembers.mockResolvedValue([
      {
        id: "m1",
        name: "Ari",
        gender: "female",
        isManager: false,
        archivedAt: null,
      },
    ]);

    const snapshot = await getActivityFormSnapshot();

    expect(mocks.listMembers).toHaveBeenCalledWith("active");
    expect(snapshot.editingActivity).toBeNull();
    expect(snapshot.members).toHaveLength(1);
  });

  it("keeps archived referenced members when editing an activity", async () => {
    mocks.listMembers.mockResolvedValue([
      {
        id: "m1",
        name: "Ari",
        gender: "female",
        isManager: false,
        archivedAt: null,
      },
      {
        id: "m2",
        name: "Ben",
        gender: "male",
        isManager: false,
        archivedAt: "2026-03-09T00:00:00.000Z",
      },
      {
        id: "m3",
        name: "Coco",
        gender: "female",
        isManager: false,
        archivedAt: "2026-03-08T00:00:00.000Z",
      },
    ]);
    mocks.getRegularActivity.mockResolvedValue({
      id: "activity-1",
      activityDate: "2026-03-14",
      area: "Gangnam",
      participantMemberIds: ["m1", "m2"],
      groupConfig: {
        targetGroupCount: 2,
      },
      groups: [],
      groupGeneratedAt: null,
      activityName: "2026-03-14 Gangnam",
    });

    const snapshot = await getActivityFormSnapshot("activity-1");

    expect(mocks.listMembers).toHaveBeenCalledWith("all");
    expect(snapshot.members.map((member) => member.id)).toEqual(["m1", "m2"]);
  });

  it("returns the selected member and only their participated activities", async () => {
    mocks.listMembers.mockResolvedValue([
      {
        id: "m1",
        name: "Ari",
        gender: "female",
        isManager: false,
        archivedAt: null,
      },
      {
        id: "m2",
        name: "Ben",
        gender: "male",
        isManager: true,
        archivedAt: null,
      },
    ]);
    mocks.listRegularActivities.mockResolvedValue([
      {
        id: "activity-1",
        activityDate: "2026-03-14",
        area: "Gangnam",
        participantMemberIds: ["m1", "m2"],
        groupConfig: {
          targetGroupCount: 2,
        },
        groups: [],
        groupGeneratedAt: null,
        activityName: "2026-03-14 Gangnam",
      },
      {
        id: "activity-2",
        activityDate: "2026-03-21",
        area: "Mapo",
        participantMemberIds: ["m2"],
        groupConfig: {
          targetGroupCount: 1,
        },
        groups: [],
        groupGeneratedAt: null,
        activityName: "2026-03-21 Mapo",
      },
    ]);

    const snapshot = await getMemberParticipationHistorySnapshot("m1");

    expect(mocks.listMembers).toHaveBeenCalledWith("all");
    expect(mocks.listRegularActivities).toHaveBeenCalledTimes(1);
    expect(snapshot.member?.id).toBe("m1");
    expect(snapshot.activities.map((activity) => activity.id)).toEqual([
      "activity-1",
    ]);
  });

  it("returns null when the selected member does not exist", async () => {
    mocks.listMembers.mockResolvedValue([]);
    mocks.listRegularActivities.mockResolvedValue([]);

    const snapshot = await getMemberParticipationHistorySnapshot("missing");

    expect(snapshot.member).toBeNull();
    expect(snapshot.activities).toEqual([]);
  });
});
