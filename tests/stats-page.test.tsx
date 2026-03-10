// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatsPage } from "../components/dashboard/stats-page";
import { useStatsStore } from "../lib/stores/stats-store";
import type { MemberParticipationStat } from "../lib/types/domain";
import { renderWithLocale } from "./test-utils";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/stats",
  useRouter: () => ({
    push: mocks.push,
    replace: mocks.replace,
  }),
}));

const stats: MemberParticipationStat[] = [
  {
    id: "member-1",
    name: "Ari",
    gender: "female",
    isManager: false,
    archivedAt: null,
    participationScore: 4,
    monthlyParticipationScores: {
      "2026-02": 3,
      "2026-03": 1,
    },
  },
  {
    id: "member-2",
    name: "Ben",
    gender: "male",
    isManager: true,
    archivedAt: null,
    participationScore: 2,
    monthlyParticipationScores: {
      "2026-03": 2,
    },
  },
];

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("stats page", () => {
  beforeEach(() => {
    useStatsStore.setState({
      stats: [],
      search: "",
      genderFilter: "all",
      archiveFilter: "active",
      selectedPeriod: "2026-03",
      sortKey: "participationScore",
      sortDirection: "desc",
    });
  });

  it("links each member name to their month-filtered activity history", async () => {
    renderWithLocale(<StatsPage initialStats={stats} />, "en");

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Ari" })).toBeTruthy();
    });

    expect(screen.getByRole("link", { name: "Ari" }).getAttribute("href")).toBe(
      "/dashboard/stats/member-1?month=2026-03",
    );
  });

  it("navigates when clicking anywhere on a member row", async () => {
    const user = userEvent.setup();

    renderWithLocale(<StatsPage initialStats={stats} />, "en");

    const row = screen.getByRole("link", { name: "Ari" }).closest("tr");

    expect(row).toBeTruthy();

    await user.click(row!);

    expect(mocks.push).toHaveBeenCalledWith("/dashboard/stats/member-1?month=2026-03");
  });

  it("keeps member detail links plain in all-time mode", async () => {
    useStatsStore.setState({
      selectedPeriod: "all",
    });

    renderWithLocale(<StatsPage initialStats={stats} />, "en");

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Ari" })).toBeTruthy();
    });

    expect(screen.getByRole("link", { name: "Ari" }).getAttribute("href")).toBe(
      "/dashboard/stats/member-1",
    );
  });

  it("defaults to the current month and can switch back to all-time stats", async () => {
    const user = userEvent.setup();

    renderWithLocale(<StatsPage initialStats={stats} />, "en");

    await waitFor(() => {
      expect(screen.getByText("Selected month")).toBeTruthy();
    });

    expect(screen.getAllByText("March 2026")).toHaveLength(2);
    expect(screen.getByText("Participants this month")).toBeTruthy();
    expect(
      screen.getByRole("columnheader", {
        name: "Participation score (March 2026)",
      }),
    ).toBeTruthy();
    expect(
      (screen.getByRole("combobox", { name: "Month" }) as HTMLSelectElement)
        .value,
    ).toBe("2026-03");

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Month" }),
      "2026-02",
    );

    expect(mocks.replace).toHaveBeenCalledWith("/dashboard/stats?month=2026-02");
    expect(screen.getAllByText("February 2026")).toHaveLength(2);
    expect(
      screen.getByRole("columnheader", {
        name: "Participation score (February 2026)",
      }),
    ).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "All time" }));

    expect(mocks.replace).toHaveBeenCalledWith("/dashboard/stats");
    expect(screen.getByText("Tracked members")).toBeTruthy();
    expect(
      screen.getByRole("columnheader", {
        name: "Participation score (all time)",
      }),
    ).toBeTruthy();
    expect(screen.getByRole("link", { name: "Ari" }).getAttribute("href")).toBe(
      "/dashboard/stats/member-1",
    );
  });
});
