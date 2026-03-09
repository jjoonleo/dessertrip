import { afterEach, describe, expect, it, vi } from "vitest";
import { MemberModel } from "../lib/models/member";
import {
  archiveMember,
  listMembers,
  restoreMember,
  updateMember,
} from "../lib/services/members";
import {
  createMemberInputSchema,
  updateMemberInputSchema,
} from "../lib/validation";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Member model and services", () => {
  it("rejects a missing name", async () => {
    expect(() =>
      createMemberInputSchema.parse({
        name: "   ",
        gender: "male",
        isManager: false,
      }),
    ).toThrow("errors.validation.member.nameRequired");
  });

  it("rejects an invalid gender", async () => {
    expect(() =>
      createMemberInputSchema.parse({
        name: "Alex",
        gender: "other" as never,
        isManager: false,
      }),
    ).toThrow();
  });

  it("rejects a non-boolean isManager value", async () => {
    expect(() =>
      createMemberInputSchema.parse({
        name: "Alex",
        gender: "male",
        isManager: "true" as never,
      }),
    ).toThrow();
  });

  it("rejects an empty member update payload", () => {
    expect(() => updateMemberInputSchema.parse({})).toThrow(
      "errors.validation.member.updateRequired",
    );
  });

  it("defaults archivedAt to null for a valid member", async () => {
    const member = new MemberModel({
      name: "Mina",
      gender: "female",
      isManager: true,
    });

    await expect(member.validate()).resolves.toBeUndefined();
    expect(member.name).toBe("Mina");
    expect(member.gender).toBe("female");
    expect(member.isManager).toBe(true);
    expect(member.archivedAt ?? null).toBeNull();
  });

  it("updates member fields through the service", async () => {
    const member = new MemberModel({
      name: "Mina",
      gender: "female",
      isManager: true,
    });

    vi.spyOn(MemberModel, "findById").mockResolvedValue(member as never);
    vi.spyOn(member, "save").mockResolvedValue(member);

    const updated = await updateMember(member.id, {
      name: "Minji",
      gender: "male",
      isManager: false,
    });

    expect(updated).toMatchObject({
      id: member.id,
      name: "Minji",
      gender: "male",
      isManager: false,
      archivedAt: null,
    });
  });

  it("archives and restores a member", async () => {
    const member = new MemberModel({
      name: "Mina",
      gender: "female",
      isManager: false,
    });

    vi.spyOn(MemberModel, "findById").mockResolvedValue(member as never);
    vi.spyOn(member, "save").mockResolvedValue(member);

    const archived = await archiveMember(member.id);
    expect(archived?.archivedAt).not.toBeNull();

    const restored = await restoreMember(member.id);
    expect(restored?.archivedAt).toBeNull();
  });

  it("filters member listing queries by archive scope", async () => {
    const sortSpy = vi.fn().mockResolvedValue([]);
    const findSpy = vi.spyOn(MemberModel, "find").mockReturnValue({
      sort: sortSpy,
    } as never);

    await listMembers();
    await listMembers("archived");
    await listMembers("all");

    expect(findSpy).toHaveBeenNthCalledWith(1, { archivedAt: null });
    expect(findSpy).toHaveBeenNthCalledWith(2, { archivedAt: { $ne: null } });
    expect(findSpy).toHaveBeenNthCalledWith(3, {});
  });
});
