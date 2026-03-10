import { connectToDatabase } from "./mongodb";
import { getActivity, listActivities } from "./services/activities";
import { listMembers } from "./services/members";
import { getMemberParticipationStats } from "./services/member-stats";
import type { Activity, Member } from "./types/domain";
import type { StatsMonthKey } from "./stats";

function getReferencedActivityMembers(members: Member[], activity: Activity) {
  const groupMemberIds =
    activity.groups?.flatMap((group) => group.memberIds ?? []) ?? [];
  const referencedMemberIds = new Set([
    ...activity.participantMemberIds,
    ...groupMemberIds,
  ]);

  return members.filter((member) => referencedMemberIds.has(member.id));
}

function getEditableActivityMembers(members: Member[], activity: Activity) {
  const referencedMemberIds = new Set<string>([
    ...activity.participantMemberIds,
    ...((activity as any).groups ?? []).flatMap(
      (group: any) => group.memberIds ?? [],
    ),
  ]);

  return members.filter(
    (member) =>
      member.archivedAt === null ||
      referencedMemberIds.has(member.id),
  );
}

async function getExistingActivitySnapshot(activityId: string) {
  const [members, activity] = await Promise.all([
    listMembers("all"),
    getActivity(activityId),
  ]);

  return {
    members,
    activity,
  };
}

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

  const { members, activity } = await getExistingActivitySnapshot(activityId);
  const visibleMembers = activity
    ? getEditableActivityMembers(members, activity)
    : members.filter((member) => member.archivedAt === null);

  return {
    members: visibleMembers,
    editingActivity: activity,
  };
}

export async function getActivityDetailSnapshot(activityId: string) {
  await connectToDatabase();

  const { members, activity } = await getExistingActivitySnapshot(activityId);

  return {
    activity,
    members: activity ? getReferencedActivityMembers(members, activity) : [],
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

export async function getMemberParticipationHistorySnapshot(
  memberId: string,
  selectedMonth?: StatsMonthKey,
) {
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
      availableMonths: [],
    };
  }

  const memberActivities = activities.filter((activity) =>
    activity.participantMemberIds.includes(memberId),
  );

  return {
    member,
    activities: memberActivities.filter(
      (activity) =>
        (selectedMonth === undefined || activity.activityDate.slice(0, 7) === selectedMonth),
    ),
    availableMonths: [...new Set(
      memberActivities.map((activity) => activity.activityDate.slice(0, 7) as StatsMonthKey),
    )].sort((left, right) => right.localeCompare(left)),
  };
}
