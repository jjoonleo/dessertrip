import { z } from "zod";
import { genderValues } from "./types/domain";
import { isSaturdayInKst, isValidDateOnlyString } from "./regular-activity";

function hasUniqueValues(values: string[]) {
  return new Set(values).size === values.length;
}

export const createMemberInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  gender: z.enum(genderValues),
  isManager: z.boolean(),
});

export const updateMemberInputSchema = createMemberInputSchema
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "At least one member field must be updated.",
  );

export const createAdminUserInputSchema = z.object({
  username: z.string().trim().min(1, "Username is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const activityDateSchema = z
  .string()
  .refine(isValidDateOnlyString, "activityDate must use YYYY-MM-DD.")
  .refine(isSaturdayInKst, "activityDate must be a Saturday in KST.");

export const activityGroupInputSchema = z.object({
  groupNumber: z.number().int().positive(),
  memberIds: z
    .array(z.string().trim().min(1))
    .min(1, "Each group must contain at least one member.")
    .refine(hasUniqueValues, "Group members must be unique."),
});

export const createRegularActivityInputSchema = z.object({
  activityDate: activityDateSchema,
  area: z.string().trim().min(1, "Area is required."),
  participantMemberIds: z
    .array(z.string().trim().min(1))
    .refine(hasUniqueValues, "participantMemberIds must be unique."),
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
    "At least one activity field must be updated.",
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
