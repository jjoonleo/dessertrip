import mongoose from "mongoose";
import { ActivityModel } from "./models/activity";

declare global {
  var __activityMigrationPromise__: Promise<void> | undefined;
}

export async function ensureActivityCollectionMigrated() {
  if (globalThis.__activityMigrationPromise__) {
    return globalThis.__activityMigrationPromise__;
  }

  globalThis.__activityMigrationPromise__ = (async () => {
    if (mongoose.connection.readyState !== 1) {
      return;
    }

    await ActivityModel.updateMany(
      {
        activityType: { $exists: false },
      },
      {
        $set: {
          activityType: "regular",
        },
      },
    );

    await ActivityModel.syncIndexes();
  })().catch((error) => {
    globalThis.__activityMigrationPromise__ = undefined;
    throw error;
  });

  return globalThis.__activityMigrationPromise__;
}
