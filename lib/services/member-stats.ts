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
    }>([
      {
        $unwind: "$participantMemberIds",
      },
      {
        $group: {
          _id: "$participantMemberIds",
          participationScore: {
            $sum: {
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
      },
    ]),
  ]);

  const countByMemberId = new Map(
    counts.map((count) => [String(count._id), count.participationScore]),
  );

  return members.map((member) => ({
    id: member._id.toString(),
    name: member.name,
    gender: member.gender,
    isManager: member.isManager,
    archivedAt: member.archivedAt ? member.archivedAt.toISOString() : null,
    participationScore: countByMemberId.get(member._id.toString()) ?? 0,
  }));
}
