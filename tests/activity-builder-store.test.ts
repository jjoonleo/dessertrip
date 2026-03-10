import { beforeEach, describe, expect, it } from "vitest";
import { useActivityBuilderStore } from "../lib/stores/activity-builder-store";
import type { Member } from "../lib/types/domain";

const members: Member[] = [
  { id: "m1", name: "Ari", gender: "female", isManager: false, archivedAt: null },
  { id: "m2", name: "Ben", gender: "male", isManager: true, archivedAt: null },
  { id: "m3", name: "Coco", gender: "female", isManager: false, archivedAt: null },
  { id: "m4", name: "Dan", gender: "male", isManager: true, archivedAt: null },
];

describe("activity builder store", () => {
  beforeEach(() => {
    useActivityBuilderStore.getState().resetDraft();
  });

  it("confirms member picker selection into the draft", () => {
    const store = useActivityBuilderStore.getState();

    store.openMemberPicker();
    store.toggleMemberPickerMember("m1");
    store.toggleMemberPickerMember("m2");
    store.confirmMemberPicker();

    const state = useActivityBuilderStore.getState();

    expect(state.isMemberPickerOpen).toBe(false);
    expect(state.participantMemberIds).toEqual(["m1", "m2"]);
  });

  it("tracks group count, warnings, and generated groups", () => {
    const store = useActivityBuilderStore.getState();

    store.openMemberPicker();
    store.toggleMemberPickerMember("m1");
    store.toggleMemberPickerMember("m2");
    store.toggleMemberPickerMember("m3");
    store.confirmMemberPicker();
    store.setTargetGroupCount(3);
    store.syncWarnings(members);
    store.generateGroups(members);

    const state = useActivityBuilderStore.getState();

    expect(state.targetGroupCount).toBe(3);
    expect(state.warnings).toEqual([
      "builder.warning.managerShortage",
    ]);
    expect(state.generatedGroups).toHaveLength(3);
    expect(state.lastGeneratedAt).not.toBeNull();
  });

  it("clears generated groups when switching to flash mode", () => {
    const store = useActivityBuilderStore.getState();

    store.openMemberPicker();
    store.toggleMemberPickerMember("m1");
    store.toggleMemberPickerMember("m2");
    store.confirmMemberPicker();
    store.setTargetGroupCount(2);
    store.generateGroups(members);

    expect(useActivityBuilderStore.getState().generatedGroups).toHaveLength(2);

    store.setActivityType("flash");

    const state = useActivityBuilderStore.getState();

    expect(state.activityType).toBe("flash");
    expect(state.generatedGroups).toEqual([]);
    expect(state.lastGeneratedAt).toBeNull();
    expect(state.warnings).toEqual([]);
  });

  it("moves a generated member between groups", () => {
    const store = useActivityBuilderStore.getState();

    store.openMemberPicker();
    store.toggleMemberPickerMember("m1");
    store.toggleMemberPickerMember("m2");
    store.toggleMemberPickerMember("m3");
    store.toggleMemberPickerMember("m4");
    store.confirmMemberPicker();
    store.setTargetGroupCount(2);
    store.generateGroups(members);

    const generatedGroups = useActivityBuilderStore.getState().generatedGroups;
    const sourceGroup = generatedGroups.find((group) => group.memberIds.includes("m1"));
    const targetGroup = generatedGroups.find((group) => !group.memberIds.includes("m1"));

    expect(sourceGroup).not.toBeNull();
    expect(targetGroup).not.toBeNull();

    store.moveGroupMember({
      activeMemberId: "m1",
      targetGroupNumber: targetGroup?.groupNumber ?? 1,
      targetIndex: targetGroup?.memberIds.length ?? 0,
    });

    const nextGroups = useActivityBuilderStore.getState().generatedGroups;

    expect(nextGroups.find((group) => group.groupNumber === sourceGroup?.groupNumber)?.memberIds).not.toContain("m1");
    expect(nextGroups.find((group) => group.groupNumber === targetGroup?.groupNumber)?.memberIds).toContain("m1");
  });
});
