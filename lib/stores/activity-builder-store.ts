"use client";

import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { moveMemberBetweenGroups, type MoveGroupMemberInput } from "../activity-group-dnd";
import { isTranslationKey, type TranslationKey } from "../i18n/config";
import { generateBalancedGroups } from "../services/grouping";
import type { Activity, ActivityGroup, ActivityType, Member } from "../types/domain";

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

const persistStorage = createJSONStorage(() =>
  typeof window === "undefined" ? noopStorage : window.sessionStorage,
);

function normalizeTargetGroupCount(
  value: unknown,
  fallbackGroupCount = 1,
) {
  const numericValue = Number(value);

  if (Number.isInteger(numericValue) && numericValue >= 1) {
    return numericValue;
  }

  return Math.max(1, fallbackGroupCount);
}

function arraysEqual(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

function clearGeneratedGroupsState() {
  return {
    generatedGroups: [] as ActivityGroup[],
    lastGeneratedAt: null as string | null,
  };
}

export type ActivityBuilderState = {
  editingActivityId: string | null;
  activityType: ActivityType;
  activityDate: string;
  area: string;
  participantMemberIds: string[];
  memberPickerDraftIds: string[];
  isMemberPickerOpen: boolean;
  memberSearch: string;
  targetGroupCount: number;
  generatedGroups: ActivityGroup[];
  dirty: boolean;
  lastGeneratedAt: string | null;
  warnings: TranslationKey[];
  errors: TranslationKey[];
  hydrateFromActivity: (activity: Activity) => void;
  setActivityType: (activityType: ActivityType) => void;
  setActivityDate: (activityDate: string) => void;
  setArea: (area: string) => void;
  openMemberPicker: () => void;
  closeMemberPicker: () => void;
  toggleMemberPickerMember: (memberId: string) => void;
  confirmMemberPicker: () => void;
  setMemberSearch: (memberSearch: string) => void;
  setTargetGroupCount: (targetGroupCount: number) => void;
  syncWarnings: (members: Member[]) => void;
  generateGroups: (members: Member[]) => void;
  moveGroupMember: (input: MoveGroupMemberInput) => void;
  resetDraft: () => void;
  setErrors: (errors: TranslationKey[]) => void;
  clearErrors: () => void;
  clearIfEditing: (activityId: string) => void;
  reconcileParticipants: (members: Member[]) => void;
};

const defaultActivityBuilderState = {
  editingActivityId: null,
  activityType: "regular" as const,
  activityDate: "",
  area: "",
  participantMemberIds: [] as string[],
  memberPickerDraftIds: [] as string[],
  isMemberPickerOpen: false,
  memberSearch: "",
  targetGroupCount: 1,
  generatedGroups: [] as ActivityGroup[],
  dirty: false,
  lastGeneratedAt: null as string | null,
  warnings: [] as TranslationKey[],
  errors: [] as TranslationKey[],
};

export const useActivityBuilderStore = create<ActivityBuilderState>()(
  persist(
    (set, get) => ({
      ...defaultActivityBuilderState,
      hydrateFromActivity: (activity) =>
        set({
          editingActivityId: activity.id,
          activityType: activity.activityType,
          activityDate: activity.activityDate,
          area: activity.area,
          participantMemberIds: activity.participantMemberIds,
          memberPickerDraftIds: activity.participantMemberIds,
          isMemberPickerOpen: false,
          memberSearch: "",
          targetGroupCount: normalizeTargetGroupCount(
            activity.groupConfig?.targetGroupCount,
            activity.groups.length,
          ),
          generatedGroups: activity.groups,
          dirty: false,
          lastGeneratedAt: activity.groupGeneratedAt,
          warnings: [],
          errors: [],
        }),
      setActivityType: (activityType) =>
        set((state) => {
          if (state.activityType === activityType) {
            return {};
          }

          return {
            activityType,
            dirty: true,
            warnings: [],
            errors: [],
            ...(activityType === "flash" ? clearGeneratedGroupsState() : {}),
          };
        }),
      setActivityDate: (activityDate) =>
        set({
          activityDate,
          dirty: true,
        }),
      setArea: (area) =>
        set({
          area,
          dirty: true,
        }),
      openMemberPicker: () =>
        set((state) => ({
          isMemberPickerOpen: true,
          memberPickerDraftIds: state.participantMemberIds,
          memberSearch: "",
          errors: [],
        })),
      closeMemberPicker: () =>
        set((state) => ({
          isMemberPickerOpen: false,
          memberPickerDraftIds: state.participantMemberIds,
          memberSearch: "",
        })),
      toggleMemberPickerMember: (memberId) =>
        set((state) => ({
          memberPickerDraftIds: state.memberPickerDraftIds.includes(memberId)
            ? state.memberPickerDraftIds.filter((current) => current !== memberId)
            : [...state.memberPickerDraftIds, memberId],
        })),
      confirmMemberPicker: () =>
        set((state) => {
          const participantMemberIds = [...state.memberPickerDraftIds];
          const selectionChanged = !arraysEqual(
            participantMemberIds,
            state.participantMemberIds,
          );

          return {
            participantMemberIds,
            isMemberPickerOpen: false,
            memberSearch: "",
            dirty: selectionChanged ? true : state.dirty,
            ...(selectionChanged ? clearGeneratedGroupsState() : {}),
          };
        }),
      setMemberSearch: (memberSearch) => set({ memberSearch }),
      setTargetGroupCount: (targetGroupCount) =>
        set((state) => {
          const nextGroupCount = normalizeTargetGroupCount(targetGroupCount);
          const countChanged = nextGroupCount !== state.targetGroupCount;

          return {
            targetGroupCount: nextGroupCount,
            dirty: countChanged ? true : state.dirty,
            ...(countChanged ? clearGeneratedGroupsState() : {}),
          };
        }),
      syncWarnings: (members) => {
        const state = get();

        if (state.activityType === "flash") {
          set({ warnings: [] });
          return;
        }

        const targetGroupCount = normalizeTargetGroupCount(
          state.targetGroupCount,
          state.generatedGroups.length,
        );
        const selectedMembers = members.filter((member) =>
          state.participantMemberIds.includes(member.id),
        );
        const selectedManagerCount = selectedMembers.filter(
          (member) => member.isManager,
        ).length;
        const warnings =
          state.participantMemberIds.length > 0 &&
          targetGroupCount > selectedManagerCount
            ? [
                "builder.warning.managerShortage" as const,
              ]
            : [];

        set({ targetGroupCount, warnings });
      },
      generateGroups: (members) => {
        const state = get();

        if (state.activityType === "flash") {
          set({
            errors: [],
          });
          return;
        }

        const targetGroupCount = normalizeTargetGroupCount(
          state.targetGroupCount,
          state.generatedGroups.length,
        );
        const selectedMembers = members.filter((member) =>
          state.participantMemberIds.includes(member.id),
        );

        if (selectedMembers.length === 0) {
          set({
            errors: ["builder.validation.noParticipantsGenerate"],
          });
          return;
        }

        if (targetGroupCount > selectedMembers.length) {
          set({
            targetGroupCount,
            errors: ["builder.validation.targetTooLarge"],
          });
          return;
        }

        try {
          const generatedGroups = generateBalancedGroups(
            selectedMembers,
            targetGroupCount,
          );

          set({
            targetGroupCount,
            generatedGroups,
            lastGeneratedAt: new Date().toISOString(),
            dirty: true,
            errors: [],
          });
        } catch (error) {
          set({
            errors: [
              error instanceof Error && isTranslationKey(error.message)
                ? error.message
                : "errors.generic",
            ],
          });
        }
      },
      moveGroupMember: (input) =>
        set((state) => ({
          generatedGroups: moveMemberBetweenGroups(state.generatedGroups, input),
          dirty: true,
          errors: [],
        })),
      resetDraft: () =>
        set({
          ...defaultActivityBuilderState,
        }),
      setErrors: (errors) => set({ errors }),
      clearErrors: () => set({ errors: [] }),
      clearIfEditing: (activityId) => {
        if (get().editingActivityId === activityId) {
          set({
            ...defaultActivityBuilderState,
          });
        }
      },
      reconcileParticipants: (members) => {
        const validMemberIds = new Set(members.map((member) => member.id));
        const participantMemberIds = get().participantMemberIds.filter((memberId) =>
          validMemberIds.has(memberId),
        );
        const memberPickerDraftIds = get().memberPickerDraftIds.filter((memberId) =>
          validMemberIds.has(memberId),
        );
        const generatedGroups = get().generatedGroups
          .map((group) => ({
            ...group,
            memberIds: group.memberIds.filter((memberId) => validMemberIds.has(memberId)),
          }))
          .filter((group) => group.memberIds.length > 0);

        set({
          participantMemberIds,
          memberPickerDraftIds,
          generatedGroups,
        });
      },
    }),
    {
      name: "dessertrip-activity-builder",
      storage: persistStorage,
      partialize: (state) => ({
        editingActivityId: state.editingActivityId,
        activityType: state.activityType,
        activityDate: state.activityDate,
        area: state.area,
        participantMemberIds: state.participantMemberIds,
        targetGroupCount: normalizeTargetGroupCount(
          state.targetGroupCount,
          state.generatedGroups.length,
        ),
        generatedGroups: state.generatedGroups,
        dirty: state.dirty,
        lastGeneratedAt: state.lastGeneratedAt,
      }),
    },
  ),
);
