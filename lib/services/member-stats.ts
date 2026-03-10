import { MemberModel } from "../models/member";
import { ActivityModel } from "../models/activity";
import type { ArchiveFilter, MemberParticipationStat } from "../types/domain";

function getMemberArchiveQuery(archiveFilter: ArchiveFilter) {
  if (archiveFilter === "archived") {
    return {
      archivedAt: { $ne: null },
    };
  }

  if (archiveFilter === "active") {
    return {
      archivedAt: null,
    };
  }

  return {};
}

export async function getMemberParticipationStats(): Promise<
  MemberParticipationStat[]
>;
export async function getMemberParticipationStats(
  archiveFilter: ArchiveFilter,
): Promise<MemberParticipationStat[]>;
export async function getMemberParticipationStats(
  archiveFilter: ArchiveFilter = "active",
): Promise<MemberParticipationStat[]> {
  const [members, counts] = await Promise.all([
    MemberModel.find(getMemberArchiveQuery(archiveFilter)).sort({ name: 1, _id: 1 }),
    ActivityModel.aggregate<{
      _id: unknown;
      participationScore: number;
      monthlyParticipationScores: Array<{
        month: string;
        participationScore: number;
      }>;
    }>([
      {
        $unwind: "$participantMemberIds",
      },
      {
        $project: {
          participantMemberId: "$participantMemberIds",
          activityMonth: {
            $substrBytes: ["$activityDate", 0, 7],
          },
          participationIncrement: {
            $cond: [
              {
                $eq: [{ $ifNull: ["$activityType", "regular"] }, "flash"],
              },
              0.5,
              1,
            ],
          },
        },
      },
      {
        $group: {
          _id: {
            memberId: "$participantMemberId",
            month: "$activityMonth",
          },
          participationScore: { $sum: "$participationIncrement" },
        },
      },
      {
        $group: {
          _id: "$_id.memberId",
          participationScore: { $sum: "$participationScore" },
          monthlyParticipationScores: {
            $push: {
              month: "$_id.month",
              participationScore: "$participationScore",
            },
          },
        },
      },
    ]),
  ]);

  const countByMemberId = new Map(
    counts.map((count) => [
      String(count._id),
      {
        participationScore: count.participationScore,
        monthlyParticipationScores: Object.fromEntries(
          count.monthlyParticipationScores.map((monthCount) => [
            monthCount.month,
            monthCount.participationScore,
          ]),
        ),
      },
    ]),
  );

  return members.map((member) => {
    const memberCounts = countByMemberId.get(member._id.toString());

    return {
      id: member._id.toString(),
      name: member.name,
      gender: member.gender,
      isManager: member.isManager,
      archivedAt: member.archivedAt ? member.archivedAt.toISOString() : null,
      participationScore: memberCounts?.participationScore ?? 0,
      monthlyParticipationScores: memberCounts?.monthlyParticipationScores ?? {},
    };
  });
}
