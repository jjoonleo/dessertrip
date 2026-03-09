import { compare, hash } from "bcryptjs";
import { AdminUserModel } from "../models/admin-user";
import { createAdminUserInputSchema } from "../validation";
import { serializeAdminUser } from "./serializers";

export async function upsertPredefinedAdminUser(input: {
  username: string;
  password: string;
}) {
  const validatedInput = createAdminUserInputSchema.parse(input);
  const passwordHash = await hash(validatedInput.password, 12);

  const adminUser = await AdminUserModel.findOneAndUpdate(
    { username: validatedInput.username },
    {
      username: validatedInput.username,
      passwordHash,
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    },
  );

  if (!adminUser) {
    throw new Error("Failed to seed the predefined admin user.");
  }

  return serializeAdminUser(adminUser);
}

export async function authenticateAdminUser(input: {
  username: string;
  password: string;
}) {
  const validatedInput = createAdminUserInputSchema.parse(input);
  const adminUser = await AdminUserModel.findOne({
    username: validatedInput.username,
  });

  if (!adminUser) {
    return null;
  }

  const passwordMatches = await compare(
    validatedInput.password,
    adminUser.passwordHash,
  );

  if (!passwordMatches) {
    return null;
  }

  return serializeAdminUser(adminUser);
}
