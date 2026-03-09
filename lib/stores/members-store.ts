"use client";

import { create } from "zustand";
import type { AppLocale } from "../i18n/config";
import type { ArchiveFilter, Gender, Member } from "../types/domain";

type MemberDraft = {
  name: string;
  gender: Gender;
  isManager: boolean;
};

type GenderFilter = Gender | "all";
type ManagerFilter = "all" | "manager" | "member";

export type MembersState = {
  members: Member[];
  locale: AppLocale;
  search: string;
  genderFilter: GenderFilter;
  managerFilter: ManagerFilter;
  archiveFilter: ArchiveFilter;
  isCreateModalOpen: boolean;
  draft: MemberDraft;
  editMemberId: string | null;
  editDraft: MemberDraft;
  archiveConfirmMemberId: string | null;
  pending: boolean;
  error: string | null;
  hydrate: (members: Member[], locale?: AppLocale) => void;
  setLocale: (locale: AppLocale) => void;
  setSearch: (search: string) => void;
  setGenderFilter: (genderFilter: GenderFilter) => void;
  setManagerFilter: (managerFilter: ManagerFilter) => void;
  setArchiveFilter: (archiveFilter: ArchiveFilter) => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  setDraftName: (name: string) => void;
  setDraftGender: (gender: Gender) => void;
  setDraftManager: (isManager: boolean) => void;
  openEditModal: (member: Member) => void;
  closeEditModal: () => void;
  setEditDraftName: (name: string) => void;
  setEditDraftGender: (gender: Gender) => void;
  setEditDraftManager: (isManager: boolean) => void;
  openArchiveConfirm: (memberId: string) => void;
  closeArchiveConfirm: () => void;
  upsertMember: (member: Member) => void;
  setPending: (pending: boolean) => void;
  setError: (error: string | null) => void;
  resetDraft: () => void;
};

const defaultDraft: MemberDraft = {
  name: "",
  gender: "female",
  isManager: false,
};

export const useMembersStore = create<MembersState>((set) => ({
  members: [],
  locale: "ko",
  search: "",
  genderFilter: "all",
  managerFilter: "all",
  archiveFilter: "active",
  isCreateModalOpen: false,
  draft: defaultDraft,
  editMemberId: null,
  editDraft: defaultDraft,
  archiveConfirmMemberId: null,
  pending: false,
  error: null,
  hydrate: (members, locale = "ko") => set({ members, locale }),
  setLocale: (locale) => set({ locale }),
  setSearch: (search) => set({ search }),
  setGenderFilter: (genderFilter) => set({ genderFilter }),
  setManagerFilter: (managerFilter) => set({ managerFilter }),
  setArchiveFilter: (archiveFilter) => set({ archiveFilter }),
  openCreateModal: () =>
    set({
      isCreateModalOpen: true,
      error: null,
    }),
  closeCreateModal: () =>
    set({
      isCreateModalOpen: false,
      draft: defaultDraft,
      pending: false,
      error: null,
    }),
  setDraftName: (name) =>
    set((state) => ({
      draft: {
        ...state.draft,
        name,
      },
    })),
  setDraftGender: (gender) =>
    set((state) => ({
      draft: {
        ...state.draft,
        gender,
      },
    })),
  setDraftManager: (isManager) =>
    set((state) => ({
      draft: {
        ...state.draft,
        isManager,
      },
    })),
  openEditModal: (member) =>
    set({
      editMemberId: member.id,
      editDraft: {
        name: member.name,
        gender: member.gender,
        isManager: member.isManager,
      },
      error: null,
    }),
  closeEditModal: () =>
    set({
      editMemberId: null,
      editDraft: defaultDraft,
      pending: false,
      error: null,
    }),
  setEditDraftName: (name) =>
    set((state) => ({
      editDraft: {
        ...state.editDraft,
        name,
      },
    })),
  setEditDraftGender: (gender) =>
    set((state) => ({
      editDraft: {
        ...state.editDraft,
        gender,
      },
    })),
  setEditDraftManager: (isManager) =>
    set((state) => ({
      editDraft: {
        ...state.editDraft,
        isManager,
      },
    })),
  openArchiveConfirm: (archiveConfirmMemberId) =>
    set({
      archiveConfirmMemberId,
      error: null,
    }),
  closeArchiveConfirm: () =>
    set({
      archiveConfirmMemberId: null,
      pending: false,
      error: null,
    }),
  upsertMember: (member) =>
    set((state) => ({
      members: [...state.members.filter((current) => current.id !== member.id), member]
        .sort((left, right) => left.name.localeCompare(right.name, state.locale)),
      pending: false,
      error: null,
    })),
  setPending: (pending) => set({ pending }),
  setError: (error) => set({ error }),
  resetDraft: () =>
    set({
      draft: defaultDraft,
      pending: false,
      error: null,
    }),
}));

export function selectVisibleMembers(state: MembersState) {
  const normalizedSearch = state.search.trim().toLowerCase();

  return state.members.filter((member) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      member.name.toLowerCase().includes(normalizedSearch);
    const matchesGender =
      state.genderFilter === "all" || member.gender === state.genderFilter;
    const matchesManager =
      state.managerFilter === "all" ||
      (state.managerFilter === "manager" ? member.isManager : !member.isManager);
    const matchesArchive =
      state.archiveFilter === "all" ||
      (state.archiveFilter === "active"
        ? member.archivedAt === null
        : member.archivedAt !== null);

    return matchesSearch && matchesGender && matchesManager && matchesArchive;
  });
}
