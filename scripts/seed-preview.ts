import { loadEnvConfig } from "@next/env";
import mongoose, { Types } from "mongoose";
import { isSaturdayInKst } from "../lib/activity";
import { ActivityModel } from "../lib/models/activity";
import { AdminUserModel } from "../lib/models/admin-user";
import { MemberModel } from "../lib/models/member";

loadEnvConfig(process.cwd());

const PREVIEW_DB_NAME = "dessertrip_preview";
const MEMBER_COUNT = 24;
const MANAGER_MEMBER_NUMBERS = new Set([1, 4, 7, 10, 13, 16]);
const ARCHIVED_MEMBER_NUMBERS = new Set([21, 22, 23, 24]);
const ARCHIVED_MEMBER_TIMESTAMPS = new Map<number, Date>([
  [21, new Date("2026-03-02T00:00:00.000Z")],
  [22, new Date("2026-03-03T00:00:00.000Z")],
  [23, new Date("2026-03-04T00:00:00.000Z")],
  [24, new Date("2026-03-05T00:00:00.000Z")],
]);

type MemberCode =
  | "01"
  | "02"
  | "03"
  | "04"
  | "05"
  | "06"
  | "07"
  | "08"
  | "09"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | "15"
  | "16"
  | "17"
  | "18"
  | "19"
  | "20"
  | "21"
  | "22"
  | "23"
  | "24";

type RegularActivitySeed = {
  activityType: "regular";
  activityDate: string;
  area: string;
  participantCodes: MemberCode[];
  targetGroupCount: number;
  groups: MemberCode[][];
};

type FlashActivitySeed = {
  activityType: "flash";
  activityDate: string;
  area: string;
  participantCodes: MemberCode[];
};

type ActivitySeed = RegularActivitySeed | FlashActivitySeed;

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value || value.trim().length === 0) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

function memberCode(memberNumber: number): MemberCode {
  if (!Number.isInteger(memberNumber) || memberNumber < 1 || memberNumber > MEMBER_COUNT) {
    throw new Error(`Invalid member number: ${memberNumber}`);
  }

  return String(memberNumber).padStart(2, "0") as MemberCode;
}

function createMemberId(memberNumber: number) {
  return new Types.ObjectId(memberNumber.toString(16).padStart(24, "0"));
}

function createRegularGroupGeneratedAt(activityDate: string) {
  const base = new Date(`${activityDate}T12:00:00.000Z`);

  if (Number.isNaN(base.getTime())) {
    throw new Error(`Invalid activity date: ${activityDate}`);
  }

  base.setUTCDate(base.getUTCDate() - 2);
  return base;
}

function buildMembers() {
  return Array.from({ length: MEMBER_COUNT }, (_, index) => {
    const memberNumber = index + 1;
    const code = memberCode(memberNumber);

    return {
      _id: createMemberId(memberNumber),
      name: `미리보기 멤버 ${code}`,
      gender: memberNumber % 2 === 1 ? ("female" as const) : ("male" as const),
      isManager: MANAGER_MEMBER_NUMBERS.has(memberNumber),
      archivedAt: ARCHIVED_MEMBER_NUMBERS.has(memberNumber)
        ? ARCHIVED_MEMBER_TIMESTAMPS.get(memberNumber) ?? null
        : null,
    };
  });
}

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, index) => memberCode(start + index));
}

function buildActivitySeeds(): ActivitySeed[] {
  return [
    {
      activityType: "regular",
      activityDate: "2026-01-17",
      area: "성수",
      participantCodes: range(1, 12),
      targetGroupCount: 3,
      groups: [range(1, 4), range(5, 8), range(9, 12)],
    },
    {
      activityType: "flash",
      activityDate: "2026-01-29",
      area: "고려대",
      participantCodes: ["03", "05", "07", "09", "11", "21", "22"],
    },
    {
      activityType: "regular",
      activityDate: "2026-02-14",
      area: "을지로3가",
      participantCodes: [
        "05",
        "06",
        "07",
        "08",
        "09",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "21",
        "22",
      ],
      targetGroupCount: 3,
      groups: [
        ["05", "06", "07", "08", "09"],
        ["10", "11", "12", "13", "14"],
        ["15", "16", "21", "22"],
      ],
    },
    {
      activityType: "flash",
      activityDate: "2026-02-26",
      area: "합정",
      participantCodes: ["08", "10", "12", "14", "16", "18", "23", "24"],
    },
    {
      activityType: "regular",
      activityDate: "2026-03-07",
      area: "잠실",
      participantCodes: [
        "01",
        "02",
        "03",
        "04",
        "05",
        "06",
        "07",
        "08",
        "09",
        "10",
        "11",
        "12",
        "13",
        "14",
        "17",
        "18",
      ],
      targetGroupCount: 4,
      groups: [
        ["01", "02", "03", "04"],
        ["05", "06", "07", "08"],
        ["09", "10", "11", "12"],
        ["13", "14", "17", "18"],
      ],
    },
    {
      activityType: "regular",
      activityDate: "2026-03-21",
      area: "건대입구",
      participantCodes: ["02", "04", "06", "08", "10", "12", "14", "16", "18", "20"],
      targetGroupCount: 2,
      groups: [
        ["02", "04", "06", "08", "10"],
        ["12", "14", "16", "18", "20"],
      ],
    },
  ];
}

function buildActivities(memberIdByCode: ReadonlyMap<MemberCode, Types.ObjectId>) {
  return buildActivitySeeds().map((activity) => {
    const participantMemberIds = activity.participantCodes.map((code) => {
      const memberId = memberIdByCode.get(code);

      if (!memberId) {
        throw new Error(`Missing member id for participant code ${code}`);
      }

      return memberId;
    });

    if (activity.activityType === "flash") {
      return {
        activityType: activity.activityType,
        activityDate: activity.activityDate,
        area: activity.area,
        participantMemberIds,
        groupConfig: null,
        groups: [],
        groupGeneratedAt: null,
      };
    }

    return {
      activityType: activity.activityType,
      activityDate: activity.activityDate,
      area: activity.area,
      participantMemberIds,
      groupConfig: {
        targetGroupCount: activity.targetGroupCount,
      },
      groups: activity.groups.map((group, index) => ({
        groupNumber: index + 1,
        memberIds: group.map((code) => {
          const memberId = memberIdByCode.get(code);

          if (!memberId) {
            throw new Error(`Missing member id for group member code ${code}`);
          }

          return memberId;
        }),
      })),
      groupGeneratedAt: createRegularGroupGeneratedAt(activity.activityDate),
    };
  });
}

async function verifyPreviewDataset() {
  const [adminUsers, members, activities] = await Promise.all([
    AdminUserModel.countDocuments(),
    MemberModel.find().sort({ name: 1, _id: 1 }).lean(),
    ActivityModel.find().sort({ activityDate: 1, _id: 1 }).lean(),
  ]);

  if (adminUsers !== 1) {
    throw new Error(`Expected 1 admin user in preview, found ${adminUsers}.`);
  }

  if (members.length !== MEMBER_COUNT) {
    throw new Error(`Expected ${MEMBER_COUNT} preview members, found ${members.length}.`);
  }

  if (activities.length !== 6) {
    throw new Error(`Expected 6 preview activities, found ${activities.length}.`);
  }

  const archivedMembers = members.filter((member) => member.archivedAt !== null);
  const managers = members.filter((member) => member.isManager);
  const regularActivities = activities.filter(
    (activity) => (activity.activityType ?? "regular") === "regular",
  );
  const flashActivities = activities.filter((activity) => activity.activityType === "flash");

  if (archivedMembers.length !== 4) {
    throw new Error(`Expected 4 archived preview members, found ${archivedMembers.length}.`);
  }

  if (managers.length !== 6) {
    throw new Error(`Expected 6 preview managers, found ${managers.length}.`);
  }

  if (regularActivities.length !== 4) {
    throw new Error(`Expected 4 regular preview activities, found ${regularActivities.length}.`);
  }

  if (flashActivities.length !== 2) {
    throw new Error(`Expected 2 flash preview activities, found ${flashActivities.length}.`);
  }

  const memberIdSet = new Set(members.map((member) => member._id.toString()));

  for (const activity of activities) {
    for (const participantMemberId of activity.participantMemberIds) {
      if (!memberIdSet.has(participantMemberId.toString())) {
        throw new Error(
          `Activity ${activity.activityDate} references missing member ${participantMemberId.toString()}.`,
        );
      }
    }
  }

  for (const activity of regularActivities) {
    if (!isSaturdayInKst(activity.activityDate)) {
      throw new Error(`Regular activity ${activity.activityDate} is not a Saturday.`);
    }

    const participantIds = activity.participantMemberIds.map((memberId) => memberId.toString());
    const groupedIds = activity.groups.flatMap((group) =>
      group.memberIds.map((memberId) => memberId.toString()),
    );

    if (new Set(groupedIds).size !== groupedIds.length) {
      throw new Error(`Regular activity ${activity.activityDate} assigns a member multiple times.`);
    }

    if (groupedIds.length !== participantIds.length) {
      throw new Error(`Regular activity ${activity.activityDate} does not cover all participants.`);
    }

    for (const participantId of participantIds) {
      if (!groupedIds.includes(participantId)) {
        throw new Error(
          `Regular activity ${activity.activityDate} is missing grouped participant ${participantId}.`,
        );
      }
    }

    if (activity.groupConfig?.targetGroupCount !== activity.groups.length) {
      throw new Error(
        `Regular activity ${activity.activityDate} target group count does not match group count.`,
      );
    }

    if (!activity.groupGeneratedAt) {
      throw new Error(`Regular activity ${activity.activityDate} is missing groupGeneratedAt.`);
    }
  }
}

async function main() {
  const uri = requireEnv("MONGODB_URI");

  await mongoose.connect(uri, {
    dbName: PREVIEW_DB_NAME,
  });

  const databaseName = mongoose.connection.db?.databaseName;

  if (databaseName !== PREVIEW_DB_NAME) {
    throw new Error(
      `Refusing to seed database "${databaseName ?? "unknown"}"; expected "${PREVIEW_DB_NAME}".`,
    );
  }

  await Promise.all([AdminUserModel.syncIndexes(), ActivityModel.syncIndexes()]);

  const previewMembers = buildMembers();
  const memberIdByCode = new Map<MemberCode, Types.ObjectId>(
    previewMembers.map((member, index) => [memberCode(index + 1), member._id]),
  );
  const previewActivities = buildActivities(memberIdByCode);

  const [deletedMembersResult, deletedActivitiesResult] = await Promise.all([
    MemberModel.deleteMany({}),
    ActivityModel.deleteMany({}),
  ]);

  await MemberModel.create(previewMembers);
  await ActivityModel.create(previewActivities);
  await verifyPreviewDataset();

  const [adminUserCount, memberCount, activityCount] = await Promise.all([
    AdminUserModel.countDocuments(),
    MemberModel.countDocuments(),
    ActivityModel.countDocuments(),
  ]);

  console.log(`Target database: ${databaseName}`);
  console.log(
    `Cleared preview data: members=${deletedMembersResult.deletedCount ?? 0}, regularActivities=${deletedActivitiesResult.deletedCount ?? 0}`,
  );
  console.log(
    `Inserted preview data: members=${previewMembers.length}, regularActivities=${previewActivities.length}`,
  );
  console.log(
    `Preview totals: adminUsers=${adminUserCount}, members=${memberCount}, regularActivities=${activityCount}`,
  );
}

main()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error(error);
    await mongoose.disconnect().catch(() => undefined);
    process.exit(1);
  });
