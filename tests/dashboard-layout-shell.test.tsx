// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { DashboardLayoutShell } from "../components/dashboard/dashboard-layout-shell";
import { useAuthStore } from "../lib/stores/auth-store";
import { useThemeStore } from "../lib/stores/theme-store";

let mockedPathname = "/dashboard/stats";
const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockedPathname,
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
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

vi.mock("../app/actions", () => ({
  logoutAction: vi.fn().mockResolvedValue({
    ok: true as const,
    data: null,
  }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("dashboard layout shell", () => {
  beforeEach(() => {
    mockedPathname = "/dashboard/stats";
    useThemeStore.setState({
      theme: "pastel",
      drawerOpen: false,
      hydrated: false,
    });
    useAuthStore.setState({
      status: "unauthenticated",
      username: "",
      password: "",
      pending: false,
      error: null,
    });
  });

  it("shows route-based sidebar links and marks the active page", async () => {
    render(
      <DashboardLayoutShell username="test">
        <div>Page body</div>
      </DashboardLayoutShell>,
    );

    const statsLink = screen.getByRole("link", { name: "Stats" });
    const membersLink = screen.getByRole("link", { name: "Members" });

    expect(statsLink.getAttribute("href")).toBe("/dashboard/stats");
    expect(membersLink.getAttribute("href")).toBe("/dashboard/members");
    expect(statsLink.className).toContain("active");
    expect(screen.getByText("Page body")).toBeTruthy();

    await waitFor(() => {
      expect(useAuthStore.getState().status).toBe("authenticated");
    });
  });
});
