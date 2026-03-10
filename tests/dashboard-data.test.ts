import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getActivityFormSnapshot,
  getMemberParticipationHistorySnapshot,
} from "../lib/dashboard-data";

const mocks = vi.hoisted(() => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined),
  listMembers: vi.fn(),
  getActivity: vi.fn(),
  listActivities: vi.fn(),
  getMemberParticipationStats: vi.fn(),
}));

vi.mock("../lib/mongodb", () => ({
  connectToDatabase: mocks.connectToDatabase,
}));

vi.mock("../lib/services/members", () => ({
  listMembers: mocks.listMembers,
}));

vi.mock("../lib/services/activities", () => ({
  getActivity: mocks.getActivity,
  listActivities: mocks.listActivities,
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
    mocks.getActivity.mockResolvedValue({
      id: "activity-1",
      activityType: "regular",
      activityDate: "2026-03-14",
      area: "Gangnam",
      participantMemberIds: ["m1", "m2"],
      groupConfig: {
        targetGroupCount: 2,
      },
      groups: [],
      groupGeneratedAt: null,
      activityName: "2026-03-14 Gangnam",
      participationWeight: 1,
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
    mocks.listActivities.mockResolvedValue([
      {
        id: "activity-1",
        activityType: "regular",
        activityDate: "2026-03-14",
        area: "Gangnam",
        participantMemberIds: ["m1", "m2"],
        groupConfig: {
          targetGroupCount: 2,
        },
        groups: [],
        groupGeneratedAt: null,
        activityName: "2026-03-14 Gangnam",
        participationWeight: 1,
      },
      {
        id: "activity-2",
        activityType: "flash",
        activityDate: "2026-03-21",
        area: "Mapo",
        participantMemberIds: ["m2"],
        groupConfig: null,
        groups: [],
        groupGeneratedAt: null,
        activityName: "2026-03-21 Mapo",
        participationWeight: 0.5,
      },
      {
        id: "activity-3",
        activityType: "regular",
        activityDate: "2026-04-11",
        area: "Jamsil",
        participantMemberIds: ["m1"],
        groupConfig: {
          targetGroupCount: 1,
        },
        groups: [],
        groupGeneratedAt: null,
        activityName: "2026-04-11 Jamsil",
        participationWeight: 1,
      },
    ]);

    const snapshot = await getMemberParticipationHistorySnapshot("m1");

    expect(mocks.listMembers).toHaveBeenCalledWith("all");
    expect(mocks.listActivities).toHaveBeenCalledTimes(1);
    expect(snapshot.member?.id).toBe("m1");
    expect(snapshot.activities.map((activity) => activity.id)).toEqual([
      "activity-1",
      "activity-3",
    ]);
  });

  it("filters member participation history by the selected month", async () => {
    mocks.listMembers.mockResolvedValue([
      {
        id: "m1",
        name: "Ari",
        gender: "female",
        isManager: false,
        archivedAt: null,
      },
    ]);
    mocks.listActivities.mockResolvedValue([
      {
        id: "activity-1",
        activityType: "regular",
        activityDate: "2026-03-14",
        area: "Gangnam",
        participantMemberIds: ["m1"],
        groupConfig: {
          targetGroupCount: 1,
        },
        groups: [],
        groupGeneratedAt: null,
        activityName: "2026-03-14 Gangnam",
        participationWeight: 1,
      },
      {
        id: "activity-2",
        activityType: "flash",
        activityDate: "2026-04-18",
        area: "Mapo",
        participantMemberIds: ["m1"],
        groupConfig: null,
        groups: [],
        groupGeneratedAt: null,
        activityName: "2026-04-18 Mapo",
        participationWeight: 0.5,
      },
    ]);

    const snapshot = await getMemberParticipationHistorySnapshot("m1", "2026-04");

    expect(snapshot.activities.map((activity) => activity.id)).toEqual([
      "activity-2",
    ]);
  });

  it("returns null when the selected member does not exist", async () => {
    mocks.listMembers.mockResolvedValue([]);
    mocks.listActivities.mockResolvedValue([]);

    const snapshot = await getMemberParticipationHistorySnapshot("missing");

    expect(snapshot.member).toBeNull();
    expect(snapshot.activities).toEqual([]);
  });
});
