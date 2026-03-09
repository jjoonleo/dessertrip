const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

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

export function deriveRegularActivityName(activityDate: string, area: string) {
  return `${activityDate} ${area}`.trim();
}
