import type { AdminUser, Member, RegularActivity } from "../types/domain";
import type { AdminUserDocument } from "../models/admin-user";
import type { MemberDocument } from "../models/member";
import type { RegularActivityDocument } from "../models/regular-activity";
import { deriveRegularActivityName } from "../regular-activity";

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

export function serializeRegularActivity(
  regularActivity: RegularActivityDocument,
): RegularActivity {
  const targetGroupCount = normalizeTargetGroupCount(
    regularActivity.groupConfig?.targetGroupCount,
    regularActivity.groups.length,
  );

  return {
    id: regularActivity._id.toString(),
    activityDate: regularActivity.activityDate,
    area: regularActivity.area,
    participantMemberIds: regularActivity.participantMemberIds.map((memberId) =>
      memberId.toString(),
    ),
    groupConfig: {
      targetGroupCount,
    },
    groups: regularActivity.groups.map((group) => ({
      groupNumber: group.groupNumber,
      memberIds: group.memberIds.map((memberId) => memberId.toString()),
    })),
    groupGeneratedAt: regularActivity.groupGeneratedAt
      ? regularActivity.groupGeneratedAt.toISOString()
      : null,
    activityName: deriveRegularActivityName(
      regularActivity.activityDate,
      regularActivity.area,
    ),
  };
}
