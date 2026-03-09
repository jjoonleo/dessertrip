// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { DashboardLayoutShell } from "../components/dashboard/dashboard-layout-shell";
import { useAuthStore } from "../lib/stores/auth-store";
import { useThemeStore } from "../lib/stores/theme-store";
import { renderWithLocale } from "./test-utils";

let mockedPathname = "/dashboard/stats";
let mobileMatches = true;
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
    mockedPathname = "/dashboard/activities/new";
    mobileMatches = true;
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

    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: vi.fn((query: string) => ({
        matches: query === "(max-width: 1279px)" ? mobileMatches : false,
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
      })),
    });

    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  });

  it("shows route-based sidebar links and marks the active page", async () => {
    renderWithLocale(
      <DashboardLayoutShell username="test">
        <div>Page body</div>
      </DashboardLayoutShell>,
      "en",
    );

    const activitiesLink = screen.getByRole("link", { name: "Activities" });
    const membersLink = screen.getByRole("link", { name: "Members" });

    expect(activitiesLink.getAttribute("href")).toBe("/dashboard/activities");
    expect(membersLink.getAttribute("href")).toBe("/dashboard/members");
    expect(activitiesLink.className).toContain("active");
    expect(screen.getByText("Page body")).toBeTruthy();

    await waitFor(() => {
      expect(useAuthStore.getState().status).toBe("authenticated");
    });
  });

  it("uses mobile drawer controls and closes on route changes", async () => {
    const { rerender } = renderWithLocale(
      <DashboardLayoutShell username="test">
        <div>Page body</div>
      </DashboardLayoutShell>,
      "en",
    );

    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));

    expect(useThemeStore.getState().drawerOpen).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(screen.getByRole("button", { name: "Close navigation" })).toBeTruthy();
    expect(screen.getByText("Theme")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Dismiss navigation" }));
    expect(useThemeStore.getState().drawerOpen).toBe(false);
    expect(document.body.style.overflow).toBe("");

    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(useThemeStore.getState().drawerOpen).toBe(true);

    fireEvent.click(screen.getByRole("link", { name: "Members" }));
    expect(useThemeStore.getState().drawerOpen).toBe(false);
    expect(document.body.style.overflow).toBe("");

    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(useThemeStore.getState().drawerOpen).toBe(true);

    mockedPathname = "/dashboard/stats";

    rerender(
      <DashboardLayoutShell username="test">
        <div>Page body</div>
      </DashboardLayoutShell>,
    );

    await waitFor(() => {
      expect(useThemeStore.getState().drawerOpen).toBe(false);
    });
  });

  it("only locks page scroll while the overlay breakpoint is active", () => {
    mobileMatches = false;

    renderWithLocale(
      <DashboardLayoutShell username="test">
        <div>Page body</div>
      </DashboardLayoutShell>,
      "en",
    );

    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));

    expect(useThemeStore.getState().drawerOpen).toBe(true);
    expect(document.body.style.overflow).toBe("");
    expect(document.documentElement.style.overflow).toBe("");
  });
});
