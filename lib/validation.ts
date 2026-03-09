import { z } from "zod";
import { genderValues } from "./types/domain";
import { isSaturdayInKst, isValidDateOnlyString } from "./regular-activity";

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
  .refine(isSaturdayInKst, "errors.validation.activity.saturdayRequired");

export const activityGroupInputSchema = z.object({
  groupNumber: z.number().int().positive(),
  memberIds: z
    .array(z.string().trim().min(1))
    .min(1, "errors.validation.activity.groupMemberRequired")
    .refine(hasUniqueValues, "errors.validation.activity.groupMembersUnique"),
});

export const createRegularActivityInputSchema = z.object({
  activityDate: activityDateSchema,
  area: z.string().trim().min(1, "errors.validation.activity.areaRequired"),
  participantMemberIds: z
    .array(z.string().trim().min(1))
    .refine(hasUniqueValues, "errors.validation.activity.participantsUnique"),
  groupConfig: z.object({
    targetGroupCount: z.number().int().min(1),
  }),
  groups: z.array(activityGroupInputSchema).default([]),
  groupGeneratedAt: z.coerce.date().nullable().optional(),
});

export const updateRegularActivityInputSchema = createRegularActivityInputSchema
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "errors.validation.activity.updateRequired",
  );

export type CreateMemberInput = z.infer<typeof createMemberInputSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberInputSchema>;
export type CreateAdminUserInput = z.infer<typeof createAdminUserInputSchema>;
export type CreateRegularActivityInput = z.infer<
  typeof createRegularActivityInputSchema
>;
export type UpdateRegularActivityInput = z.infer<
  typeof updateRegularActivityInputSchema
>;
