import { MemberModel } from "../models/member";
import { RegularActivityModel } from "../models/regular-activity";
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
    RegularActivityModel.aggregate<{
      _id: unknown;
      participationCount: number;
    }>([
      {
        $unwind: "$participantMemberIds",
      },
      {
        $group: {
          _id: "$participantMemberIds",
          participationCount: { $sum: 1 },
        },
      },
    ]),
  ]);

  const countByMemberId = new Map(
    counts.map((count) => [String(count._id), count.participationCount]),
  );

  return members.map((member) => ({
    id: member._id.toString(),
    name: member.name,
    gender: member.gender,
    isManager: member.isManager,
    archivedAt: member.archivedAt ? member.archivedAt.toISOString() : null,
    participationCount: countByMemberId.get(member._id.toString()) ?? 0,
  }));
}
