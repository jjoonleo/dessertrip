import { connectToDatabase } from "./mongodb";
import { getRegularActivity, listRegularActivities } from "./services/regular-activities";
import { listMembers } from "./services/members";
import { getMemberParticipationStats } from "./services/member-stats";

export async function getOverviewSnapshot() {
  await connectToDatabase();

  const [members, activities] = await Promise.all([
    listMembers(),
    listRegularActivities(),
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

export async function getActivityBuilderSnapshot(activityId?: string) {
  await connectToDatabase();

  if (!activityId) {
    return {
      members: await listMembers("active"),
      editingActivity: null,
    };
  }

  const [members, editingActivity] = await Promise.all([
    listMembers("all"),
    getRegularActivity(activityId),
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
    listRegularActivities(),
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
