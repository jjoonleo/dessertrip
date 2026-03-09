import { afterEach, describe, expect, it, vi } from "vitest";
import { Types } from "mongoose";
import { MemberModel } from "../lib/models/member";
import { RegularActivityModel } from "../lib/models/regular-activity";
import { getMemberParticipationStats } from "../lib/services/member-stats";
import { getRegularActivity } from "../lib/services/regular-activities";
import { deriveRegularActivityName } from "../lib/regular-activity";
import { createRegularActivityInputSchema } from "../lib/validation";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("RegularActivity model", () => {
  it("rejects an invalid KST Saturday date", async () => {
    expect(() =>
      createRegularActivityInputSchema.parse({
        activityDate: "2026-03-13",
        area: "Gangnam",
        participantMemberIds: [new Types.ObjectId().toString()],
        groupConfig: {
          targetGroupSize: 2,
        },
      }),
    ).toThrow("activityDate must be a Saturday in KST.");
  });

  it("rejects duplicate participant IDs", async () => {
    const memberId = new Types.ObjectId().toString();

    expect(() =>
      createRegularActivityInputSchema.parse({
        activityDate: "2026-03-14",
        area: "Gangnam",
        participantMemberIds: [memberId, memberId],
        groupConfig: {
          targetGroupSize: 2,
        },
      }),
    ).toThrow("participantMemberIds must be unique.");
  });

  it("rejects grouped members that are not selected participants", async () => {
    const participantId = new Types.ObjectId();
    const outsiderId = new Types.ObjectId();
    const activity = new RegularActivityModel({
      activityDate: "2026-03-14",
      area: "Gangnam",
      participantMemberIds: [participantId],
      groupConfig: {
        targetGroupSize: 2,
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
      "Grouped members must also be selected participants.",
    );
  });

  it("enforces one activity per Saturday", async () => {
    const uniqueIndex = RegularActivityModel.schema
      .indexes()
      .find(([keys]: [Record<string, number>, Record<string, unknown>]) =>
        "activityDate" in keys,
      );

    expect(uniqueIndex?.[0]).toEqual({ activityDate: 1 });
    expect(uniqueIndex?.[1]).toMatchObject({ unique: true });
  });

  it("derives participation stats from activities after create, update, and delete", async () => {
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

    vi.spyOn(RegularActivityModel, "aggregate")
      .mockResolvedValueOnce([
        { _id: memberA._id, participationCount: 2 },
        { _id: memberB._id, participationCount: 1 },
        { _id: memberC._id, participationCount: 1 },
      ] as never)
      .mockResolvedValueOnce([
        { _id: memberA._id, participationCount: 1 },
        { _id: memberB._id, participationCount: 2 },
        { _id: memberC._id, participationCount: 1 },
      ] as never)
      .mockResolvedValueOnce([
        { _id: memberB._id, participationCount: 1 },
        { _id: memberC._id, participationCount: 1 },
      ] as never);

    const statsAfterCreate = await getMemberParticipationStats();
    expect(statsAfterCreate).toEqual([
      expect.objectContaining({
        id: memberA._id.toString(),
        participationCount: 2,
      }),
      expect.objectContaining({
        id: memberB._id.toString(),
        participationCount: 1,
      }),
      expect.objectContaining({
        id: memberC._id.toString(),
        participationCount: 1,
      }),
    ]);

    const statsAfterUpdate = await getMemberParticipationStats();
    expect(statsAfterUpdate).toEqual([
      expect.objectContaining({
        id: memberA._id.toString(),
        participationCount: 1,
      }),
      expect.objectContaining({
        id: memberB._id.toString(),
        participationCount: 2,
      }),
      expect.objectContaining({
        id: memberC._id.toString(),
        participationCount: 1,
      }),
    ]);

    const statsAfterDelete = await getMemberParticipationStats();
    expect(statsAfterDelete).toEqual([
      expect.objectContaining({
        id: memberA._id.toString(),
        participationCount: 0,
      }),
      expect.objectContaining({
        id: memberB._id.toString(),
        participationCount: 1,
      }),
      expect.objectContaining({
        id: memberC._id.toString(),
        participationCount: 1,
      }),
    ]);
  });

  it("derives the activity display name from the date and area", async () => {
    expect(deriveRegularActivityName("2026-03-14", "Gangnam")).toBe(
      "2026-03-14 Gangnam",
    );
  });

  it("returns null for invalid activity ids during edit lookup", async () => {
    await expect(getRegularActivity("not-a-valid-id")).resolves.toBeNull();
  });
});
