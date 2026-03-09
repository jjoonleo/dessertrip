import mongoose, { Schema, type InferSchemaType, type HydratedDocument } from "mongoose";

const memberSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "errors.validation.member.nameRequired"],
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "errors.validation.member.genderRequired"],
    },
    isManager: {
      type: Boolean,
      required: [true, "errors.validation.member.isManagerRequired"],
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
