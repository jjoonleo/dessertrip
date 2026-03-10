// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActivitiesPage } from "../components/dashboard/activities-page";
import { useActivitiesStore } from "../lib/stores/activities-store";
import { useStatsStore } from "../lib/stores/stats-store";
import type { Activity, Member } from "../lib/types/domain";
import { renderWithLocale } from "./test-utils";

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

vi.mock("../app/actions", () => ({
  deleteActivityAction: vi.fn(),
}));

const members: Member[] = [
  { id: "m1", name: "Ari", gender: "female", isManager: false, archivedAt: null },
  { id: "m2", name: "Ben", gender: "male", isManager: true, archivedAt: null },
];

const activities: Activity[] = [
  {
    id: "activity-1",
    activityType: "regular",
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
    participationWeight: 1,
  },
  {
    id: "activity-2",
    activityType: "flash",
    activityDate: "2026-03-18",
    area: "Mapo",
    participantMemberIds: ["m1", "m2"],
    groupConfig: null,
    groups: [],
    groupGeneratedAt: null,
    activityName: "2026-03-18 Mapo",
    participationWeight: 0.5,
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
      sortKey: "participationScore",
      sortDirection: "desc",
    });
  });

  it("opens the new activity form from the list page", async () => {
    const user = userEvent.setup();

    renderWithLocale(
      <ActivitiesPage initialActivities={activities} initialMembers={members} />,
      "en",
    );

    await user.click(screen.getByRole("button", { name: "Add activity" }));

    expect(pushMock).toHaveBeenCalledWith("/dashboard/activities/new");
  });

  it("navigates to the activity edit route from the activity list", async () => {
    const user = userEvent.setup();

    renderWithLocale(
      <ActivitiesPage initialActivities={activities} initialMembers={members} />,
      "en",
    );

    await waitFor(() => {
      expect(screen.getByText("2026-03-14 Gangnam")).toBeTruthy();
    });

    const activityTrigger = screen.getByRole("button", {
      name: /2026-03-14 gangnam/i,
    });
    const activityPanel = activityTrigger.closest(".collapse");

    expect(activityPanel).toBeTruthy();

    await user.click(activityTrigger);
    await user.click(within(activityPanel as HTMLElement).getByRole("button", { name: "Edit" }));

    expect(pushMock).toHaveBeenCalledWith(
      "/dashboard/activities/activity-1/edit",
    );
  });

  it("shows participant tiles when expanding a flash activity", async () => {
    const user = userEvent.setup();

    renderWithLocale(
      <ActivitiesPage initialActivities={activities} initialMembers={members} />,
      "en",
    );

    const activityTrigger = screen.getByRole("button", {
      name: /2026-03-18 mapo/i,
    });
    const activityPanel = activityTrigger.closest(".collapse");

    expect(activityPanel).toBeTruthy();

    await user.click(activityTrigger);

    expect(within(activityPanel as HTMLElement).getByText("Participants")).toBeTruthy();
    expect(within(activityPanel as HTMLElement).getByText("Ari")).toBeTruthy();
    expect(within(activityPanel as HTMLElement).getByText("Ben")).toBeTruthy();
  });
});
