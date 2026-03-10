import { afterEach, describe, expect, it, vi } from "vitest";
import { getCurrentStatsMonthInKst } from "../lib/stats";

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
});
