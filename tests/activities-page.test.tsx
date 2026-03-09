// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActivitiesPage } from "../components/dashboard/activities-page";
import { useActivitiesStore } from "../lib/stores/activities-store";
import { useStatsStore } from "../lib/stores/stats-store";
import type { Member, RegularActivity } from "../lib/types/domain";

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

vi.mock("../app/actions", () => ({
  deleteRegularActivityAction: vi.fn(),
}));

const members: Member[] = [
  { id: "m1", name: "Ari", gender: "female", isManager: false, archivedAt: null },
  { id: "m2", name: "Ben", gender: "male", isManager: true, archivedAt: null },
];

const activities: RegularActivity[] = [
  {
    id: "activity-1",
    activityDate: "2026-03-14",
    area: "Gangnam",
    participantMemberIds: ["m1", "m2"],
    groupConfig: {
      targetGroupCount: 1,
    },
    groups: [
      {
        groupNumber: 1,
        memberIds: ["m1", "m2"],
      },
    ],
    groupGeneratedAt: "2026-03-10T10:00:00.000Z",
    activityName: "2026-03-14 Gangnam",
  },
];

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("activities page", () => {
  beforeEach(() => {
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
  });

  it("opens the new activity form from the list page", async () => {
    const user = userEvent.setup();

    render(
      <ActivitiesPage initialActivities={activities} initialMembers={members} />,
    );

    await user.click(screen.getByRole("button", { name: "Add activity" }));

    expect(pushMock).toHaveBeenCalledWith("/dashboard/activities/new");
  });

  it("navigates to the activity edit route from the activity list", async () => {
    const user = userEvent.setup();

    render(
      <ActivitiesPage initialActivities={activities} initialMembers={members} />,
    );

    await waitFor(() => {
      expect(screen.getByText("2026-03-14 Gangnam")).toBeTruthy();
    });

    await user.click(
      screen.getByRole("button", { name: /2026-03-14 gangnam/i }),
    );
    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(pushMock).toHaveBeenCalledWith(
      "/dashboard/activities/activity-1/edit",
    );
  });
});
