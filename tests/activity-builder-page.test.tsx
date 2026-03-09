// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import { ActivityBuilderPage } from "../components/dashboard/activity-builder-page";
import { useActivitiesStore } from "../lib/stores/activities-store";
import { useActivityBuilderStore } from "../lib/stores/activity-builder-store";
import { useMembersStore } from "../lib/stores/members-store";
import { useStatsStore } from "../lib/stores/stats-store";
import type { Member, RegularActivity } from "../lib/types/domain";

const refreshMock = vi.fn();
const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
    replace: replaceMock,
  }),
}));

vi.mock("../app/actions", () => ({
  createRegularActivityAction: vi.fn(),
  updateRegularActivityAction: vi.fn(),
}));

const members: Member[] = [
  { id: "m1", name: "Ari", gender: "female", isManager: false, archivedAt: null },
  {
    id: "m2",
    name: "Ben",
    gender: "male",
    isManager: true,
    archivedAt: "2026-03-09T00:00:00.000Z",
  },
];

const activity: RegularActivity = {
  id: "activity-1",
  activityDate: "2026-03-14",
  area: "Gangnam",
  participantMemberIds: ["m1", "m2"],
  groupConfig: {
    targetGroupSize: 2,
  },
  groups: [
    {
      groupNumber: 1,
      memberIds: ["m1", "m2"],
    },
  ],
  groupGeneratedAt: "2026-03-10T10:00:00.000Z",
  activityName: "2026-03-14 Gangnam",
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("activity builder page", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    useMembersStore.setState({
      members: [],
      search: "",
      genderFilter: "all",
      managerFilter: "all",
      draft: {
        name: "",
        gender: "female",
        isManager: false,
      },
      archiveFilter: "active",
      editMemberId: null,
      editDraft: {
        name: "",
        gender: "female",
        isManager: false,
      },
      archiveConfirmMemberId: null,
      pending: false,
      error: null,
    });
    useActivitiesStore.setState({
      activities: [],
      search: "",
      selectedActivityId: null,
      pendingDeleteId: null,
      pending: false,
      error: null,
    });
    useStatsStore.setState({
      stats: [],
      search: "",
      genderFilter: "all",
      archiveFilter: "active",
      sortKey: "participationCount",
      sortDirection: "desc",
    });
    useActivityBuilderStore.getState().resetDraft();
  });

  it("hydrates the persisted draft store from an edit-route activity", async () => {
    render(
      <ActivityBuilderPage editingActivity={activity} initialMembers={members} />,
    );

    await waitFor(() => {
      expect(useActivityBuilderStore.getState().editingActivityId).toBe("activity-1");
    });

    expect(useActivityBuilderStore.getState().activityDate).toBe("2026-03-14");
    expect(useActivityBuilderStore.getState().participantMemberIds).toEqual([
      "m1",
      "m2",
    ]);
    expect(useMembersStore.getState().members).toHaveLength(2);
    expect(
      useMembersStore.getState().members.find((member) => member.id === "m2")
        ?.archivedAt,
    ).toBe("2026-03-09T00:00:00.000Z");
  });
});
