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
    expect(state.generatedGroups).toEqual([]);
    expect(state.lastGeneratedAt).toBeNull();
  });

  it("preserves generated groups and leaves newly added members unassigned", () => {
    useActivityBuilderStore.setState({
      participantMemberIds: ["m1", "m2"],
      memberPickerDraftIds: ["m1", "m2", "m3"],
      isMemberPickerOpen: true,
      generatedGroups: [
        { groupNumber: 1, memberIds: ["m1"] },
        { groupNumber: 2, memberIds: ["m2"] },
      ],
      lastGeneratedAt: "2026-03-10T10:00:00.000Z",
    });

    useActivityBuilderStore.getState().confirmMemberPicker();

    const state = useActivityBuilderStore.getState();

    expect(state.participantMemberIds).toEqual(["m1", "m2", "m3"]);
    expect(state.generatedGroups).toEqual([
      { groupNumber: 1, memberIds: ["m1"] },
      { groupNumber: 2, memberIds: ["m2"] },
    ]);
    expect(state.lastGeneratedAt).toBe("2026-03-10T10:00:00.000Z");
  });

  it("preserves group columns and removes deselected members from existing groups", () => {
    useActivityBuilderStore.setState({
      participantMemberIds: ["m1", "m2"],
      memberPickerDraftIds: ["m1"],
      isMemberPickerOpen: true,
      generatedGroups: [
        { groupNumber: 1, memberIds: ["m1"] },
        { groupNumber: 2, memberIds: ["m2"] },
      ],
      lastGeneratedAt: "2026-03-10T10:00:00.000Z",
    });

    useActivityBuilderStore.getState().confirmMemberPicker();

    const state = useActivityBuilderStore.getState();

    expect(state.participantMemberIds).toEqual(["m1"]);
    expect(state.generatedGroups).toEqual([
      { groupNumber: 1, memberIds: ["m1"] },
      { groupNumber: 2, memberIds: [] },
    ]);
    expect(state.lastGeneratedAt).toBe("2026-03-10T10:00:00.000Z");
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

  it("adds an empty group and syncs the target group count", () => {
    useActivityBuilderStore.setState({
      participantMemberIds: ["m1", "m2"],
      generatedGroups: [
        { groupNumber: 1, memberIds: ["m1"] },
        { groupNumber: 2, memberIds: ["m2"] },
      ],
      targetGroupCount: 2,
    });

    useActivityBuilderStore.getState().addEmptyGroup();

    const state = useActivityBuilderStore.getState();

    expect(state.generatedGroups).toEqual([
      { groupNumber: 1, memberIds: ["m1"] },
      { groupNumber: 2, memberIds: ["m2"] },
      { groupNumber: 3, memberIds: [] },
    ]);
    expect(state.targetGroupCount).toBe(3);
  });

  it("removes a group, renumbers the rest, and moves its members to unassigned order", () => {
    useActivityBuilderStore.setState({
      participantMemberIds: ["m1", "m2", "m3", "m4"],
      generatedGroups: [
        { groupNumber: 1, memberIds: ["m1"] },
        { groupNumber: 2, memberIds: ["m3", "m2"] },
        { groupNumber: 3, memberIds: ["m4"] },
      ],
      targetGroupCount: 3,
    });

    useActivityBuilderStore.getState().removeGroup(2);

    const state = useActivityBuilderStore.getState();

    expect(state.generatedGroups).toEqual([
      { groupNumber: 1, memberIds: ["m1"] },
      { groupNumber: 2, memberIds: ["m4"] },
    ]);
    expect(state.participantMemberIds).toEqual(["m1", "m4", "m3", "m2"]);
    expect(state.targetGroupCount).toBe(2);
  });

  it("does not remove the final remaining group", () => {
    useActivityBuilderStore.setState({
      participantMemberIds: ["m1"],
      generatedGroups: [{ groupNumber: 1, memberIds: ["m1"] }],
      targetGroupCount: 1,
    });

    useActivityBuilderStore.getState().removeGroup(1);

    const state = useActivityBuilderStore.getState();

    expect(state.generatedGroups).toEqual([{ groupNumber: 1, memberIds: ["m1"] }]);
    expect(state.targetGroupCount).toBe(1);
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
      type: "existing-group",
      targetGroupNumber: targetGroup?.groupNumber ?? 1,
      targetIndex: targetGroup?.memberIds.length ?? 0,
    });

    const nextGroups = useActivityBuilderStore.getState().generatedGroups;

    expect(nextGroups.find((group) => group.groupNumber === sourceGroup?.groupNumber)?.memberIds).not.toContain("m1");
    expect(nextGroups.find((group) => group.groupNumber === targetGroup?.groupNumber)?.memberIds).toContain("m1");
  });
});
