"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutAction } from "../../app/actions";
import { dashboardNavItems } from "../../lib/dashboard-navigation";
import { useAuthStore } from "../../lib/stores/auth-store";
import { useThemeStore } from "../../lib/stores/theme-store";
import { ThemeToggle } from "../theme/theme-toggle";

type DashboardLayoutShellProps = {
  username: string;
  children: React.ReactNode;
};

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function DashboardLayoutShell({
  username,
  children,
}: DashboardLayoutShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const drawerOpen = useThemeStore((state) => state.drawerOpen);
  const setDrawerOpen = useThemeStore((state) => state.setDrawerOpen);

  const hydrateAuth = useAuthStore((state) => state.hydrate);
  const markUnauthenticated = useAuthStore((state) => state.markUnauthenticated);

  useEffect(() => {
    hydrateAuth("authenticated");
  }, [hydrateAuth]);

  const currentItem =
    [...dashboardNavItems]
      .sort((left, right) => right.href.length - left.href.length)
      .find(
        (item) =>
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`)),
      ) ?? dashboardNavItems[0];

  function isNavItemActive(href: string) {
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
  }

  async function handleLogout() {
    await logoutAction();
    markUnauthenticated();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className={`drawer ${drawerOpen ? "drawer-open" : ""} lg:drawer-open`}>
      <input
        checked={drawerOpen}
        className="drawer-toggle"
        id="dashboard-drawer"
        onChange={(event) => setDrawerOpen(event.target.checked)}
        type="checkbox"
      />

      <div className="drawer-content bg-base-200">
        <header className="navbar sticky top-0 z-30 border-b border-base-300 bg-base-100/90 px-4 shadow-sm backdrop-blur md:px-6">
          <div className="flex-none lg:hidden">
            <button
              className="btn btn-square btn-ghost"
              onClick={() => setDrawerOpen(true)}
              type="button"
            >
              <MenuIcon />
            </button>
          </div>

          <div className="flex-1">
            <div>
              <span className="badge badge-primary badge-outline mb-2">
                Club Admin
              </span>
              <h1 className="text-2xl font-black tracking-tight">
                {currentItem.label}
              </h1>
              <p className="text-sm text-base-content/70">
                {currentItem.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle label={false} />
            <button className="btn btn-outline btn-sm" onClick={handleLogout} type="button">
              Sign out
            </button>
          </div>
        </header>

        <main className="space-y-6 p-4 md:p-6 lg:p-8">{children}</main>
      </div>

      <div className="drawer-side z-40">
        <label
          aria-label="Close sidebar"
          className="drawer-overlay"
          htmlFor="dashboard-drawer"
          onClick={() => setDrawerOpen(false)}
        />

        <aside className="min-h-full w-80 border-r border-base-300 bg-base-100">
          <div className="flex h-full flex-col">
            <div className="border-b border-base-300 p-5">
              <span className="badge badge-primary badge-outline mb-3">
                Dessertrip
              </span>
              <h2 className="text-2xl font-black tracking-tight">
                Club navigation
              </h2>
              <p className="mt-2 text-sm text-base-content/70">
                Navigate between dashboard pages while keeping the shared admin
                shell and theme controls in place.
              </p>
            </div>

            <ul className="menu flex-1 gap-2 p-4">
              {dashboardNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    className={isNavItemActive(item.href) ? "active" : undefined}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="border-t border-base-300 p-4">
              <div className="stats stats-vertical w-full bg-base-200 shadow-sm">
                <div className="stat">
                  <div className="stat-title">Signed in</div>
                  <div className="stat-value text-lg">{username}</div>
                  <div className="stat-desc">Manager session active</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Page</div>
                  <div className="stat-value text-lg">{currentItem.label}</div>
                  <div className="stat-desc">Sidebar navigation enabled</div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
