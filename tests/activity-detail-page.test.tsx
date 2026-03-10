// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import { ActivityDetailPage } from "../components/dashboard/activity-detail-page";
import type { Activity, Member } from "../lib/types/domain";
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

const members: Member[] = [
  { id: "m1", name: "Ari", gender: "female", isManager: false, archivedAt: null },
  { id: "m2", name: "Ben", gender: "male", isManager: true, archivedAt: null },
];

const regularActivity: Activity = {
  id: "activity-1",
  activityType: "regular",
  activityDate: "2026-03-14",
  area: "Gangnam",
  participantMemberIds: ["m1", "m2"],
  groupConfig: {
    targetGroupCount: 1,
  },
  groups: [
    {
      groupNumber: 1,
      memberIds: ["m1", "m2"],
    },
  ],
  groupGeneratedAt: "2026-03-10T10:00:00.000Z",
  activityName: "2026-03-14 Gangnam",
  participationWeight: 1,
};

const flashActivity: Activity = {
  id: "activity-2",
  activityType: "flash",
  activityDate: "2026-03-21",
  area: "Mapo",
  participantMemberIds: ["m1"],
  groupConfig: null,
  groups: [],
  groupGeneratedAt: null,
  activityName: "2026-03-21 Mapo",
  participationWeight: 0.5,
};

afterEach(() => {
  cleanup();
});

describe("activity detail page", () => {
  it("renders regular activity details, groups, and contextual actions", () => {
    renderWithLocale(
      <ActivityDetailPage
        activity={regularActivity}
        contextMemberId="member-1"
        contextMonth="2026-03"
        members={members}
      />,
      "en",
    );

    expect(screen.getByText("2026-03-14 Gangnam")).toBeTruthy();
    expect(screen.getByText("Gangnam")).toBeTruthy();
    expect(screen.getAllByText("Ari")).toHaveLength(2);
    expect(screen.getAllByText("Ben")).toHaveLength(2);
    expect(screen.getByText("Group assignments")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Back to member history" }).getAttribute("href"),
    ).toBe("/dashboard/stats/member-1?month=2026-03");
    expect(
      screen.getByRole("link", { name: "Edit activity" }).getAttribute("href"),
    ).toBe("/dashboard/activities/activity-1/edit");
  });

  it("hides groups for flash activities and falls back to activities navigation", () => {
    renderWithLocale(
      <ActivityDetailPage
        activity={flashActivity}
        members={members}
      />,
      "en",
    );

    expect(screen.queryByText("Group assignments")).toBeNull();
    expect(
      screen.getByRole("link", { name: "Back to activities" }).getAttribute("href"),
    ).toBe("/dashboard/activities");
    expect(
      screen.getByRole("link", { name: "Edit activity" }).getAttribute("href"),
    ).toBe("/dashboard/activities/activity-2/edit");
  });
});
