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
import { useI18n } from "../i18n/i18n-provider";
import { useMembersStore, selectVisibleMembers } from "../../lib/stores/members-store";
import { useStatsStore } from "../../lib/stores/stats-store";
import type { Member } from "../../lib/types/domain";
import { FormField, FormStack } from "../ui/form-field";
import { SectionHeader } from "./section-header";

type MembersPageProps = {
  initialMembers: Member[];
};

export function MembersPage({ initialMembers }: MembersPageProps) {
  const { locale, t } = useI18n();
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
  const setStatsLocale = useStatsStore((state) => state.setLocale);

  useEffect(() => {
    hydrateMembers(initialMembers, locale);
  }, [hydrateMembers, initialMembers, locale]);

  useEffect(() => {
    setStatsLocale(locale);
  }, [locale, setStatsLocale]);

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
      participationScore: 0,
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
    hydrateStats(result.data.stats, locale);
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
    hydrateStats(result.data.stats, locale);
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
    hydrateStats(result.data.stats, locale);
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
        badge={t("members.badge")}
        description={t("members.description")}
        title={t("members.title")}
      />

      <div className="stats stats-vertical w-full border border-base-300 bg-base-100 shadow-sm lg:stats-horizontal">
        <div className="stat">
          <div className="stat-title">{t("members.stats.all.title")}</div>
          <div className="stat-value text-primary">{members.length}</div>
          <div className="stat-desc">{t("members.stats.all.description")}</div>
        </div>
        <div className="stat">
          <div className="stat-title">{t("members.stats.active.title")}</div>
          <div className="stat-value text-secondary">{activeCount}</div>
          <div className="stat-desc">
            {t("members.stats.active.description")}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">{t("members.stats.archived.title")}</div>
          <div className="stat-value text-accent">{archivedCount}</div>
          <div className="stat-desc">
            {t("members.stats.archived.description")}
          </div>
        </div>
      </div>

      <section className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body gap-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">
                {t("members.roster.title")}
              </h3>
              <p className="text-sm text-base-content/70">
                {t("members.roster.summary", {
                  visible: visibleMembers.length,
                  total: members.length,
                })}
              </p>
            </div>

            <button
              className="btn btn-primary"
              onClick={openCreateModal}
              type="button"
            >
              {t("members.addUser")}
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <input
              className="input input-bordered w-full"
              onChange={(event) => setMemberSearch(event.target.value)}
              placeholder={t("members.filters.searchPlaceholder")}
              value={memberSearch}
            />
            <select
              className="select select-bordered w-full"
              onChange={(event) =>
                setMemberGenderFilter(event.target.value as "all" | Member["gender"])
              }
              value={memberGenderFilter}
            >
              <option value="all">{t("members.filters.allGenders")}</option>
              <option value="female">{t("common.gender.female")}</option>
              <option value="male">{t("common.gender.male")}</option>
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
              <option value="all">{t("members.filters.allRoles")}</option>
              <option value="manager">{t("members.filters.managers")}</option>
              <option value="member">{t("members.filters.memberOnly")}</option>
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
              <option value="active">{t("members.filters.activeOnly")}</option>
              <option value="all">{t("members.filters.allMembers")}</option>
              <option value="archived">
                {t("members.filters.archivedOnly")}
              </option>
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
                <span>{t("members.empty")}</span>
              </div>
            ) : (
              visibleMembers.map((member) => (
                <div
                  key={member.id}
                  className="card border border-base-300 bg-base-100 shadow-sm"
                >
                  <div className="card-body flex-row flex-nowrap items-center gap-4 overflow-x-auto p-4">
                    <div className="flex min-w-max items-center gap-2">
                      <h2 className="text-base font-semibold">{member.name}</h2>
                      <span className="badge badge-outline">
                        {member.gender === "female"
                          ? t("common.gender.female")
                          : t("common.gender.male")}
                      </span>
                      {member.isManager ? (
                        <span className="badge badge-secondary">
                          {t("members.managerBadge")}
                        </span>
                      ) : null}
                      {member.archivedAt ? (
                        <span className="badge badge-warning badge-outline">
                          {t("members.archivedBadge")}
                        </span>
                      ) : null}
                    </div>

                    <div className="ml-auto flex shrink-0 gap-2">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => openEditModal(member)}
                        type="button"
                      >
                        {t("members.actions.edit")}
                      </button>
                      {member.archivedAt ? (
                        <button
                          className="btn btn-sm btn-outline btn-success"
                          disabled={memberPending}
                          onClick={() => handleRestoreMember(member.id)}
                          type="button"
                        >
                          {t("members.actions.restore")}
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline btn-warning"
                          onClick={() => openArchiveConfirm(member.id)}
                          type="button"
                        >
                          {t("members.actions.archive")}
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
              <h2 className="text-xl font-bold">{t("members.modal.create.title")}</h2>
              <p className="text-sm text-base-content/70">
                {t("members.modal.create.description")}
              </p>
            </div>

            <form onSubmit={handleCreateMember}>
              <FormStack>
                <FormField label={t("members.modal.name")}>
                  <input
                    className="input input-bordered w-full"
                    disabled={memberPending}
                    onChange={(event) => setDraftName(event.target.value)}
                    placeholder={t("members.modal.namePlaceholder")}
                    value={memberDraft.name}
                  />
                </FormField>

                <FormField label={t("members.modal.gender")}>
                  <select
                    className="select select-bordered w-full"
                    disabled={memberPending}
                    onChange={(event) =>
                      setDraftGender(event.target.value as Member["gender"])
                    }
                    value={memberDraft.gender}
                  >
                    <option value="female">{t("common.gender.female")}</option>
                    <option value="male">{t("common.gender.male")}</option>
                  </select>
                </FormField>

                <label className="label justify-start gap-3 rounded-box border border-base-300 bg-base-200 px-4 py-4">
                  <input
                    checked={memberDraft.isManager}
                    className="checkbox checkbox-primary"
                    disabled={memberPending}
                    onChange={(event) => setDraftManager(event.target.checked)}
                    type="checkbox"
                  />
                  <span className="label-text">
                    {t("members.modal.managerCheckbox")}
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
                    {t("members.modal.cancel")}
                  </button>
                  <button
                    className="btn btn-primary"
                    disabled={memberPending || memberDraft.name.trim().length === 0}
                    type="submit"
                  >
                    {memberPending
                      ? t("members.modal.savePending")
                      : t("members.addUser")}
                  </button>
                </div>
              </FormStack>
            </form>
          </div>
          <button
            aria-label={t("members.modal.closeCreate")}
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
              <h2 className="text-xl font-bold">{t("members.modal.edit.title")}</h2>
              <p className="text-sm text-base-content/70">
                {t("members.modal.edit.description", {
                  name: editingMember.name,
                })}
              </p>
            </div>

            <form onSubmit={handleSaveEdit}>
              <FormStack>
                <FormField label={t("members.modal.name")}>
                  <input
                    className="input input-bordered w-full"
                    disabled={memberPending}
                    onChange={(event) => setEditDraftName(event.target.value)}
                    value={editDraft.name}
                  />
                </FormField>

                <FormField label={t("members.modal.gender")}>
                  <select
                    className="select select-bordered w-full"
                    disabled={memberPending}
                    onChange={(event) =>
                      setEditDraftGender(event.target.value as Member["gender"])
                    }
                    value={editDraft.gender}
                  >
                    <option value="female">{t("common.gender.female")}</option>
                    <option value="male">{t("common.gender.male")}</option>
                  </select>
                </FormField>

                <label className="label justify-start gap-3 rounded-box border border-base-300 bg-base-200 px-4 py-4">
                  <input
                    checked={editDraft.isManager}
                    className="checkbox checkbox-primary"
                    disabled={memberPending}
                    onChange={(event) => setEditDraftManager(event.target.checked)}
                    type="checkbox"
                  />
                  <span className="label-text">
                    {t("members.modal.managerCheckbox")}
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
                    onClick={closeEditModal}
                    type="button"
                  >
                    {t("members.modal.cancel")}
                  </button>
                  <button
                    className="btn btn-primary"
                    disabled={memberPending || editDraft.name.trim().length === 0}
                    type="submit"
                  >
                    {memberPending
                      ? t("members.modal.savePending")
                      : t("members.modal.save")}
                  </button>
                </div>
              </FormStack>
            </form>
          </div>
          <button
            aria-label={t("members.modal.closeEdit")}
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
              <h2 className="text-xl font-bold">
                {t("members.modal.archive.title")}
              </h2>
              <p className="text-sm text-base-content/70">
                {t("members.modal.archive.description", {
                  name: archiveCandidate.name,
                })}
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
                {t("members.modal.cancel")}
              </button>
              <button
                className="btn btn-warning"
                disabled={memberPending}
                onClick={handleArchiveMember}
                type="button"
              >
                {memberPending
                  ? t("members.modal.archivePending")
                  : t("members.actions.archive")}
              </button>
            </div>
          </div>
          <button
            aria-label={t("members.modal.closeArchive")}
            className="modal-backdrop"
            onClick={closeArchiveConfirm}
            type="button"
          />
        </div>
      ) : null}
    </div>
  );
}
