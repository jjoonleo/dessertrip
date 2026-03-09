import mongoose, { Schema, type InferSchemaType, type HydratedDocument } from "mongoose";

const memberSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "Gender is required."],
    },
    isManager: {
      type: Boolean,
      required: [true, "isManager is required."],
      set: (value: unknown) => {
        if (typeof value !== "boolean") {
          throw new mongoose.Error.CastError("Boolean", value, "isManager");
        }

        return value;
      },
    },
    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    collection: "members",
    timestamps: true,
  },
);

export type MemberModelShape = InferSchemaType<typeof memberSchema>;
export type MemberDocument = HydratedDocument<MemberModelShape>;

export const MemberModel =
  (mongoose.models.Member as mongoose.Model<MemberModelShape> | undefined) ??
  mongoose.model<MemberModelShape>("Member", memberSchema);
