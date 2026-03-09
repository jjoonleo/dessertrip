export const genderValues = ["male", "female"] as const;
export const archiveFilterValues = ["active", "archived", "all"] as const;

export type Gender = (typeof genderValues)[number];
export type ArchiveFilter = (typeof archiveFilterValues)[number];

export type Member = {
  id: string;
  name: string;
  gender: Gender;
  isManager: boolean;
  archivedAt: string | null;
};

export type ActivityGroup = {
  groupNumber: number;
  memberIds: string[];
};

export type RegularActivity = {
  id: string;
  activityDate: string;
  area: string;
  participantMemberIds: string[];
  groupConfig: {
    targetGroupCount: number;
  };
  groups: ActivityGroup[];
  groupGeneratedAt: string | null;
  activityName: string;
};

export type AdminUser = {
  id: string;
  username: string;
  passwordHash: string;
};

export type MemberParticipationStat = Member & {
  participationCount: number;
};
