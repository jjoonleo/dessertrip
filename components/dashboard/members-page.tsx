"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import {
  archiveMemberAction,
  createMemberAction,
  restoreMemberAction,
  updateMemberAction,
} from "../../app/actions";
import { useMembersStore, selectVisibleMembers } from "../../lib/stores/members-store";
import { useStatsStore } from "../../lib/stores/stats-store";
import type { Member } from "../../lib/types/domain";
import { SectionHeader } from "./section-header";

type MembersPageProps = {
  initialMembers: Member[];
};

export function MembersPage({ initialMembers }: MembersPageProps) {
  const router = useRouter();

  const memberDraft = useMembersStore((state) => state.draft);
  const memberPending = useMembersStore((state) => state.pending);
  const memberError = useMembersStore((state) => state.error);
  const members = useMembersStore((state) => state.members);
  const memberSearch = useMembersStore((state) => state.search);
  const memberGenderFilter = useMembersStore((state) => state.genderFilter);
  const memberRoleFilter = useMembersStore((state) => state.managerFilter);
  const memberArchiveFilter = useMembersStore((state) => state.archiveFilter);
  const isCreateModalOpen = useMembersStore((state) => state.isCreateModalOpen);
  const editMemberId = useMembersStore((state) => state.editMemberId);
  const editDraft = useMembersStore((state) => state.editDraft);
  const archiveConfirmMemberId = useMembersStore(
    (state) => state.archiveConfirmMemberId,
  );
  const hydrateMembers = useMembersStore((state) => state.hydrate);
  const setMemberSearch = useMembersStore((state) => state.setSearch);
  const setMemberGenderFilter = useMembersStore((state) => state.setGenderFilter);
  const setMemberRoleFilter = useMembersStore((state) => state.setManagerFilter);
  const setMemberArchiveFilter = useMembersStore((state) => state.setArchiveFilter);
  const openCreateModal = useMembersStore((state) => state.openCreateModal);
  const closeCreateModal = useMembersStore((state) => state.closeCreateModal);
  const setDraftName = useMembersStore((state) => state.setDraftName);
  const setDraftGender = useMembersStore((state) => state.setDraftGender);
  const setDraftManager = useMembersStore((state) => state.setDraftManager);
  const openEditModal = useMembersStore((state) => state.openEditModal);
  const closeEditModal = useMembersStore((state) => state.closeEditModal);
  const setEditDraftName = useMembersStore((state) => state.setEditDraftName);
  const setEditDraftGender = useMembersStore((state) => state.setEditDraftGender);
  const setEditDraftManager = useMembersStore((state) => state.setEditDraftManager);
  const openArchiveConfirm = useMembersStore((state) => state.openArchiveConfirm);
  const closeArchiveConfirm = useMembersStore((state) => state.closeArchiveConfirm);
  const upsertMember = useMembersStore((state) => state.upsertMember);
  const setMemberPending = useMembersStore((state) => state.setPending);
  const setMemberError = useMembersStore((state) => state.setError);
  const visibleMembers = useMembersStore(useShallow(selectVisibleMembers));

  const upsertMemberStat = useStatsStore((state) => state.upsertMemberStat);
  const hydrateStats = useStatsStore((state) => state.hydrate);

  useEffect(() => {
    hydrateMembers(initialMembers);
  }, [hydrateMembers, initialMembers]);

  async function handleCreateMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMemberPending(true);
    setMemberError(null);

    const result = await createMemberAction(memberDraft);

    if (!result.ok) {
      setMemberPending(false);
      setMemberError(result.error);
      return;
    }

    upsertMember(result.data);
    upsertMemberStat({
      ...result.data,
      participationCount: 0,
    });
    closeCreateModal();
    router.refresh();
  }

  async function handleSaveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editMemberId) {
      return;
    }

    setMemberPending(true);
    setMemberError(null);

    const result = await updateMemberAction(editMemberId, editDraft);

    if (!result.ok) {
      setMemberPending(false);
      setMemberError(result.error);
      return;
    }

    upsertMember(result.data.member);
    hydrateStats(result.data.stats);
    closeEditModal();
    router.refresh();
  }

  async function handleArchiveMember() {
    if (!archiveConfirmMemberId) {
      return;
    }

    setMemberPending(true);
    setMemberError(null);

    const result = await archiveMemberAction(archiveConfirmMemberId);

    if (!result.ok) {
      setMemberPending(false);
      setMemberError(result.error);
      return;
    }

    upsertMember(result.data.member);
    hydrateStats(result.data.stats);
    closeArchiveConfirm();
    router.refresh();
  }

  async function handleRestoreMember(memberId: string) {
    setMemberPending(true);
    setMemberError(null);

    const result = await restoreMemberAction(memberId);

    if (!result.ok) {
      setMemberPending(false);
      setMemberError(result.error);
      return;
    }

    upsertMember(result.data.member);
    hydrateStats(result.data.stats);
    router.refresh();
  }

  const activeCount = members.filter((member) => member.archivedAt === null).length;
  const archivedCount = members.length - activeCount;
  const editingMember =
    members.find((member) => member.id === editMemberId) ?? null;
  const archiveCandidate =
    members.find((member) => member.id === archiveConfirmMemberId) ?? null;

  return (
    <div className="space-y-6">
      <SectionHeader
        badge="Members"
        description="Managers can add, edit, archive, and restore members here. Archived members stay in historical records but are hidden from the active roster by default."
        title="Member management"
      />

      <div className="stats stats-vertical w-full border border-base-300 bg-base-100 shadow-sm lg:stats-horizontal">
        <div className="stat">
          <div className="stat-title">All members</div>
          <div className="stat-value text-primary">{members.length}</div>
          <div className="stat-desc">Including archived members</div>
        </div>
        <div className="stat">
          <div className="stat-title">Active members</div>
          <div className="stat-value text-secondary">{activeCount}</div>
          <div className="stat-desc">Selectable for new activities</div>
        </div>
        <div className="stat">
          <div className="stat-title">Archived</div>
          <div className="stat-value text-accent">{archivedCount}</div>
          <div className="stat-desc">Restorable from this page</div>
        </div>
      </div>

      <section className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body gap-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Roster</h3>
              <p className="text-sm text-base-content/70">
                Showing {visibleMembers.length} of {members.length} members with the
                current filters.
              </p>
            </div>

            <button
              className="btn btn-primary"
              onClick={openCreateModal}
              type="button"
            >
              Add user
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <input
              className="input input-bordered w-full"
              onChange={(event) => setMemberSearch(event.target.value)}
              placeholder="Search members"
              value={memberSearch}
            />
            <select
              className="select select-bordered w-full"
              onChange={(event) =>
                setMemberGenderFilter(event.target.value as "all" | Member["gender"])
              }
              value={memberGenderFilter}
            >
              <option value="all">All genders</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
            <select
              className="select select-bordered w-full"
              onChange={(event) =>
                setMemberRoleFilter(
                  event.target.value as "all" | "manager" | "member",
                )
              }
              value={memberRoleFilter}
            >
              <option value="all">All roles</option>
              <option value="manager">Managers</option>
              <option value="member">Members</option>
            </select>
            <select
              className="select select-bordered w-full"
              onChange={(event) =>
                setMemberArchiveFilter(
                  event.target.value as "active" | "all" | "archived",
                )
              }
              value={memberArchiveFilter}
            >
              <option value="active">Active only</option>
              <option value="all">All members</option>
              <option value="archived">Archived only</option>
            </select>
          </div>

          {!editingMember && !archiveCandidate && !isCreateModalOpen && memberError ? (
            <div className="alert alert-error">
              <span>{memberError}</span>
            </div>
          ) : null}

          <div className="space-y-3">
            {visibleMembers.length === 0 ? (
              <div className="alert">
                <span>No members match the current filters.</span>
              </div>
            ) : (
              visibleMembers.map((member) => (
                <div
                  key={member.id}
                  className="card border border-base-300 bg-base-200 shadow-sm"
                >
                  <div className="card-body flex-row items-center justify-between gap-4 p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold">{member.name}</h2>
                        {member.isManager ? (
                          <span className="badge badge-secondary">Manager</span>
                        ) : null}
                        {member.archivedAt ? (
                          <span className="badge badge-warning badge-outline">
                            Archived
                          </span>
                        ) : null}
                      </div>
                      <span className="badge badge-outline">{member.gender}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => openEditModal(member)}
                        type="button"
                      >
                        Edit
                      </button>
                      {member.archivedAt ? (
                        <button
                          className="btn btn-sm btn-outline btn-success"
                          disabled={memberPending}
                          onClick={() => handleRestoreMember(member.id)}
                          type="button"
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline btn-warning"
                          onClick={() => openArchiveConfirm(member.id)}
                          type="button"
                        >
                          Archive
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {isCreateModalOpen ? (
        <div className="modal modal-open" role="dialog">
          <div className="modal-box space-y-5">
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Add user</h2>
              <p className="text-sm text-base-content/70">
                Add a new club member to the Dessertrip roster.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleCreateMember}>
              <label className="form-control gap-2">
                <span className="label-text font-medium">Name</span>
                <input
                  className="input input-bordered w-full"
                  disabled={memberPending}
                  onChange={(event) => setDraftName(event.target.value)}
                  placeholder="Member name"
                  value={memberDraft.name}
                />
              </label>

              <label className="form-control gap-2">
                <span className="label-text font-medium">Gender</span>
                <select
                  className="select select-bordered w-full"
                  disabled={memberPending}
                  onChange={(event) =>
                    setDraftGender(event.target.value as Member["gender"])
                  }
                  value={memberDraft.gender}
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </label>

              <label className="label justify-start gap-3 rounded-box border border-base-300 bg-base-200 px-4 py-4">
                <input
                  checked={memberDraft.isManager}
                  className="checkbox checkbox-primary"
                  disabled={memberPending}
                  onChange={(event) => setDraftManager(event.target.checked)}
                  type="checkbox"
                />
                <span className="label-text">
                  This member is also a club manager
                </span>
              </label>

              {memberError ? (
                <div className="alert alert-error">
                  <span>{memberError}</span>
                </div>
              ) : null}

              <div className="modal-action mt-0">
                <button
                  className="btn btn-ghost"
                  disabled={memberPending}
                  onClick={closeCreateModal}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  disabled={memberPending || memberDraft.name.trim().length === 0}
                  type="submit"
                >
                  {memberPending ? "Saving..." : "Add user"}
                </button>
              </div>
            </form>
          </div>
          <button
            aria-label="Close add user modal"
            className="modal-backdrop"
            onClick={closeCreateModal}
            type="button"
          />
        </div>
      ) : null}

      {editingMember ? (
        <div className="modal modal-open" role="dialog">
          <div className="modal-box space-y-5">
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Edit member</h2>
              <p className="text-sm text-base-content/70">
                Update {editingMember.name}&apos;s roster information.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSaveEdit}>
              <label className="form-control gap-2">
                <span className="label-text font-medium">Name</span>
                <input
                  className="input input-bordered w-full"
                  disabled={memberPending}
                  onChange={(event) => setEditDraftName(event.target.value)}
                  value={editDraft.name}
                />
              </label>

              <label className="form-control gap-2">
                <span className="label-text font-medium">Gender</span>
                <select
                  className="select select-bordered w-full"
                  disabled={memberPending}
                  onChange={(event) =>
                    setEditDraftGender(event.target.value as Member["gender"])
                  }
                  value={editDraft.gender}
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </label>

              <label className="label justify-start gap-3 rounded-box border border-base-300 bg-base-200 px-4 py-4">
                <input
                  checked={editDraft.isManager}
                  className="checkbox checkbox-primary"
                  disabled={memberPending}
                  onChange={(event) => setEditDraftManager(event.target.checked)}
                  type="checkbox"
                />
                <span className="label-text">This member is also a club manager</span>
              </label>

              {memberError ? (
                <div className="alert alert-error">
                  <span>{memberError}</span>
                </div>
              ) : null}

              <div className="modal-action mt-0">
                <button
                  className="btn btn-ghost"
                  disabled={memberPending}
                  onClick={closeEditModal}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  disabled={memberPending || editDraft.name.trim().length === 0}
                  type="submit"
                >
                  {memberPending ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
          <button
            aria-label="Close edit member modal"
            className="modal-backdrop"
            onClick={closeEditModal}
            type="button"
          />
        </div>
      ) : null}

      {archiveCandidate ? (
        <div className="modal modal-open" role="dialog">
          <div className="modal-box space-y-5">
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Archive member</h2>
              <p className="text-sm text-base-content/70">
                {archiveCandidate.name} will disappear from the active roster but
                remain in historical activities and participation stats.
              </p>
            </div>

            {memberError ? (
              <div className="alert alert-error">
                <span>{memberError}</span>
              </div>
            ) : null}

            <div className="modal-action mt-0">
              <button
                className="btn btn-ghost"
                disabled={memberPending}
                onClick={closeArchiveConfirm}
                type="button"
              >
                Cancel
              </button>
              <button
                className="btn btn-warning"
                disabled={memberPending}
                onClick={handleArchiveMember}
                type="button"
              >
                {memberPending ? "Archiving..." : "Archive"}
              </button>
            </div>
          </div>
          <button
            aria-label="Close archive member modal"
            className="modal-backdrop"
            onClick={closeArchiveConfirm}
            type="button"
          />
        </div>
      ) : null}
    </div>
  );
}
