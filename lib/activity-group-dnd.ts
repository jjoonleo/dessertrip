import type { ActivityGroup } from "./types/domain";

export type MoveGroupMemberInput = {
  activeMemberId: string;
  targetGroupNumber: number;
  targetIndex: number;
};

export type GroupMoveTarget = {
  targetGroupNumber: number;
  targetIndex: number;
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

export function parseMemberItemId(value: string | number) {
  return String(value).startsWith("member:") ? String(value).slice(7) : null;
}

export function parseGroupDropId(value: string | number) {
  return String(value).startsWith("group:") ? Number(String(value).slice(6)) : null;
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
  const targetGroup = nextGroups.find(
    (group) => group.groupNumber === input.targetGroupNumber,
  );

  if (!targetGroup) {
    return groups;
  }

  if (sourceGroup) {
    const sourceIndex = sourceGroup.memberIds.indexOf(input.activeMemberId);

    if (sourceIndex === -1) {
      return groups;
    }

    sourceGroup.memberIds.splice(sourceIndex, 1);
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

  const sourceGroup = findGroupForMember(groups, activeMemberId);
  const overMemberId = parseMemberItemId(over.id);

  if (overMemberId && overMemberId === activeMemberId) {
    return null;
  }

  if (overMemberId) {
    const overGroup = findGroupForMember(groups, overMemberId);

    if (!overGroup) {
      return null;
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
