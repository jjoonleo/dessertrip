// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MembersPage } from "../components/dashboard/members-page";
import { useMembersStore } from "../lib/stores/members-store";
import { useStatsStore } from "../lib/stores/stats-store";
import type { Member, MemberParticipationStat } from "../lib/types/domain";
import { renderWithLocale } from "./test-utils";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  createMemberAction: vi.fn(),
  updateMemberAction: vi.fn(),
  archiveMemberAction: vi.fn(),
  restoreMemberAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mocks.refresh,
  }),
}));

vi.mock("../app/actions", () => ({
  createMemberAction: mocks.createMemberAction,
  updateMemberAction: mocks.updateMemberAction,
  archiveMemberAction: mocks.archiveMemberAction,
  restoreMemberAction: mocks.restoreMemberAction,
}));

const activeMember: Member = {
  id: "m1",
  name: "Ari",
  gender: "female",
  isManager: false,
  archivedAt: null,
};

const archivedMember: Member = {
  id: "m2",
  name: "Ben",
  gender: "male",
  isManager: true,
  archivedAt: "2026-03-09T00:00:00.000Z",
};

function makeStats(member: Member, participationScore: number): MemberParticipationStat {
  return {
    ...member,
    participationScore,
    monthlyParticipationScores: {},
  };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("members page", () => {
  beforeEach(() => {
    useMembersStore.setState({
      members: [],
      search: "",
      genderFilter: "all",
      managerFilter: "all",
      archiveFilter: "active",
      isCreateModalOpen: false,
      draft: {
        name: "",
        gender: "female",
        isManager: false,
      },
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

  it("opens the add-user modal, creates a member, and closes on success", async () => {
    const user = userEvent.setup();
    const createdMember = {
      id: "m3",
      name: "Coco",
      gender: "female" as const,
      isManager: true,
      archivedAt: null,
    };

    mocks.createMemberAction.mockResolvedValue({
      ok: true,
      data: createdMember,
    });

    renderWithLocale(<MembersPage initialMembers={[activeMember]} />, "en");

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByLabelText("Name")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Add user" }));

    const dialog = screen.getByRole("dialog");
    await user.type(within(dialog).getByLabelText("Name"), "Coco");
    await user.click(within(dialog).getByLabelText("This member is also a club manager"));
    await user.click(within(dialog).getByRole("button", { name: "Add user" }));

    expect(mocks.createMemberAction).toHaveBeenCalledWith({
      name: "Coco",
      gender: "female",
      isManager: true,
    });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    expect(screen.getByText("Coco")).toBeTruthy();
  });

  it("keeps the add-user modal open on error and resets it when closed", async () => {
    const user = userEvent.setup();

    mocks.createMemberAction.mockResolvedValue({
      ok: false,
      error: "Name is required.",
    });

    renderWithLocale(<MembersPage initialMembers={[activeMember]} />, "en");

    await user.click(screen.getByRole("button", { name: "Add user" }));

    let dialog = screen.getByRole("dialog");
    const nameInput = within(dialog).getByLabelText("Name");
    await user.type(nameInput, "Kai");
    await user.click(within(dialog).getByRole("button", { name: "Add user" }));

    await waitFor(() => {
      expect(screen.getByText("Name is required.")).toBeTruthy();
    });

    expect(screen.getByRole("dialog")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Close add user modal" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    await user.click(screen.getByRole("button", { name: "Add user" }));
    dialog = screen.getByRole("dialog");
    expect(
      (within(dialog).getByLabelText("Name") as HTMLInputElement).value,
    ).toBe("");
  });

  it("opens the edit modal and saves member changes", async () => {
    const user = userEvent.setup();

    mocks.updateMemberAction.mockResolvedValue({
      ok: true,
      data: {
        member: {
          ...activeMember,
          name: "Ari Kim",
        },
        stats: [makeStats({ ...activeMember, name: "Ari Kim" }, 2)],
      },
    });

    renderWithLocale(<MembersPage initialMembers={[activeMember]} />, "en");

    await user.click(screen.getByRole("button", { name: "Edit" }));

    const dialog = screen.getByRole("dialog");
    const nameInput = within(dialog).getByLabelText("Name");

    await user.clear(nameInput);
    await user.type(nameInput, "Ari Kim");
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));

    expect(mocks.updateMemberAction).toHaveBeenCalledWith("m1", {
      name: "Ari Kim",
      gender: "female",
      isManager: false,
    });

    await waitFor(() => {
      expect(screen.getByText("Ari Kim")).toBeTruthy();
    });
  });

  it("archives a member, hides them from the active filter, and restores them", async () => {
    const user = userEvent.setup();
    const archivedAri = {
      ...activeMember,
      archivedAt: "2026-03-10T00:00:00.000Z",
    };

    mocks.archiveMemberAction.mockResolvedValue({
      ok: true,
      data: {
        member: archivedAri,
        stats: [makeStats(archivedAri, 3), makeStats(archivedMember, 5)],
      },
    });
    mocks.restoreMemberAction.mockResolvedValue({
      ok: true,
      data: {
        member: activeMember,
        stats: [makeStats(activeMember, 3), makeStats(archivedMember, 5)],
      },
    });

    renderWithLocale(
      <MembersPage initialMembers={[activeMember, archivedMember]} />,
      "en",
    );

    expect(screen.queryByText("Ben")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Archive" }));

    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: /^Archive$/ }));

    await waitFor(() => {
      expect(mocks.archiveMemberAction).toHaveBeenCalledWith("m1");
    });

    await waitFor(() => {
      expect(screen.queryByText("Ari")).toBeNull();
    });

    await user.selectOptions(screen.getByDisplayValue("Active only"), "archived");

    await waitFor(() => {
      expect(screen.getByText("Ari")).toBeTruthy();
    });

    const ariCard = screen.getByText("Ari").closest(".card");
    expect(ariCard).not.toBeNull();

    await user.click(within(ariCard as HTMLElement).getByRole("button", { name: "Restore" }));

    await waitFor(() => {
      expect(mocks.restoreMemberAction).toHaveBeenCalledWith("m1");
    });

    await waitFor(() => {
      expect(screen.queryByText("Ari")).toBeNull();
    });

    await user.selectOptions(screen.getByDisplayValue("Archived only"), "active");

    await waitFor(() => {
      expect(screen.getByText("Ari")).toBeTruthy();
    });
  });
});
