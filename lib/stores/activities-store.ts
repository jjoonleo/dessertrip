"use client";

import { create } from "zustand";
import type { RegularActivity } from "../types/domain";

export type ActivitiesState = {
  activities: RegularActivity[];
  search: string;
  selectedActivityId: string | null;
  pendingDeleteId: string | null;
  pending: boolean;
  error: string | null;
  hydrate: (activities: RegularActivity[]) => void;
  setSearch: (search: string) => void;
  selectActivity: (activityId: string | null) => void;
  markDeletePending: (activityId: string | null) => void;
  setPending: (pending: boolean) => void;
  setError: (error: string | null) => void;
  upsertActivity: (activity: RegularActivity) => void;
  removeActivity: (activityId: string) => void;
};

export const useActivitiesStore = create<ActivitiesState>((set) => ({
  activities: [],
  search: "",
  selectedActivityId: null,
  pendingDeleteId: null,
  pending: false,
  error: null,
  hydrate: (activities) => set({ activities }),
  setSearch: (search) => set({ search }),
  selectActivity: (selectedActivityId) => set({ selectedActivityId }),
  markDeletePending: (pendingDeleteId) => set({ pendingDeleteId }),
  setPending: (pending) => set({ pending }),
  setError: (error) => set({ error }),
  upsertActivity: (activity) =>
    set((state) => ({
      activities: [...state.activities.filter((current) => current.id !== activity.id), activity]
        .sort((left, right) => right.activityDate.localeCompare(left.activityDate)),
      selectedActivityId: activity.id,
      pendingDeleteId: null,
      pending: false,
      error: null,
    })),
  removeActivity: (activityId) =>
    set((state) => ({
      activities: state.activities.filter((activity) => activity.id !== activityId),
      selectedActivityId:
        state.selectedActivityId === activityId ? null : state.selectedActivityId,
      pendingDeleteId: null,
      pending: false,
      error: null,
    })),
}));

export function selectVisibleActivities(state: ActivitiesState) {
  const normalizedSearch = state.search.trim().toLowerCase();

  return state.activities.filter((activity) => {
    if (normalizedSearch.length === 0) {
      return true;
    }

    return (
      activity.activityName.toLowerCase().includes(normalizedSearch) ||
      activity.area.toLowerCase().includes(normalizedSearch)
    );
  });
}
