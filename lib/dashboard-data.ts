import { connectToDatabase } from "./mongodb";
import { getActivity, listActivities } from "./services/activities";
import { listMembers } from "./services/members";
import { getMemberParticipationStats } from "./services/member-stats";

export async function getOverviewSnapshot() {
  await connectToDatabase();

  const [members, activities] = await Promise.all([
    listMembers(),
    listActivities(),
  ]);

  return {
    memberCount: members.length,
    managerCount: members.filter((member) => member.isManager).length,
    activityCount: activities.length,
    latestActivity: activities[0] ?? null,
  };
}

export async function getMembersSnapshot() {
  await connectToDatabase();

  return {
    members: await listMembers("all"),
  };
}

export async function getActivityFormSnapshot(activityId?: string) {
  await connectToDatabase();

  if (!activityId) {
    return {
      members: await listMembers("active"),
      editingActivity: null,
    };
  }

  const [members, editingActivity] = await Promise.all([
    listMembers("all"),
    getActivity(activityId),
  ]);

  const visibleMembers = editingActivity
    ? members.filter(
        (member) =>
          member.archivedAt === null ||
          editingActivity.participantMemberIds.includes(member.id),
      )
    : members.filter((member) => member.archivedAt === null);

  return {
    members: visibleMembers,
    editingActivity,
  };
}

export async function getActivitiesSnapshot() {
  await connectToDatabase();

  const [members, activities] = await Promise.all([
    listMembers("all"),
    listActivities(),
  ]);

  return {
    members,
    activities,
  };
}

export async function getStatsSnapshot() {
  await connectToDatabase();

  return {
    stats: await getMemberParticipationStats("all"),
  };
}

export async function getMemberParticipationHistorySnapshot(memberId: string) {
  await connectToDatabase();

  const [members, activities] = await Promise.all([
    listMembers("all"),
    listActivities(),
  ]);

  const member = members.find((currentMember) => currentMember.id === memberId) ?? null;

  if (!member) {
    return {
      member: null,
      activities: [],
    };
  }

  return {
    member,
    activities: activities.filter((activity) =>
      activity.participantMemberIds.includes(memberId),
    ),
  };
}
