import { deriveActivityName, getActivityTypeConfig, resolveActivityType } from "../activity";
import type { Activity, AdminUser, Member } from "../types/domain";
import type { AdminUserDocument } from "../models/admin-user";
import type { ActivityDocument } from "../models/activity";
import type { MemberDocument } from "../models/member";

function normalizeTargetGroupCount(
  value: unknown,
  fallbackGroupCount: number,
) {
  const numericValue = Number(value);

  if (Number.isInteger(numericValue) && numericValue >= 1) {
    return numericValue;
  }

  return Math.max(1, fallbackGroupCount);
}

export function serializeMember(member: MemberDocument): Member {
  return {
    id: member._id.toString(),
    name: member.name,
    gender: member.gender,
    isManager: member.isManager,
    archivedAt: member.archivedAt ? member.archivedAt.toISOString() : null,
  };
}

export function serializeAdminUser(adminUser: AdminUserDocument): AdminUser {
  return {
    id: adminUser._id.toString(),
    username: adminUser.username,
    passwordHash: adminUser.passwordHash,
  };
}

export function serializeActivity(activity: ActivityDocument): Activity {
  const activityType = resolveActivityType(activity.activityType);
  const targetGroupCount = normalizeTargetGroupCount(
    activity.groupConfig?.targetGroupCount,
    activity.groups.length,
  );
  const baseActivity = {
    id: activity._id.toString(),
    activityType,
    activityDate: activity.activityDate,
    area: activity.area,
    participantMemberIds: activity.participantMemberIds.map((memberId) =>
      memberId.toString(),
    ),
    activityName: deriveActivityName(activity.activityDate, activity.area),
    participationWeight: getActivityTypeConfig(activityType).participationWeight,
  } as const;

  if (activityType === "flash") {
    return {
      ...baseActivity,
      activityType,
      groupConfig: null,
      groups: [],
      groupGeneratedAt: null,
    };
  }

  return {
    ...baseActivity,
    activityType,
    groupConfig: {
      targetGroupCount,
    },
    groups: activity.groups.map((group) => ({
      groupNumber: group.groupNumber,
      memberIds: group.memberIds.map((memberId) => memberId.toString()),
    })),
    groupGeneratedAt: activity.groupGeneratedAt
      ? activity.groupGeneratedAt.toISOString()
      : null,
    participationWeight: getActivityTypeConfig(activityType).participationWeight,
  };
}
