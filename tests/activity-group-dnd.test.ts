import { describe, expect, it } from "vitest";
import {
  activityGroupsEqual,
  getGroupDropId,
  getMemberItemId,
  moveMemberBetweenGroups,
  resolveCommittedGroupMoveTarget,
  resolveGroupMoveTarget,
} from "../lib/activity-group-dnd";
import type { ActivityGroup } from "../lib/types/domain";

const groups: ActivityGroup[] = [
  { groupNumber: 1, memberIds: ["m1", "m2"] },
  { groupNumber: 2, memberIds: ["m3", "m4"] },
  { groupNumber: 3, memberIds: [] },
];

describe("activity group dnd helpers", () => {
  it("resolves a cross-group member hover target", () => {
    expect(
      resolveGroupMoveTarget({
        activeMemberId: "m1",
        groups,
        over: { id: getMemberItemId("m3") },
      }),
    ).toEqual({
      targetGroupNumber: 2,
      targetIndex: 0,
    });
  });

  it("resolves same-group downward reorder with the final insertion index", () => {
    expect(
      resolveGroupMoveTarget({
        activeMemberId: "m1",
        groups: [{ groupNumber: 1, memberIds: ["m1", "m2", "m3"] }],
        over: { id: getMemberItemId("m3") },
      }),
    ).toEqual({
      targetGroupNumber: 1,
      targetIndex: 1,
    });
  });

  it("resolves an empty group column hover to the end of that group", () => {
    expect(
      resolveGroupMoveTarget({
        activeMemberId: "m2",
        groups,
        over: { id: getGroupDropId(3) },
      }),
    ).toEqual({
      targetGroupNumber: 3,
      targetIndex: 0,
    });
  });

  it("resolves an unassigned member hover onto an existing member", () => {
    expect(
      resolveGroupMoveTarget({
        activeMemberId: "m5",
        groups,
        over: { id: getMemberItemId("m4") },
      }),
    ).toEqual({
      targetGroupNumber: 2,
      targetIndex: 1,
    });
  });

  it("builds preview groups by shifting the hovered group to make room", () => {
    const target = resolveGroupMoveTarget({
      activeMemberId: "m1",
      groups,
      over: { id: getMemberItemId("m4") },
    });

    const previewGroups = moveMemberBetweenGroups(groups, {
      activeMemberId: "m1",
      targetGroupNumber: target?.targetGroupNumber ?? 2,
      targetIndex: target?.targetIndex ?? 0,
    });

    expect(previewGroups).toEqual([
      { groupNumber: 1, memberIds: ["m2"] },
      { groupNumber: 2, memberIds: ["m3", "m1", "m4"] },
      { groupNumber: 3, memberIds: [] },
    ]);
    expect(activityGroupsEqual(previewGroups, groups)).toBe(false);
  });

  it("appends an unassigned member when dropped on a group column", () => {
    expect(
      moveMemberBetweenGroups(groups, {
        activeMemberId: "m5",
        targetGroupNumber: 3,
        targetIndex: 0,
      }),
    ).toEqual([
      { groupNumber: 1, memberIds: ["m1", "m2"] },
      { groupNumber: 2, memberIds: ["m3", "m4"] },
      { groupNumber: 3, memberIds: ["m5"] },
    ]);
  });

  it("returns null for hovering the active member itself", () => {
    expect(
      resolveGroupMoveTarget({
        activeMemberId: "m1",
        groups,
        over: { id: getMemberItemId("m1") },
      }),
    ).toBeNull();
  });

  it("uses the last preview target when drop resolves to the active item", () => {
    expect(
      resolveCommittedGroupMoveTarget({
        activeMemberId: "m1",
        groups: [
          { groupNumber: 1, memberIds: ["m2"] },
          { groupNumber: 2, memberIds: ["m3", "m1", "m4"] },
          { groupNumber: 3, memberIds: [] },
        ],
        over: { id: getMemberItemId("m1") },
        previewMoveTarget: {
          targetGroupNumber: 2,
          targetIndex: 1,
        },
      }),
    ).toEqual({
      targetGroupNumber: 2,
      targetIndex: 1,
    });
  });
});
