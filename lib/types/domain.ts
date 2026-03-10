export const genderValues = ["male", "female"] as const;
export const archiveFilterValues = ["active", "archived", "all"] as const;
export const activityTypeValues = ["regular", "flash"] as const;

export type Gender = (typeof genderValues)[number];
export type ArchiveFilter = (typeof archiveFilterValues)[number];
export type ActivityType = (typeof activityTypeValues)[number];

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

type ActivityBase = {
  id: string;
  activityType: ActivityType;
  activityDate: string;
  area: string;
  participantMemberIds: string[];
  activityName: string;
  participationWeight: number;
};

export type RegularActivity = ActivityBase & {
  activityType: "regular";
  groupConfig: {
    targetGroupCount: number;
  };
  groups: ActivityGroup[];
  groupGeneratedAt: string | null;
};

export type FlashActivity = ActivityBase & {
  activityType: "flash";
  groupConfig: null;
  groups: ActivityGroup[];
  groupGeneratedAt: null;
};

export type Activity = RegularActivity | FlashActivity;

export type AdminUser = {
  id: string;
  username: string;
  passwordHash: string;
};

export type MemberParticipationStat = Member & {
  participationScore: number;
};
