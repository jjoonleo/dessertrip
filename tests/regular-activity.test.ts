import { afterEach, describe, expect, it, vi } from "vitest";
import { Types } from "mongoose";
import { deriveActivityName } from "../lib/activity";
import { ActivityModel } from "../lib/models/activity";
import { MemberModel } from "../lib/models/member";
import { getMemberParticipationStats } from "../lib/services/member-stats";
import { getActivity, updateActivity } from "../lib/services/activities";
import { createActivityInputSchema } from "../lib/validation";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Activity model", () => {
  it("rejects an invalid KST Saturday date for regular activities", async () => {
    expect(() =>
      createActivityInputSchema.parse({
        activityType: "regular",
        activityDate: "2026-03-13",
        area: "Gangnam",
        participantMemberIds: [new Types.ObjectId().toString()],
        groupConfig: {
          targetGroupCount: 1,
        },
        groups: [
          {
            groupNumber: 1,
            memberIds: [new Types.ObjectId().toString()],
          },
        ],
        groupGeneratedAt: new Date(),
      }),
    ).toThrow("errors.validation.activity.saturdayRequired");
  });

  it("accepts a weekday date for flash meetings without groups", async () => {
    expect(
      createActivityInputSchema.parse({
        activityType: "flash",
        activityDate: "2026-03-13",
        area: "Gangnam",
        participantMemberIds: [new Types.ObjectId().toString()],
        groupConfig: null,
        groups: [],
        groupGeneratedAt: null,
      }),
    ).toMatchObject({
      activityType: "flash",
      activityDate: "2026-03-13",
      groupConfig: null,
      groups: [],
      groupGeneratedAt: null,
    });
  });

  it("rejects duplicate participant IDs", async () => {
    const memberId = new Types.ObjectId().toString();

    expect(() =>
      createActivityInputSchema.parse({
        activityType: "regular",
        activityDate: "2026-03-14",
        area: "Gangnam",
        participantMemberIds: [memberId, memberId],
        groupConfig: {
          targetGroupCount: 1,
        },
        groups: [
          {
            groupNumber: 1,
            memberIds: [memberId],
          },
        ],
        groupGeneratedAt: new Date(),
      }),
    ).toThrow("errors.validation.activity.participantsUnique");
  });

  it("rejects grouped members that are not selected participants", async () => {
    const participantId = new Types.ObjectId();
    const outsiderId = new Types.ObjectId();
    const activity = new ActivityModel({
      activityType: "regular",
      activityDate: "2026-03-14",
      area: "Gangnam",
      participantMemberIds: [participantId],
      groupConfig: {
        targetGroupCount: 1,
      },
      groups: [
        {
          groupNumber: 1,
          memberIds: [outsiderId],
        },
      ],
      groupGeneratedAt: new Date(),
    });

    await expect(activity.validate()).rejects.toThrow(
      "errors.validation.activity.groupedMembersSelectedOnly",
    );
  });

  it("enforces uniqueness only for regular activities on the same date", async () => {
    const uniqueIndex = ActivityModel.schema
      .indexes()
      .find(([keys]: [Record<string, number>, Record<string, unknown>]) =>
        "activityDate" in keys,
      );

    expect(uniqueIndex?.[0]).toEqual({ activityDate: 1 });
    expect(uniqueIndex?.[1]).toMatchObject({
      unique: true,
      partialFilterExpression: {
        activityType: "regular",
      },
    });
  });

  it("derives weighted participation stats from activities and months", async () => {
    const memberA = new MemberModel({
      _id: new Types.ObjectId(),
      name: "Ari",
      gender: "female",
      isManager: false,
    });
    const memberB = new MemberModel({
      _id: new Types.ObjectId(),
      name: "Ben",
      gender: "male",
      isManager: false,
    });
    const memberC = new MemberModel({
      _id: new Types.ObjectId(),
      name: "Coco",
      gender: "female",
      isManager: false,
    });

    vi.spyOn(MemberModel, "find").mockReturnValue({
      sort: vi.fn().mockResolvedValue([memberA, memberB, memberC]),
    } as never);

    vi.spyOn(ActivityModel, "aggregate").mockResolvedValue([
      {
        _id: memberA._id,
        participationScore: 1.5,
        monthlyParticipationScores: [
          {
            month: "2026-02",
            participationScore: 0.5,
          },
          {
            month: "2026-03",
            participationScore: 1,
          },
        ],
      },
      {
        _id: memberB._id,
        participationScore: 1,
        monthlyParticipationScores: [
          {
            month: "2026-03",
            participationScore: 1,
          },
        ],
      },
      {
        _id: memberC._id,
        participationScore: 0.5,
        monthlyParticipationScores: [
          {
            month: "2026-02",
            participationScore: 0.5,
          },
        ],
      },
    ] as never);

    const stats = await getMemberParticipationStats();

    expect(stats).toEqual([
      expect.objectContaining({
        id: memberA._id.toString(),
        participationScore: 1.5,
        monthlyParticipationScores: {
          "2026-02": 0.5,
          "2026-03": 1,
        },
      }),
      expect.objectContaining({
        id: memberB._id.toString(),
        participationScore: 1,
        monthlyParticipationScores: {
          "2026-03": 1,
        },
      }),
      expect.objectContaining({
        id: memberC._id.toString(),
        participationScore: 0.5,
        monthlyParticipationScores: {
          "2026-02": 0.5,
        },
      }),
    ]);
  });

  it("locks activity type during updates", async () => {
    const activityId = new Types.ObjectId().toString();

    vi.spyOn(ActivityModel, "findById").mockResolvedValue(
      new ActivityModel({
        _id: new Types.ObjectId(activityId),
        activityType: "regular",
        activityDate: "2026-03-14",
        area: "Gangnam",
        participantMemberIds: [new Types.ObjectId()],
        groupConfig: {
          targetGroupCount: 1,
        },
        groups: [
          {
            groupNumber: 1,
            memberIds: [new Types.ObjectId()],
          },
        ],
        groupGeneratedAt: new Date(),
      }) as never,
    );

    await expect(
      updateActivity(activityId, {
        activityType: "flash",
      }),
    ).rejects.toThrow("errors.validation.activity.activityTypeLocked");
  });

  it("derives the activity display name from the date and area", async () => {
    expect(deriveActivityName("2026-03-14", "Gangnam")).toBe(
      "2026-03-14 Gangnam",
    );
  });

  it("returns null for invalid activity ids during edit lookup", async () => {
    await expect(getActivity("not-a-valid-id")).resolves.toBeNull();
  });
});
