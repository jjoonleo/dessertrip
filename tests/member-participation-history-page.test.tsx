// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemberParticipationHistoryPage } from "../components/dashboard/member-participation-history-page";
import type { Activity, Member } from "../lib/types/domain";
import { renderWithLocale } from "./test-utils";

const mocks = vi.hoisted(() => ({
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
  usePathname: () => "/dashboard/stats/member-1",
  useRouter: () => ({
    replace: mocks.replace,
  }),
}));

const member: Member = {
  id: "member-1",
  name: "Ari",
  gender: "female",
  isManager: false,
  archivedAt: null,
};

const marchActivities: Activity[] = [
  {
    id: "activity-1",
    activityType: "regular",
    activityDate: "2026-03-14",
    area: "Gangnam",
    participantMemberIds: ["member-1"],
    groupConfig: {
      targetGroupCount: 1,
    },
    groups: [
      {
        groupNumber: 1,
        memberIds: ["member-1"],
      },
    ],
    groupGeneratedAt: "2026-03-10T10:00:00.000Z",
    activityName: "2026-03-14 Gangnam",
    participationWeight: 1,
  },
  {
    id: "activity-2",
    activityType: "flash",
    activityDate: "2026-03-21",
    area: "Mapo",
    participantMemberIds: ["member-1"],
    groupConfig: null,
    groups: [],
    groupGeneratedAt: null,
    activityName: "2026-03-21 Mapo",
    participationWeight: 0.5,
  },
];

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("member participation history page", () => {
  it("shows month-filtered stats and preserves the back-link month", () => {
    renderWithLocale(
      <MemberParticipationHistoryPage
        activities={marchActivities}
        availableMonths={["2026-03", "2026-02"]}
        member={member}
        selectedMonth="2026-03"
      />,
      "en",
    );

    expect(
      screen.getByText("Weighted total across saved activities in March 2026"),
    ).toBeTruthy();
    expect(screen.getByText("1.5")).toBeTruthy();
    expect(screen.getByText("2026-03-14 Gangnam")).toBeTruthy();
    expect(screen.getByText("2026-03-21 Mapo")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Back to stats" }).getAttribute("href"),
    ).toBe("/dashboard/stats?month=2026-03");
  });

  it("shows a month-specific empty state when that month has no activities", () => {
    renderWithLocale(
      <MemberParticipationHistoryPage
        activities={[]}
        availableMonths={["2026-02"]}
        member={member}
        selectedMonth="2026-03"
      />,
      "en",
    );

    expect(
      screen.getByText("No saved activities include this member in March 2026."),
    ).toBeTruthy();
  });

  it("keeps the all-time history presentation when no month is selected", () => {
    renderWithLocale(
      <MemberParticipationHistoryPage
        activities={marchActivities}
        availableMonths={["2026-03", "2026-02"]}
        member={member}
        selectedMonth={null}
      />,
      "en",
    );

    expect(
      screen.getByText("Weighted total across saved activities"),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Back to stats" }).getAttribute("href"),
    ).toBe("/dashboard/stats");
  });

  it("lets the user change the period from the member history page", async () => {
    const user = userEvent.setup();

    renderWithLocale(
      <MemberParticipationHistoryPage
        activities={marchActivities}
        availableMonths={["2026-03", "2026-02"]}
        member={member}
        selectedMonth="2026-03"
      />,
      "en",
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Month" }),
      "2026-02",
    );

    expect(mocks.replace).toHaveBeenCalledWith(
      "/dashboard/stats/member-1?month=2026-02",
    );

    await user.click(screen.getByRole("button", { name: "All time" }));

    expect(mocks.replace).toHaveBeenCalledWith("/dashboard/stats/member-1");
  });
});
