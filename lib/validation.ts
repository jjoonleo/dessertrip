import { z } from "zod";
import { isSaturdayInKst, isValidDateOnlyString } from "./activity";
import { activityTypeValues, genderValues } from "./types/domain";

function hasUniqueValues(values: string[]) {
  return new Set(values).size === values.length;
}

export const createMemberInputSchema = z.object({
  name: z.string().trim().min(1, "errors.validation.member.nameRequired"),
  gender: z.enum(genderValues),
  isManager: z.boolean(),
});

export const updateMemberInputSchema = createMemberInputSchema
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "errors.validation.member.updateRequired",
  );

export const createAdminUserInputSchema = z.object({
  username: z.string().trim().min(1, "errors.validation.admin.usernameRequired"),
  password: z
    .string()
    .min(8, "errors.validation.admin.passwordMin"),
});

export const activityDateSchema = z
  .string()
  .refine(isValidDateOnlyString, "errors.validation.activity.dateFormat")
  .trim();

export const regularActivityDateSchema = activityDateSchema.refine(
  isSaturdayInKst,
  "errors.validation.activity.saturdayRequired",
);

export const activityGroupInputSchema = z.object({
  groupNumber: z.number().int().positive(),
  memberIds: z
    .array(z.string().trim().min(1))
    .min(1, "errors.validation.activity.groupMemberRequired")
    .refine(hasUniqueValues, "errors.validation.activity.groupMembersUnique"),
});

const participantMemberIdsSchema = z
  .array(z.string().trim().min(1))
  .refine(hasUniqueValues, "errors.validation.activity.participantsUnique");

const groupConfigInputSchema = z.object({
  targetGroupCount: z.number().int().min(1),
});

function validateActivityInput(
  value: {
    activityType: "regular" | "flash";
    activityDate: string;
    groupConfig?: { targetGroupCount: number } | null;
    groups?: Array<{ groupNumber: number; memberIds: string[] }>;
    groupGeneratedAt?: Date | null;
  },
  ctx: z.RefinementCtx,
) {
  if (value.activityType === "regular") {
    if (!isSaturdayInKst(value.activityDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "errors.validation.activity.saturdayRequired",
        path: ["activityDate"],
      });
    }

    if (!value.groupConfig) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "errors.validation.activity.targetGroupRequired",
        path: ["groupConfig"],
      });
    }

    if (!value.groups || value.groups.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "errors.validation.activity.regularGroupsRequired",
        path: ["groups"],
      });
    }

    if (!value.groupGeneratedAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "errors.validation.activity.groupGeneratedAtRequired",
        path: ["groupGeneratedAt"],
      });
    }

    return;
  }

  if (value.groupConfig !== null && value.groupConfig !== undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "errors.validation.activity.flashGroupConfigEmpty",
      path: ["groupConfig"],
    });
  }

  if (value.groups && value.groups.length > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "errors.validation.activity.flashGroupsEmpty",
      path: ["groups"],
    });
  }

  if (value.groupGeneratedAt !== null && value.groupGeneratedAt !== undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "errors.validation.activity.flashGroupGeneratedAtEmpty",
      path: ["groupGeneratedAt"],
    });
  }
}

export const createActivityInputSchema = z
  .object({
    activityType: z.enum(activityTypeValues),
    activityDate: activityDateSchema,
    area: z.string().trim().min(1, "errors.validation.activity.areaRequired"),
    participantMemberIds: participantMemberIdsSchema,
    groupConfig: groupConfigInputSchema.nullable().optional(),
    groups: z.array(activityGroupInputSchema).default([]),
    groupGeneratedAt: z.coerce.date().nullable().optional(),
  })
  .superRefine(validateActivityInput);

export const updateActivityInputSchema = z
  .object({
    activityType: z.enum(activityTypeValues).optional(),
    activityDate: activityDateSchema.optional(),
    area: z
      .string()
      .trim()
      .min(1, "errors.validation.activity.areaRequired")
      .optional(),
    participantMemberIds: participantMemberIdsSchema.optional(),
    groupConfig: groupConfigInputSchema.nullable().optional(),
    groups: z.array(activityGroupInputSchema).optional(),
    groupGeneratedAt: z.coerce.date().nullable().optional(),
  })
  .refine(
    (value) => Object.keys(value).length > 0,
    "errors.validation.activity.updateRequired",
  );

export type CreateMemberInput = z.infer<typeof createMemberInputSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberInputSchema>;
export type CreateAdminUserInput = z.infer<typeof createAdminUserInputSchema>;
export type CreateActivityInput = z.infer<typeof createActivityInputSchema>;
export type UpdateActivityInput = z.infer<typeof updateActivityInputSchema>;
