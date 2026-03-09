import type { AdminUser, Member, RegularActivity } from "../types/domain";
import type { AdminUserDocument } from "../models/admin-user";
import type { MemberDocument } from "../models/member";
import type { RegularActivityDocument } from "../models/regular-activity";
import { deriveRegularActivityName } from "../regular-activity";

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
  return {
    id: regularActivity._id.toString(),
    activityDate: regularActivity.activityDate,
    area: regularActivity.area,
    participantMemberIds: regularActivity.participantMemberIds.map((memberId) =>
      memberId.toString(),
    ),
    groupConfig: {
      targetGroupSize: regularActivity.groupConfig.targetGroupSize,
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
