import mongoose, { Schema, type InferSchemaType, type HydratedDocument } from "mongoose";

const adminUserSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required."],
      trim: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: [true, "passwordHash is required."],
    },
  },
  {
    collection: "adminUsers",
    timestamps: true,
  },
);

adminUserSchema.index({ username: 1 }, { unique: true, name: "uniq_admin_username" });

export type AdminUserModelShape = InferSchemaType<typeof adminUserSchema>;
export type AdminUserDocument = HydratedDocument<AdminUserModelShape>;

export const AdminUserModel =
  (mongoose.models.AdminUser as mongoose.Model<AdminUserModelShape> | undefined) ??
  mongoose.model<AdminUserModelShape>("AdminUser", adminUserSchema);
