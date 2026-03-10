import { afterEach, describe, expect, it, vi } from "vitest";
import { getCurrentStatsMonthInKst, parseStatsMonthQuery } from "../lib/stats";

describe("stats helpers", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves the current stats month in KST across UTC month boundaries", () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date("2026-03-31T14:59:59.000Z"));
    expect(getCurrentStatsMonthInKst()).toBe("2026-03");

    vi.setSystemTime(new Date("2026-03-31T15:00:00.000Z"));
    expect(getCurrentStatsMonthInKst()).toBe("2026-04");
  });

  it("accepts only strict YYYY-MM month query values", () => {
    expect(parseStatsMonthQuery("2026-03")).toBe("2026-03");
    expect(parseStatsMonthQuery(["2026-04"])).toBe("2026-04");
    expect(parseStatsMonthQuery("2026-3")).toBeNull();
    expect(parseStatsMonthQuery("2026-13")).toBeNull();
    expect(parseStatsMonthQuery("all")).toBeNull();
    expect(parseStatsMonthQuery(undefined)).toBeNull();
  });
});
