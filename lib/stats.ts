import type { AppLocale } from "./i18n/config";
import type { MemberParticipationStat } from "./types/domain";

export type StatsMonthKey = `${number}${number}${number}${number}-${number}${number}`;
export type StatsPeriod = "all" | StatsMonthKey;
const STATS_MONTH_KEY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

function getMonthFormatter(locale: AppLocale) {
  return new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
    year: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

function getKstMonthParts(referenceDate: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    timeZone: "Asia/Seoul",
  }).formatToParts(referenceDate);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;

  if (!year || !month) {
    throw new Error("Unable to resolve current KST month.");
  }

  return { year, month };
}

export function getCurrentStatsMonthInKst(
  referenceDate: Date = new Date(),
): StatsMonthKey {
  const { year, month } = getKstMonthParts(referenceDate);
  return `${year}-${month}` as StatsMonthKey;
}

export function parseStatsMonthQuery(
  value: string | string[] | null | undefined,
): StatsMonthKey | null {
  const normalizedValue = Array.isArray(value) ? value[0] : value;

  if (!normalizedValue || !STATS_MONTH_KEY_PATTERN.test(normalizedValue)) {
    return null;
  }

  return normalizedValue as StatsMonthKey;
}

export function getParticipationScoreForPeriod(
  stat: MemberParticipationStat,
  period: StatsPeriod,
) {
  if (period === "all") {
    return stat.participationScore;
  }

  return stat.monthlyParticipationScores[period] ?? 0;
}

export function getAvailableStatsMonths(
  stats: MemberParticipationStat[],
  options?: {
    currentMonth?: StatsMonthKey;
    selectedPeriod?: StatsPeriod;
  },
) {
  const months = new Set<StatsMonthKey>([
    options?.currentMonth ?? getCurrentStatsMonthInKst(),
  ]);

  stats.forEach((stat) => {
    Object.keys(stat.monthlyParticipationScores).forEach((month) => {
      months.add(month as StatsMonthKey);
    });
  });

  if (options?.selectedPeriod && options.selectedPeriod !== "all") {
    months.add(options.selectedPeriod);
  }

  return [...months].sort((left, right) => right.localeCompare(left));
}

export function formatStatsMonthLabel(month: StatsMonthKey, locale: AppLocale) {
  const [yearText, monthText] = month.split("-");
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;

  if (!Number.isInteger(year) || !Number.isInteger(monthIndex) || monthIndex < 0) {
    return month;
  }

  return getMonthFormatter(locale).format(new Date(Date.UTC(year, monthIndex, 1)));
}
