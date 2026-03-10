import type { Activity, ActivityType, FlashActivity, RegularActivity } from "./types/domain";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const activityTypeConfig = {
  regular: {
    participationWeight: 1,
    requiresGroups: true,
  },
  flash: {
    participationWeight: 0.5,
    requiresGroups: false,
  },
} as const;

function parseDateOnly(value: string) {
  if (!DATE_ONLY_PATTERN.test(value)) {
    return null;
  }

  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day, date };
}

export function isValidDateOnlyString(value: string) {
  return parseDateOnly(value) !== null;
}

export function isSaturdayInKst(value: string) {
  const parsed = parseDateOnly(value);

  if (!parsed) {
    return false;
  }

  return parsed.date.getUTCDay() === 6;
}

export function deriveActivityName(activityDate: string, area: string) {
  return `${activityDate} ${area}`.trim();
}

export function resolveActivityType(value: unknown): ActivityType {
  return value === "flash" ? "flash" : "regular";
}

export function getActivityTypeConfig(activityType: ActivityType) {
  return activityTypeConfig[activityType];
}

export function isRegularActivity(activity: Activity): activity is RegularActivity {
  return activity.activityType === "regular";
}

export function isFlashActivity(activity: Activity): activity is FlashActivity {
  return activity.activityType === "flash";
}
