"use client";

import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { generateBalancedGroups } from "../services/grouping";
import type { ActivityGroup, Member, RegularActivity } from "../types/domain";

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

const persistStorage = createJSONStorage(() =>
  typeof window === "undefined" ? noopStorage : window.sessionStorage,
);

export type ActivityBuilderState = {
  editingActivityId: string | null;
  activityDate: string;
  area: string;
  participantMemberIds: string[];
  targetGroupSize: number;
  generatedGroups: ActivityGroup[];
  dirty: boolean;
  lastGeneratedAt: string | null;
  errors: string[];
  hydrateFromActivity: (activity: RegularActivity) => void;
  setActivityDate: (activityDate: string) => void;
  setArea: (area: string) => void;
  setTargetGroupSize: (targetGroupSize: number) => void;
  toggleParticipant: (memberId: string) => void;
  generateGroups: (members: Member[]) => void;
  resetDraft: () => void;
  setErrors: (errors: string[]) => void;
  clearErrors: () => void;
  clearIfEditing: (activityId: string) => void;
  reconcileParticipants: (members: Member[]) => void;
};

const defaultActivityBuilderState = {
  editingActivityId: null,
  activityDate: "",
  area: "",
  participantMemberIds: [] as string[],
  targetGroupSize: 2,
  generatedGroups: [] as ActivityGroup[],
  dirty: false,
  lastGeneratedAt: null as string | null,
  errors: [] as string[],
};

export const useActivityBuilderStore = create<ActivityBuilderState>()(
  persist(
    (set, get) => ({
      ...defaultActivityBuilderState,
      hydrateFromActivity: (activity) =>
        set({
          editingActivityId: activity.id,
          activityDate: activity.activityDate,
          area: activity.area,
          participantMemberIds: activity.participantMemberIds,
          targetGroupSize: activity.groupConfig.targetGroupSize,
          generatedGroups: activity.groups,
          dirty: false,
          lastGeneratedAt: activity.groupGeneratedAt,
          errors: [],
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
      setTargetGroupSize: (targetGroupSize) =>
        set({
          targetGroupSize,
          generatedGroups: [],
          lastGeneratedAt: null,
          dirty: true,
        }),
      toggleParticipant: (memberId) =>
        set((state) => {
          const participantMemberIds = state.participantMemberIds.includes(memberId)
            ? state.participantMemberIds.filter((current) => current !== memberId)
            : [...state.participantMemberIds, memberId];

          return {
            participantMemberIds,
            generatedGroups: [],
            lastGeneratedAt: null,
            dirty: true,
          };
        }),
      generateGroups: (members) => {
        const state = get();
        const selectedMembers = members.filter((member) =>
          state.participantMemberIds.includes(member.id),
        );

        if (selectedMembers.length === 0) {
          set({
            errors: ["Select at least one participant before generating groups."],
          });
          return;
        }

        try {
          const generatedGroups = generateBalancedGroups(
            selectedMembers,
            state.targetGroupSize,
          );

          set({
            generatedGroups,
            lastGeneratedAt: new Date().toISOString(),
            dirty: true,
            errors: [],
          });
        } catch (error) {
          set({
            errors: [
              error instanceof Error ? error.message : "Failed to generate groups.",
            ],
          });
        }
      },
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
        const generatedGroups = get().generatedGroups
          .map((group) => ({
            ...group,
            memberIds: group.memberIds.filter((memberId) => validMemberIds.has(memberId)),
          }))
          .filter((group) => group.memberIds.length > 0);

        set({
          participantMemberIds,
          generatedGroups,
        });
      },
    }),
    {
      name: "dessertrip-activity-builder",
      storage: persistStorage,
      partialize: (state) => ({
        editingActivityId: state.editingActivityId,
        activityDate: state.activityDate,
        area: state.area,
        participantMemberIds: state.participantMemberIds,
        targetGroupSize: state.targetGroupSize,
        generatedGroups: state.generatedGroups,
        dirty: state.dirty,
        lastGeneratedAt: state.lastGeneratedAt,
      }),
    },
  ),
);
