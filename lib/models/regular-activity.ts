import mongoose, { Schema, Types, type InferSchemaType, type HydratedDocument } from "mongoose";
import { isSaturdayInKst, isValidDateOnlyString } from "../regular-activity";

function toObjectIdStrings(values: Types.ObjectId[]) {
  return values.map((value) => value.toString());
}

function hasUniqueObjectIds(values: Types.ObjectId[]) {
  return new Set(toObjectIdStrings(values)).size === values.length;
}

const regularActivityGroupSchema = new Schema(
  {
    groupNumber: {
      type: Number,
      required: [true, "groupNumber is required."],
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "groupNumber must be an integer.",
      },
    },
    memberIds: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Member",
          required: true,
        },
      ],
      default: [],
    },
  },
  {
    _id: false,
  },
);

const groupConfigSchema = new Schema(
  {
    targetGroupSize: {
      type: Number,
      required: [true, "targetGroupSize is required."],
      min: 2,
      validate: {
        validator: Number.isInteger,
        message: "targetGroupSize must be an integer.",
      },
    },
  },
  {
    _id: false,
  },
);

const regularActivitySchema = new Schema(
  {
    activityDate: {
      type: String,
      required: [true, "activityDate is required."],
      validate: [
        {
          validator: isValidDateOnlyString,
          message: "activityDate must use YYYY-MM-DD.",
        },
        {
          validator: isSaturdayInKst,
          message: "activityDate must be a Saturday in KST.",
        },
      ],
    },
    area: {
      type: String,
      required: [true, "Area is required."],
      trim: true,
    },
    participantMemberIds: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Member",
          required: true,
        },
      ],
      default: [],
    },
    groupConfig: {
      type: groupConfigSchema,
      required: true,
    },
    groups: {
      type: [regularActivityGroupSchema],
      default: [],
    },
    groupGeneratedAt: {
      type: Date,
      default: null,
    },
  },
  {
    collection: "regularActivities",
    timestamps: true,
  },
);

regularActivitySchema.index(
  { activityDate: 1 },
  { unique: true, name: "uniq_regular_activity_date" },
);

regularActivitySchema.pre("validate", function validateRegularActivity() {
  const participantIds = toObjectIdStrings(this.participantMemberIds);

  if (new Set(participantIds).size !== participantIds.length) {
    this.invalidate(
      "participantMemberIds",
      "participantMemberIds must be unique.",
    );
  }

  const participantIdSet = new Set(participantIds);
  const groupedMemberIds: string[] = [];
  const groupNumbers = new Set<number>();

  this.groups.forEach((group, index) => {
    if (groupNumbers.has(group.groupNumber)) {
      this.invalidate(`groups.${index}.groupNumber`, "groupNumber must be unique.");
    }

    groupNumbers.add(group.groupNumber);

    const groupMemberIds = toObjectIdStrings(group.memberIds);

    if (groupMemberIds.length === 0) {
      this.invalidate(`groups.${index}.memberIds`, "Each group must include at least one member.");
    }

    if (new Set(groupMemberIds).size !== groupMemberIds.length) {
      this.invalidate(`groups.${index}.memberIds`, "Group members must be unique.");
    }

    groupMemberIds.forEach((memberId) => {
      if (!participantIdSet.has(memberId)) {
        this.invalidate(
          `groups.${index}.memberIds`,
          "Grouped members must also be selected participants.",
        );
      }

      groupedMemberIds.push(memberId);
    });
  });

  if (new Set(groupedMemberIds).size !== groupedMemberIds.length) {
    this.invalidate("groups", "A member cannot appear in multiple groups.");
  }

  if (this.groups.length > 0) {
    if (groupedMemberIds.length !== participantIds.length) {
      this.invalidate(
        "groups",
        "Saved groups must include every selected participant exactly once.",
      );
    }

    const unassignedMemberIds = participantIds.filter(
      (memberId) => !groupedMemberIds.includes(memberId),
    );

    if (unassignedMemberIds.length > 0) {
      this.invalidate(
        "groups",
        "Saved groups must include every selected participant exactly once.",
      );
    }

    if (!this.groupGeneratedAt) {
      this.invalidate(
        "groupGeneratedAt",
        "groupGeneratedAt is required when groups are saved.",
      );
    }
  }

  if (this.groups.length === 0 && this.groupGeneratedAt) {
    this.invalidate(
      "groupGeneratedAt",
      "groupGeneratedAt cannot be set when groups are empty.",
    );
  }
});

export type RegularActivityModelShape = InferSchemaType<typeof regularActivitySchema>;
export type RegularActivityDocument = HydratedDocument<RegularActivityModelShape>;

export const RegularActivityModel =
  (mongoose.models.RegularActivity as
    | mongoose.Model<RegularActivityModelShape>
    | undefined) ??
  mongoose.model<RegularActivityModelShape>(
    "RegularActivity",
    regularActivitySchema,
  );
