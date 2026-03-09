import { beforeEach, describe, expect, it, vi } from "vitest";
import { getActivityBuilderSnapshot } from "../lib/dashboard-data";

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

    const snapshot = await getActivityBuilderSnapshot();

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
        targetGroupSize: 2,
      },
      groups: [],
      groupGeneratedAt: null,
      activityName: "2026-03-14 Gangnam",
    });

    const snapshot = await getActivityBuilderSnapshot("activity-1");

    expect(mocks.listMembers).toHaveBeenCalledWith("all");
    expect(snapshot.members.map((member) => member.id)).toEqual(["m1", "m2"]);
  });
});
