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
      required: [true, "errors.validation.activity.groupNumberRequired"],
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "errors.validation.activity.groupNumberInteger",
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
    targetGroupCount: {
      type: Number,
      required: [true, "errors.validation.activity.targetGroupRequired"],
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "errors.validation.activity.targetGroupInteger",
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
      required: [true, "errors.validation.activity.dateFormat"],
      validate: [
        {
          validator: isValidDateOnlyString,
          message: "errors.validation.activity.dateFormat",
        },
        {
          validator: isSaturdayInKst,
          message: "errors.validation.activity.saturdayRequired",
        },
      ],
    },
    area: {
      type: String,
      required: [true, "errors.validation.activity.areaRequired"],
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
      "errors.validation.activity.participantsUnique",
    );
  }

  const participantIdSet = new Set(participantIds);
  const groupedMemberIds: string[] = [];
  const groupNumbers = new Set<number>();

  this.groups.forEach((group, index) => {
    if (groupNumbers.has(group.groupNumber)) {
      this.invalidate(
        `groups.${index}.groupNumber`,
        "errors.validation.activity.groupNumberUnique",
      );
    }

    groupNumbers.add(group.groupNumber);

    const groupMemberIds = toObjectIdStrings(group.memberIds);

    if (groupMemberIds.length === 0) {
      this.invalidate(
        `groups.${index}.memberIds`,
        "errors.validation.activity.groupMemberRequired",
      );
    }

    if (new Set(groupMemberIds).size !== groupMemberIds.length) {
      this.invalidate(
        `groups.${index}.memberIds`,
        "errors.validation.activity.groupMembersUnique",
      );
    }

    groupMemberIds.forEach((memberId) => {
      if (!participantIdSet.has(memberId)) {
        this.invalidate(
          `groups.${index}.memberIds`,
          "errors.validation.activity.groupedMembersSelectedOnly",
        );
      }

      groupedMemberIds.push(memberId);
    });
  });

  if (new Set(groupedMemberIds).size !== groupedMemberIds.length) {
    this.invalidate("groups", "errors.validation.activity.memberInMultipleGroups");
  }

  if (this.groups.length > 0) {
    if (groupedMemberIds.length !== participantIds.length) {
      this.invalidate(
        "groups",
        "errors.validation.activity.groupsMustCoverParticipants",
      );
    }

    const unassignedMemberIds = participantIds.filter(
      (memberId) => !groupedMemberIds.includes(memberId),
    );

    if (unassignedMemberIds.length > 0) {
      this.invalidate(
        "groups",
        "errors.validation.activity.groupsMustCoverParticipants",
      );
    }

    if (!this.groupGeneratedAt) {
      this.invalidate(
        "groupGeneratedAt",
        "errors.validation.activity.groupGeneratedAtRequired",
      );
    }
  }

  if (this.groups.length === 0 && this.groupGeneratedAt) {
    this.invalidate(
      "groupGeneratedAt",
      "errors.validation.activity.groupGeneratedAtEmptyOnly",
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
