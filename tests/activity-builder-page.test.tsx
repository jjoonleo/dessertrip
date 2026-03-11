// @vitest-environment jsdom

import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  AutoScrollActivator,
  MouseSensor,
  TouchSensor,
  TraversalOrder,
  useSensor,
} from "@dnd-kit/core";
import { updateActivityAction } from "../app/actions";
import { ActivityBuilderPage } from "../components/dashboard/activity-builder-page";
import { useActivitiesStore } from "../lib/stores/activities-store";
import { useActivityBuilderStore } from "../lib/stores/activity-builder-store";
import { useMembersStore } from "../lib/stores/members-store";
import { useStatsStore } from "../lib/stores/stats-store";
import type { Activity, Member } from "../lib/types/domain";
import { renderWithLocale } from "./test-utils";

const refreshMock = vi.fn();
const pushMock = vi.fn();
const replaceMock = vi.fn();
const dndCoreMocks = vi.hoisted(() => ({
  lastDndContextProps: null as Record<string, unknown> | null,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
    replace: replaceMock,
  }),
}));

vi.mock("../app/actions", () => ({
  createActivityAction: vi.fn(),
  updateActivityAction: vi.fn(),
}));

vi.mock("@dnd-kit/core", async () => {
  const actual = await vi.importActual<typeof import("@dnd-kit/core")>(
    "@dnd-kit/core",
  );

  return {
    ...actual,
    DndContext: (props: Record<string, unknown>) => {
      dndCoreMocks.lastDndContextProps = props;
      return createElement(actual.DndContext, props);
    },
    useSensor: vi.fn(actual.useSensor),
  };
});

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

const activity: Activity = {
  id: "activity-1",
  activityType: "regular",
  activityDate: "2026-03-14",
  area: "Gangnam",
  participantMemberIds: ["m1", "m2"],
  groupConfig: {
    targetGroupCount: 2,
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
};

const groupedActivity: Activity = {
  ...activity,
  groups: [
    {
      groupNumber: 1,
      memberIds: ["m1"],
    },
    {
      groupNumber: 2,
      memberIds: ["m2"],
    },
  ],
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("activity builder page", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.mocked(useSensor).mockClear();
    dndCoreMocks.lastDndContextProps = null;
    useMembersStore.setState({
      members: [],
      search: "",
      genderFilter: "all",
      managerFilter: "all",
      isCreateModalOpen: false,
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
      selectedPeriod: "2026-03",
      sortKey: "participationScore",
      sortDirection: "desc",
    });
    useActivityBuilderStore.getState().resetDraft();
  });

  it("hydrates the persisted draft store from an edit-route activity", async () => {
    renderWithLocale(
      <ActivityBuilderPage editingActivity={activity} initialMembers={members} />,
      "en",
    );

    await waitFor(() => {
      expect(useActivityBuilderStore.getState().editingActivityId).toBe("activity-1");
    });

    expect(useActivityBuilderStore.getState().activityDate).toBe("2026-03-14");
    expect(useActivityBuilderStore.getState().participantMemberIds).toEqual([
      "m1",
      "m2",
    ]);
    expect(useActivityBuilderStore.getState().targetGroupCount).toBe(2);
    expect(useMembersStore.getState().members).toHaveLength(2);
    expect(
      useMembersStore.getState().members.find((member) => member.id === "m2")
        ?.archivedAt,
    ).toBe("2026-03-09T00:00:00.000Z");
    expect(vi.mocked(useSensor)).toHaveBeenCalledWith(MouseSensor);
    expect(vi.mocked(useSensor)).toHaveBeenCalledWith(TouchSensor, {
      activationConstraint: {
        delay: 180,
        tolerance: 8,
      },
    });
    expect(dndCoreMocks.lastDndContextProps).not.toBeNull();
    expect(dndCoreMocks.lastDndContextProps?.autoScroll).toMatchObject({
      enabled: true,
      activator: AutoScrollActivator.Pointer,
      threshold: {
        y: 0.24,
        x: 0.08,
      },
      acceleration: 12,
      interval: 5,
      order: TraversalOrder.TreeOrder,
      canScroll: expect.any(Function),
    });

    const canScroll = (
      dndCoreMocks.lastDndContextProps?.autoScroll as {
        canScroll?: (element: Element) => boolean;
      }
    ).canScroll;

    expect(canScroll?.(document.documentElement)).toBe(true);
    expect(canScroll?.(document.body)).toBe(true);
    expect(canScroll?.(document.createElement("div"))).toBe(false);
  });

  it("hides grouping controls for flash meetings", async () => {
    const flashActivity: Activity = {
      ...activity,
      groupConfig: null,
      activityType: "flash" as const,
      groups: [],
      groupGeneratedAt: null,
      participationWeight: 0.5,
    };

    renderWithLocale(
      <ActivityBuilderPage
        editingActivity={flashActivity}
        initialMembers={members}
      />,
      "en",
    );

    await waitFor(() => {
      expect(useActivityBuilderStore.getState().activityType).toBe("flash");
    });

    expect(screen.getByDisplayValue("Flash")).toBeTruthy();
    expect(screen.queryByDisplayValue("2")).toBeNull();
  });

  it("shows regenerate copy and an unassigned tray after adding members to existing groups", async () => {
    const user = userEvent.setup();
    const expandedMembers: Member[] = [
      ...members,
      { id: "m3", name: "Coco", gender: "female", isManager: false, archivedAt: null },
    ];

    renderWithLocale(
      <ActivityBuilderPage
        editingActivity={groupedActivity}
        initialMembers={expandedMembers}
      />,
      "en",
    );

    await waitFor(() => {
      expect(useActivityBuilderStore.getState().editingActivityId).toBe("activity-1");
    });

    expect(
      screen.getByRole("button", { name: "Regenerate groups" }),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "Randomly reshuffle every selected member, including newly added ones.",
      ),
    ).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Select members" }));
    const memberPicker = screen.getByRole("dialog");
    await user.click(within(memberPicker).getByRole("button", { name: /Coco/ }));
    await user.click(within(memberPicker).getByRole("button", { name: "Confirm members" }));

    expect(screen.getByText("Unassigned members")).toBeTruthy();
    expect(
      screen.getByText(
        "Newly added members stay here until you drag them into a group or regenerate all groups.",
      ),
    ).toBeTruthy();
    expect(useActivityBuilderStore.getState().generatedGroups).toEqual([
      { groupNumber: 1, memberIds: ["m1"] },
      { groupNumber: 2, memberIds: ["m2"] },
    ]);
  });

  it("blocks saving while added members are still unassigned", async () => {
    const user = userEvent.setup();
    const expandedMembers: Member[] = [
      ...members,
      { id: "m3", name: "Coco", gender: "female", isManager: false, archivedAt: null },
    ];

    renderWithLocale(
      <ActivityBuilderPage
        editingActivity={groupedActivity}
        initialMembers={expandedMembers}
      />,
      "en",
    );

    await waitFor(() => {
      expect(useActivityBuilderStore.getState().editingActivityId).toBe("activity-1");
    });

    await user.click(screen.getByRole("button", { name: "Select members" }));
    const memberPicker = screen.getByRole("dialog");
    await user.click(within(memberPicker).getByRole("button", { name: /Coco/ }));
    await user.click(within(memberPicker).getByRole("button", { name: "Confirm members" }));
    await user.click(screen.getByRole("button", { name: "Update activity" }));

    expect(vi.mocked(updateActivityAction)).not.toHaveBeenCalled();
    expect(
      screen.getByText("Saved groups must include every selected participant exactly once."),
    ).toBeTruthy();
  });

  it("blocks saving while any preserved group is empty", async () => {
    const user = userEvent.setup();
    const expandedMembers: Member[] = [
      ...members,
      { id: "m3", name: "Coco", gender: "female", isManager: false, archivedAt: null },
    ];
    const activityWithThreeMembers: Activity = {
      ...groupedActivity,
      participantMemberIds: ["m1", "m2", "m3"],
      groups: [
        { groupNumber: 1, memberIds: ["m1", "m3"] },
        { groupNumber: 2, memberIds: ["m2"] },
      ],
    };

    renderWithLocale(
      <ActivityBuilderPage
        editingActivity={activityWithThreeMembers}
        initialMembers={expandedMembers}
      />,
      "en",
    );

    await waitFor(() => {
      expect(useActivityBuilderStore.getState().editingActivityId).toBe("activity-1");
    });

    await user.click(screen.getByRole("button", { name: "Select members" }));
    const memberPicker = screen.getByRole("dialog");
    await user.click(within(memberPicker).getByRole("button", { name: /Ben/ }));
    await user.click(within(memberPicker).getByRole("button", { name: "Confirm members" }));
    await user.click(screen.getByRole("button", { name: "Update activity" }));

    expect(vi.mocked(updateActivityAction)).not.toHaveBeenCalled();
    expect(screen.getByText("Each group must contain at least one member.")).toBeTruthy();
  });
});
