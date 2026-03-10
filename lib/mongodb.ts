import mongoose from "mongoose";
import { ensureActivityCollectionMigrated } from "./activity-migrations";

type MongooseCache = {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  uri: string | null;
};

declare global {
  var __mongooseCache__: MongooseCache | undefined;
}

const globalCache = globalThis.__mongooseCache__ ?? {
  connection: null,
  promise: null,
  uri: null,
};

globalThis.__mongooseCache__ = globalCache;

export async function connectToDatabase(uri = process.env.MONGODB_URI) {
  if (!uri || uri.trim().length === 0) {
    throw new Error("MONGODB_URI is required.");
  }

  if (globalCache.connection && globalCache.uri === uri) {
    return globalCache.connection;
  }

  if (!globalCache.promise || globalCache.uri !== uri) {
    globalCache.uri = uri;
    globalCache.promise = mongoose.connect(uri).catch((error) => {
      globalCache.promise = null;
      throw error;
    });
  }

  globalCache.connection = await globalCache.promise;
  await ensureActivityCollectionMigrated();
  return globalCache.connection;
}
