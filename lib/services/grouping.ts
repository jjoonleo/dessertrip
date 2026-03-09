import type { ActivityGroup, Gender, Member } from "../types/domain";

type GroupDraft = {
  groupNumber: number;
  memberIds: string[];
  genderCounts: Record<Gender, number>;
};

function shuffle<T>(values: T[]) {
  const copy = [...values];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swapIndex];
    copy[swapIndex] = current;
  }

  return copy;
}

function createAssignmentOrder(members: Member[]) {
  const buckets: Record<Gender, Member[]> = {
    male: shuffle(members.filter((member) => member.gender === "male")),
    female: shuffle(members.filter((member) => member.gender === "female")),
  };

  const assignmentOrder: Member[] = [];
  let nextGender: Gender =
    buckets.male.length >= buckets.female.length ? "male" : "female";

  while (buckets.male.length > 0 || buckets.female.length > 0) {
    const preferredBucket = buckets[nextGender];
    const fallbackGender: Gender = nextGender === "male" ? "female" : "male";
    const nextMember =
      preferredBucket.shift() ?? buckets[fallbackGender].shift() ?? null;

    if (!nextMember) {
      break;
    }

    assignmentOrder.push(nextMember);

    if (buckets[nextGender].length < buckets[fallbackGender].length) {
      nextGender = fallbackGender;
    } else {
      nextGender = nextGender === "male" ? "female" : "male";
    }
  }

  return assignmentOrder;
}

function createGroupDrafts(targetGroupCount: number) {
  return Array.from({ length: targetGroupCount }, (_, index): GroupDraft => ({
    groupNumber: index + 1,
    memberIds: [],
    genderCounts: {
      male: 0,
      female: 0,
    },
  }));
}

function sortBySmallestGroup(left: GroupDraft, right: GroupDraft) {
  const sizeGap = left.memberIds.length - right.memberIds.length;

  if (sizeGap !== 0) {
    return sizeGap;
  }

  return left.groupNumber - right.groupNumber;
}

function assignManagers(drafts: GroupDraft[], managers: Member[]) {
  const shuffledManagers = shuffle(managers);

  shuffledManagers.forEach((manager, index) => {
    const targetDraft =
      index < drafts.length
        ? drafts[index]
        : [...drafts].sort(sortBySmallestGroup)[0];

    if (!targetDraft) {
      throw new Error("Failed to allocate managers into groups.");
    }

    targetDraft.memberIds.push(manager.id);
    targetDraft.genderCounts[manager.gender] += 1;
  });
}

function assignMembersWithBalance(drafts: GroupDraft[], members: Member[]) {
  const assignmentOrder = createAssignmentOrder(members);

  assignmentOrder.forEach((member) => {
    const eligibleDrafts = [...drafts].sort((left, right) => {
      const sameGenderGap =
        left.genderCounts[member.gender] - right.genderCounts[member.gender];

      if (sameGenderGap !== 0) {
        return sameGenderGap;
      }

      return sortBySmallestGroup(left, right);
    });

    const targetDraft = eligibleDrafts[0];

    if (!targetDraft) {
      throw new Error("Failed to allocate groups for the selected members.");
    }

    targetDraft.memberIds.push(member.id);
    targetDraft.genderCounts[member.gender] += 1;
  });
}

export function generateBalancedGroups(
  members: Member[],
  targetGroupCount: number,
): ActivityGroup[] {
  if (!Number.isInteger(targetGroupCount) || targetGroupCount < 1) {
    throw new Error("targetGroupCount must be an integer greater than or equal to 1.");
  }

  if (members.length === 0) {
    return [];
  }

  if (targetGroupCount > members.length) {
    throw new Error("targetGroupCount cannot be greater than the selected participants.");
  }

  const drafts = createGroupDrafts(targetGroupCount);
  const managers = members.filter((member) => member.isManager);
  const nonManagers = members.filter((member) => !member.isManager);

  assignManagers(drafts, managers);
  assignMembersWithBalance(drafts, nonManagers);

  return drafts.map((draft) => ({
    groupNumber: draft.groupNumber,
    memberIds: draft.memberIds,
  }));
}
