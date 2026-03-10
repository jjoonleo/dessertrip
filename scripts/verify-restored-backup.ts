import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";

loadEnvConfig(process.cwd());

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value || value.trim().length === 0) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

async function main() {
  const uri = requireEnv("MONGODB_URI");
  const requiredAdminUsername = process.env.REQUIRED_ADMIN_USERNAME ?? "admin";
  const requiredCollections = (process.env.REQUIRED_COLLECTIONS ?? "adminUsers")
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  await mongoose.connect(uri);

  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("Database connection was not established.");
  }

  const collectionInfos = await db
    .listCollections({}, { nameOnly: true })
    .toArray();
  const collectionNames = new Set(collectionInfos.map((collection) => collection.name));

  for (const collectionName of requiredCollections) {
    if (!collectionNames.has(collectionName)) {
      throw new Error(`Required collection "${collectionName}" was not restored.`);
    }
  }

  const adminUser = await db.collection("adminUsers").findOne(
    { username: requiredAdminUsername },
    { projection: { username: 1, passwordHash: 1 } },
  );

  if (!adminUser) {
    throw new Error(`Admin user "${requiredAdminUsername}" was not found in the restored backup.`);
  }

  if (
    !("passwordHash" in adminUser) ||
    typeof adminUser.passwordHash !== "string" ||
    adminUser.passwordHash.length === 0
  ) {
    throw new Error("Restored admin user is missing passwordHash.");
  }

  const optionalCollectionCounts = await Promise.all(
    ["members", "regularActivities"].map(async (collectionName) => {
      if (!collectionNames.has(collectionName)) {
        return `${collectionName}=missing`;
      }

      const count = await db.collection(collectionName).countDocuments();
      return `${collectionName}=${count}`;
    }),
  );

  console.log(
    `Verified restored backup. Collections: ${[...collectionNames].sort().join(", ")}`,
  );
  console.log(
    `Verified adminUsers contains "${requiredAdminUsername}" with passwordHash present.`,
  );
  console.log(`Optional collections: ${optionalCollectionCounts.join(", ")}`);
}

main()
  .then(async () => {
    await mongoose.disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await mongoose.disconnect().catch(() => undefined);
    process.exit(1);
  });
