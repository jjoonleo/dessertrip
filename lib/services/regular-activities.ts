import { Types } from "mongoose";
import { MemberModel } from "../models/member";
import { RegularActivityModel } from "../models/regular-activity";
import { createRegularActivityInputSchema, updateRegularActivityInputSchema } from "../validation";
import { serializeRegularActivity } from "./serializers";

function toObjectIds(values: string[]) {
  return values.map((value) => new Types.ObjectId(value));
}

async function assertAllMembersExist(memberIds: string[]) {
  if (memberIds.length === 0) {
    return;
  }

  const uniqueMemberIds = [...new Set(memberIds)];
  const memberCount = await MemberModel.countDocuments({
    _id: { $in: uniqueMemberIds.map((memberId) => new Types.ObjectId(memberId)) },
  });

  if (memberCount !== uniqueMemberIds.length) {
    throw new Error("Every participantMemberId must reference an existing member.");
  }
}

function mapGroupsToObjectIds(
  groups: Array<{ groupNumber: number; memberIds: string[] }>,
) {
  return groups.map((group) => ({
    groupNumber: group.groupNumber,
    memberIds: toObjectIds(group.memberIds),
  }));
}

export async function createRegularActivity(input: unknown) {
  const validatedInput = createRegularActivityInputSchema.parse(input);
  await assertAllMembersExist(validatedInput.participantMemberIds);

  const regularActivity = await RegularActivityModel.create({
    activityDate: validatedInput.activityDate,
    area: validatedInput.area,
    participantMemberIds: toObjectIds(validatedInput.participantMemberIds),
    groupConfig: validatedInput.groupConfig,
    groups: mapGroupsToObjectIds(validatedInput.groups),
    groupGeneratedAt:
      validatedInput.groups.length > 0
        ? validatedInput.groupGeneratedAt ?? new Date()
        : null,
  });

  return serializeRegularActivity(regularActivity);
}

export async function updateRegularActivity(id: string, input: unknown) {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  const validatedInput = updateRegularActivityInputSchema.parse(input);
  const regularActivity = await RegularActivityModel.findById(id);

  if (!regularActivity) {
    return null;
  }

  const nextParticipantMemberIds =
    validatedInput.participantMemberIds ?? regularActivity.participantMemberIds.map((memberId) => memberId.toString());

  await assertAllMembersExist(nextParticipantMemberIds);

  if (validatedInput.activityDate !== undefined) {
    regularActivity.activityDate = validatedInput.activityDate;
  }

  if (validatedInput.area !== undefined) {
    regularActivity.area = validatedInput.area;
  }

  if (validatedInput.participantMemberIds !== undefined) {
    regularActivity.participantMemberIds = toObjectIds(
      validatedInput.participantMemberIds,
    );
  }

  if (validatedInput.groupConfig !== undefined) {
    regularActivity.groupConfig = validatedInput.groupConfig;
  }

  if (validatedInput.groups !== undefined) {
    regularActivity.set("groups", mapGroupsToObjectIds(validatedInput.groups));
    regularActivity.groupGeneratedAt =
      validatedInput.groups.length > 0
        ? validatedInput.groupGeneratedAt ?? new Date()
        : null;
  } else if (validatedInput.groupGeneratedAt !== undefined) {
    regularActivity.groupGeneratedAt = validatedInput.groupGeneratedAt;
  }

  await regularActivity.save();

  return serializeRegularActivity(regularActivity);
}

export async function deleteRegularActivity(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    return false;
  }

  const deletedActivity = await RegularActivityModel.findByIdAndDelete(id);
  return deletedActivity !== null;
}

export async function listRegularActivities() {
  const regularActivities = await RegularActivityModel.find().sort({
    activityDate: -1,
    area: 1,
  });

  return regularActivities.map(serializeRegularActivity);
}

export async function getRegularActivity(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  const regularActivity = await RegularActivityModel.findById(id);
  return regularActivity ? serializeRegularActivity(regularActivity) : null;
}
