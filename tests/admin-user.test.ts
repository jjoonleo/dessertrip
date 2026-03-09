import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminUserModel } from "../lib/models/admin-user";
import { upsertPredefinedAdminUser } from "../lib/services/admin-users";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AdminUser model", () => {
  it("stores only passwordHash for the predefined admin account", async () => {
    const findOneAndUpdateSpy = vi
      .spyOn(AdminUserModel, "findOneAndUpdate")
      .mockResolvedValue(
        new AdminUserModel({
          username: "manager",
          passwordHash: "hashed-password",
        }) as never,
      );

    const adminUser = await upsertPredefinedAdminUser({
      username: "manager",
      password: "dessert-pass",
    });

    const updatePayload = findOneAndUpdateSpy.mock.calls[0]?.[1] as {
      passwordHash: string;
      password?: string;
    };

    expect(updatePayload.passwordHash).not.toBe("dessert-pass");
    expect("password" in updatePayload).toBe(false);
    expect(adminUser.passwordHash).toBe("hashed-password");
  });

  it("enforces a unique username", async () => {
    const uniqueIndex = AdminUserModel.schema
      .indexes()
      .find(([keys]: [Record<string, number>, Record<string, unknown>]) =>
        "username" in keys,
      );

    expect(uniqueIndex?.[0]).toEqual({ username: 1 });
    expect(uniqueIndex?.[1]).toMatchObject({ unique: true });
  });
});
