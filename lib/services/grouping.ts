import type { ActivityGroup, Gender, Member } from "../types/domain";

type GroupDraft = {
  groupNumber: number;
  memberIds: string[];
  genderCounts: Record<Gender, number>;
  capacity: number;
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

function createGroupDrafts(totalMembers: number, targetGroupSize: number) {
  const groupCount = Math.ceil(totalMembers / targetGroupSize);
  const baseSize = Math.floor(totalMembers / groupCount);
  const remainder = totalMembers % groupCount;

  return Array.from({ length: groupCount }, (_, index): GroupDraft => ({
    groupNumber: index + 1,
    memberIds: [],
    genderCounts: {
      male: 0,
      female: 0,
    },
    capacity: baseSize + (index < remainder ? 1 : 0),
  }));
}

export function generateBalancedGroups(
  members: Member[],
  targetGroupSize: number,
): ActivityGroup[] {
  if (!Number.isInteger(targetGroupSize) || targetGroupSize < 2) {
    throw new Error("targetGroupSize must be an integer greater than or equal to 2.");
  }

  if (members.length === 0) {
    return [];
  }

  const drafts = createGroupDrafts(members.length, targetGroupSize);
  const assignmentOrder = createAssignmentOrder(members);

  assignmentOrder.forEach((member) => {
    const eligibleDrafts = drafts.filter(
      (draft) => draft.memberIds.length < draft.capacity,
    );

    eligibleDrafts.sort((left, right) => {
      const sameGenderGap =
        left.genderCounts[member.gender] - right.genderCounts[member.gender];

      if (sameGenderGap !== 0) {
        return sameGenderGap;
      }

      const sizeGap = left.memberIds.length - right.memberIds.length;

      if (sizeGap !== 0) {
        return sizeGap;
      }

      return left.groupNumber - right.groupNumber;
    });

    const targetDraft = eligibleDrafts[0];

    if (!targetDraft) {
      throw new Error("Failed to allocate groups for the selected members.");
    }

    targetDraft.memberIds.push(member.id);
    targetDraft.genderCounts[member.gender] += 1;
  });

  return drafts.map((draft) => ({
    groupNumber: draft.groupNumber,
    memberIds: draft.memberIds,
  }));
}
