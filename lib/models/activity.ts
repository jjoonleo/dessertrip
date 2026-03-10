import mongoose, {
  Schema,
  Types,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";
import { isSaturdayInKst, isValidDateOnlyString, resolveActivityType } from "../activity";

function toObjectIdStrings(values: Types.ObjectId[]) {
  return values.map((value) => value.toString());
}

const activityGroupSchema = new Schema(
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

const activitySchema = new Schema(
  {
    activityType: {
      type: String,
      enum: ["regular", "flash"],
      default: "regular",
      required: [true, "errors.validation.activity.typeRequired"],
    },
    activityDate: {
      type: String,
      required: [true, "errors.validation.activity.dateFormat"],
      trim: true,
      validate: {
        validator: isValidDateOnlyString,
        message: "errors.validation.activity.dateFormat",
      },
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
      default: null,
    },
    groups: {
      type: [activityGroupSchema],
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

activitySchema.index(
  { activityDate: 1 },
  {
    unique: true,
    partialFilterExpression: {
      activityType: "regular",
    },
    name: "uniq_regular_activity_date",
  },
);

activitySchema.pre("validate", function validateActivity() {
  const activityType = resolveActivityType(this.activityType);
  const participantIds = toObjectIdStrings(this.participantMemberIds);

  if (new Set(participantIds).size !== participantIds.length) {
    this.invalidate(
      "participantMemberIds",
      "errors.validation.activity.participantsUnique",
    );
  }

  if (activityType === "flash") {
    if (this.groupConfig !== null && this.groupConfig !== undefined) {
      this.invalidate(
        "groupConfig",
        "errors.validation.activity.flashGroupConfigEmpty",
      );
    }

    if (this.groups.length > 0) {
      this.invalidate("groups", "errors.validation.activity.flashGroupsEmpty");
    }

    if (this.groupGeneratedAt) {
      this.invalidate(
        "groupGeneratedAt",
        "errors.validation.activity.flashGroupGeneratedAtEmpty",
      );
    }

    return;
  }

  if (!isSaturdayInKst(this.activityDate)) {
    this.invalidate("activityDate", "errors.validation.activity.saturdayRequired");
  }

  if (!this.groupConfig) {
    this.invalidate("groupConfig", "errors.validation.activity.targetGroupRequired");
  }

  if (this.groups.length === 0) {
    this.invalidate("groups", "errors.validation.activity.regularGroupsRequired");
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

  if (groupedMemberIds.length !== participantIds.length) {
    this.invalidate("groups", "errors.validation.activity.groupsMustCoverParticipants");
  }

  const unassignedMemberIds = participantIds.filter(
    (memberId) => !groupedMemberIds.includes(memberId),
  );

  if (unassignedMemberIds.length > 0) {
    this.invalidate("groups", "errors.validation.activity.groupsMustCoverParticipants");
  }

  if (!this.groupGeneratedAt) {
    this.invalidate(
      "groupGeneratedAt",
      "errors.validation.activity.groupGeneratedAtRequired",
    );
  }
});

export type ActivityModelShape = InferSchemaType<typeof activitySchema>;
export type ActivityDocument = HydratedDocument<ActivityModelShape>;

export const ActivityModel =
  (mongoose.models.Activity as mongoose.Model<ActivityModelShape> | undefined) ??
  mongoose.model<ActivityModelShape>("Activity", activitySchema);
