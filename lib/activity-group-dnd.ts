import type { ActivityGroup } from "./types/domain";

export type MoveGroupMemberInput = {
  activeMemberId: string;
} & (
  | {
      type: "existing-group";
      targetGroupNumber: number;
      targetIndex: number;
    }
  | {
      type: "new-group";
      targetIndex: 0;
    }
  | {
      type: "unassigned";
    }
);

export type GroupMoveTarget =
  | {
      type: "existing-group";
      targetGroupNumber: number;
      targetIndex: number;
    }
  | {
      type: "new-group";
      targetIndex: 0;
    }
  | {
      type: "unassigned";
    };

type DragOverTarget = {
  id: string | number;
} | null | undefined;

export function getMemberItemId(memberId: string) {
  return `member:${memberId}`;
}

export function getGroupDropId(groupNumber: number) {
  return `group:${groupNumber}`;
}

export function getAddGroupDropId() {
  return "group:add";
}

export function getUnassignedDropId() {
  return "group:unassigned";
}

export function parseMemberItemId(value: string | number) {
  return String(value).startsWith("member:") ? String(value).slice(7) : null;
}

export function parseGroupDropId(value: string | number) {
  return String(value).startsWith("group:") ? Number(String(value).slice(6)) : null;
}

export function isAddGroupDropId(value: string | number) {
  return String(value) === getAddGroupDropId();
}

export function isUnassignedDropId(value: string | number) {
  return String(value) === getUnassignedDropId();
}

export function findGroupForMember(groups: ActivityGroup[], memberId: string) {
  return groups.find((group) => group.memberIds.includes(memberId)) ?? null;
}

export function moveMemberBetweenGroups(
  groups: ActivityGroup[],
  input: MoveGroupMemberInput,
): ActivityGroup[] {
  const nextGroups = groups.map((group) => ({
    ...group,
    memberIds: [...group.memberIds],
  }));

  const sourceGroup = nextGroups.find((group) =>
    group.memberIds.includes(input.activeMemberId),
  );

  if (sourceGroup) {
    const sourceIndex = sourceGroup.memberIds.indexOf(input.activeMemberId);

    if (sourceIndex === -1) {
      return groups;
    }

    sourceGroup.memberIds.splice(sourceIndex, 1);
  }

  if (input.type === "new-group") {
    nextGroups.push({
      groupNumber: nextGroups.length + 1,
      memberIds: [input.activeMemberId],
    });

    return nextGroups;
  }

  if (input.type === "unassigned") {
    return nextGroups;
  }

  const targetGroup = nextGroups.find(
    (group) => group.groupNumber === input.targetGroupNumber,
  );

  if (!targetGroup) {
    return groups;
  }

  const boundedTargetIndex = Math.max(
    0,
    Math.min(input.targetIndex, targetGroup.memberIds.length),
  );
  targetGroup.memberIds.splice(boundedTargetIndex, 0, input.activeMemberId);

  return nextGroups;
}

export function resolveGroupMoveTarget(params: {
  activeMemberId: string;
  groups: ActivityGroup[];
  over: DragOverTarget;
}): GroupMoveTarget | null {
  const { activeMemberId, groups, over } = params;

  if (!over) {
    return null;
  }

  if (isAddGroupDropId(over.id)) {
    return {
      type: "new-group",
      targetIndex: 0,
    };
  }

  const sourceGroup = findGroupForMember(groups, activeMemberId);

  if (isUnassignedDropId(over.id)) {
    return sourceGroup
      ? {
          type: "unassigned",
        }
      : null;
  }

  const overMemberId = parseMemberItemId(over.id);

  if (overMemberId && overMemberId === activeMemberId) {
    return null;
  }

  if (overMemberId) {
    const overGroup = findGroupForMember(groups, overMemberId);

    if (!overGroup) {
      return sourceGroup
        ? {
            type: "unassigned",
          }
        : null;
    }

    const sourceIndex = sourceGroup?.memberIds.indexOf(activeMemberId) ?? -1;
    const overIndex = overGroup.memberIds.indexOf(overMemberId);
    const targetIndex =
      sourceGroup &&
      sourceGroup.groupNumber === overGroup.groupNumber &&
      sourceIndex < overIndex
        ? overIndex - 1
        : overIndex;

    return {
      type: "existing-group",
      targetGroupNumber: overGroup.groupNumber,
      targetIndex,
    };
  }

  const overGroupNumber = parseGroupDropId(over.id);

  if (overGroupNumber === null) {
    return null;
  }

  const overGroup = groups.find((group) => group.groupNumber === overGroupNumber);

  if (!overGroup) {
    return null;
  }

  return {
    type: "existing-group",
    targetGroupNumber: overGroup.groupNumber,
    targetIndex: overGroup.memberIds.length,
  };
}

export function resolveCommittedGroupMoveTarget(params: {
  activeMemberId: string;
  groups: ActivityGroup[];
  over: DragOverTarget;
  previewMoveTarget: GroupMoveTarget | null;
}) {
  return (
    resolveGroupMoveTarget({
      activeMemberId: params.activeMemberId,
      groups: params.groups,
      over: params.over,
    }) ?? params.previewMoveTarget
  );
}

export function activityGroupsEqual(
  left: ActivityGroup[] | null,
  right: ActivityGroup[] | null,
) {
  if (left === right) {
    return true;
  }

  if (!left || !right || left.length !== right.length) {
    return false;
  }

  return left.every((group, index) => {
    const other = right[index];

    if (
      group.groupNumber !== other.groupNumber ||
      group.memberIds.length !== other.memberIds.length
    ) {
      return false;
    }

    return group.memberIds.every((memberId, memberIndex) => {
      return memberId === other.memberIds[memberIndex];
    });
  });
}
