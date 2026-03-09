import { beforeEach, describe, expect, it } from "vitest";
import { useActivityBuilderStore } from "../lib/stores/activity-builder-store";
import type { Member } from "../lib/types/domain";

const members: Member[] = [
  { id: "m1", name: "Ari", gender: "female", isManager: false, archivedAt: null },
  { id: "m2", name: "Ben", gender: "male", isManager: false, archivedAt: null },
  { id: "m3", name: "Coco", gender: "female", isManager: false, archivedAt: null },
  { id: "m4", name: "Dan", gender: "male", isManager: true, archivedAt: null },
];

describe("activity builder store", () => {
  beforeEach(() => {
    useActivityBuilderStore.getState().resetDraft();
  });

  it("tracks participant selection and generated groups", () => {
    const store = useActivityBuilderStore.getState();

    store.toggleParticipant("m1");
    store.toggleParticipant("m2");
    store.toggleParticipant("m3");
    store.toggleParticipant("m4");
    store.setTargetGroupSize(2);
    store.generateGroups(members);

    const state = useActivityBuilderStore.getState();

    expect(state.participantMemberIds).toHaveLength(4);
    expect(state.generatedGroups).toHaveLength(2);
    expect(state.lastGeneratedAt).not.toBeNull();
    expect(state.dirty).toBe(true);
  });

  it("resets stale groups when participant selection changes", () => {
    const store = useActivityBuilderStore.getState();

    store.toggleParticipant("m1");
    store.toggleParticipant("m2");
    store.setTargetGroupSize(2);
    store.generateGroups(members);
    store.toggleParticipant("m3");

    const state = useActivityBuilderStore.getState();

    expect(state.generatedGroups).toEqual([]);
    expect(state.lastGeneratedAt).toBeNull();
  });
});
