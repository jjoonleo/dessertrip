import { Types } from "mongoose";
import { resolveActivityType } from "../activity";
import { ActivityModel, type ActivityDocument } from "../models/activity";
import { MemberModel } from "../models/member";
import {
  createActivityInputSchema,
  updateActivityInputSchema,
  type CreateActivityInput,
} from "../validation";
import { serializeActivity } from "./serializers";

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
    throw new Error("errors.validation.activity.memberReference");
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

function buildActivityPayload(input: CreateActivityInput) {
  if (input.activityType === "flash") {
    return {
      activityType: input.activityType,
      activityDate: input.activityDate,
      area: input.area,
      participantMemberIds: toObjectIds(input.participantMemberIds),
      groupConfig: null,
      groups: [],
      groupGeneratedAt: null,
    };
  }

  return {
    activityType: input.activityType,
    activityDate: input.activityDate,
    area: input.area,
    participantMemberIds: toObjectIds(input.participantMemberIds),
    groupConfig: input.groupConfig,
    groups: mapGroupsToObjectIds(input.groups),
    groupGeneratedAt: input.groupGeneratedAt ?? new Date(),
  };
}

function toValidationInput(activity: ActivityDocument): CreateActivityInput {
  const activityType = resolveActivityType(activity.activityType);

  return {
    activityType,
    activityDate: activity.activityDate,
    area: activity.area,
    participantMemberIds: activity.participantMemberIds.map((memberId) => memberId.toString()),
    groupConfig:
      activityType === "regular" && activity.groupConfig
        ? {
            targetGroupCount: activity.groupConfig.targetGroupCount,
          }
        : null,
    groups:
      activityType === "regular"
        ? activity.groups.map((group) => ({
            groupNumber: group.groupNumber,
            memberIds: group.memberIds.map((memberId) => memberId.toString()),
          }))
        : [],
    groupGeneratedAt:
      activityType === "regular" ? activity.groupGeneratedAt ?? null : null,
  };
}

export async function createActivity(input: unknown) {
  const validatedInput = createActivityInputSchema.parse(input);
  await assertAllMembersExist(validatedInput.participantMemberIds);

  const activity = await ActivityModel.create(buildActivityPayload(validatedInput));

  return serializeActivity(activity);
}

export async function updateActivity(id: string, input: unknown) {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  const validatedInput = updateActivityInputSchema.parse(input);
  const activity = await ActivityModel.findById(id);

  if (!activity) {
    return null;
  }

  const currentActivityType = resolveActivityType(activity.activityType);

  if (
    validatedInput.activityType !== undefined &&
    validatedInput.activityType !== currentActivityType
  ) {
    throw new Error("errors.validation.activity.activityTypeLocked");
  }

  const mergedInput = createActivityInputSchema.parse({
    ...toValidationInput(activity),
    ...validatedInput,
  });

  await assertAllMembersExist(mergedInput.participantMemberIds);

  activity.activityType = mergedInput.activityType;
  activity.activityDate = mergedInput.activityDate;
  activity.area = mergedInput.area;
  activity.participantMemberIds = toObjectIds(mergedInput.participantMemberIds);
  activity.groupConfig =
    mergedInput.activityType === "regular" ? mergedInput.groupConfig ?? null : null;
  activity.set(
    "groups",
    mergedInput.activityType === "regular"
      ? mapGroupsToObjectIds(mergedInput.groups)
      : [],
  );
  activity.groupGeneratedAt =
    mergedInput.activityType === "regular"
      ? mergedInput.groupGeneratedAt ?? new Date()
      : null;

  await activity.save();

  return serializeActivity(activity);
}

export async function deleteActivity(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    return false;
  }

  const deletedActivity = await ActivityModel.findByIdAndDelete(id);
  return deletedActivity !== null;
}

export async function listActivities() {
  const activities = await ActivityModel.find().sort({
    activityDate: -1,
    createdAt: -1,
    _id: -1,
  });

  return activities.map(serializeActivity);
}

export async function getActivity(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  const activity = await ActivityModel.findById(id);
  return activity ? serializeActivity(activity) : null;
}
