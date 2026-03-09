// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen, waitFor } from "@testing-library/react";
import { StatsPage } from "../components/dashboard/stats-page";
import { useStatsStore } from "../lib/stores/stats-store";
import type { MemberParticipationStat } from "../lib/types/domain";
import { renderWithLocale } from "./test-utils";

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

const stats: MemberParticipationStat[] = [
  {
    id: "member-1",
    name: "Ari",
    gender: "female",
    isManager: false,
    archivedAt: null,
    participationCount: 4,
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
      sortKey: "participationCount",
      sortDirection: "desc",
    });
  });

  it("links each member name to their participated activity history", async () => {
    renderWithLocale(<StatsPage initialStats={stats} />, "en");

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Ari" })).toBeTruthy();
    });

    expect(screen.getByRole("link", { name: "Ari" }).getAttribute("href")).toBe(
      "/dashboard/stats/member-1",
    );
  });
});
