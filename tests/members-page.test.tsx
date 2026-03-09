// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MembersPage } from "../components/dashboard/members-page";
import { useMembersStore } from "../lib/stores/members-store";
import { useStatsStore } from "../lib/stores/stats-store";
import type { Member, MemberParticipationStat } from "../lib/types/domain";

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

function makeStats(member: Member, participationCount: number): MemberParticipationStat {
  return {
    ...member,
    participationCount,
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
      sortKey: "participationCount",
      sortDirection: "desc",
    });
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

    render(<MembersPage initialMembers={[activeMember]} />);

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

    render(<MembersPage initialMembers={[activeMember, archivedMember]} />);

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
