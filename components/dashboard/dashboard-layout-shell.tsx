"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutAction } from "../../app/actions";
import { dashboardNavItems } from "../../lib/dashboard-navigation";
import { useAuthStore } from "../../lib/stores/auth-store";
import { useThemeStore } from "../../lib/stores/theme-store";
import { useI18n } from "../i18n/i18n-context";
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

function CloseIcon() {
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
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

const mobileDrawerQuery = "(max-width: 1279px)";

export function DashboardLayoutShell({
  username,
  children,
}: DashboardLayoutShellProps) {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  const drawerOpen = useThemeStore((state) => state.drawerOpen);
  const setDrawerOpen = useThemeStore((state) => state.setDrawerOpen);

  const hydrateAuth = useAuthStore((state) => state.hydrate);
  const markUnauthenticated = useAuthStore((state) => state.markUnauthenticated);

  useEffect(() => {
    hydrateAuth("authenticated");
  }, [hydrateAuth]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname, setDrawerOpen]);

  useEffect(() => {
    if (typeof window === "undefined" || !drawerOpen) {
      return;
    }

    const mediaQuery = window.matchMedia(mobileDrawerQuery);
    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = documentElement.style.overflow;

    const syncScrollLock = () => {
      const shouldLock = mediaQuery.matches;
      body.style.overflow = shouldLock ? "hidden" : previousBodyOverflow;
      documentElement.style.overflow = shouldLock ? "hidden" : previousHtmlOverflow;
    };

    syncScrollLock();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncScrollLock);
    } else {
      mediaQuery.addListener(syncScrollLock);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", syncScrollLock);
      } else {
        mediaQuery.removeListener(syncScrollLock);
      }

      body.style.overflow = previousBodyOverflow;
      documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [drawerOpen]);

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

  function openDrawer() {
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
  }

  async function handleLogout() {
    closeDrawer();
    await logoutAction();
    markUnauthenticated();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="dashboard-shell drawer">
      <input
        checked={drawerOpen}
        className="dashboard-shell__toggle drawer-toggle"
        id="dashboard-drawer"
        onChange={(event) => setDrawerOpen(event.target.checked)}
        type="checkbox"
      />

      <div className="dashboard-shell__content drawer-content bg-base-200">
        <header className="dashboard-shell__header navbar sticky top-0 z-30 border-b border-base-300 bg-base-100/90 shadow-sm backdrop-blur">
          <div className="dashboard-shell__menu-slot flex-none">
            <button
              aria-controls="dashboard-drawer"
              aria-label={t("dashboard.shell.openNavigation")}
              className="dashboard-shell__menu-button btn btn-square btn-ghost"
              onClick={openDrawer}
              type="button"
            >
              <MenuIcon />
            </button>
          </div>

          <div className="dashboard-shell__header-main flex-1">
            <div className="dashboard-shell__mobile-title">
              <h1 className="text-lg font-black tracking-tight">
                {t(currentItem.labelKey)}
              </h1>
            </div>

            <div className="dashboard-shell__desktop-title">
              <span className="badge badge-primary badge-outline mb-2">
                {t("dashboard.badge")}
              </span>
              <h1 className="text-2xl font-black tracking-tight">
                {t(currentItem.labelKey)}
              </h1>
              <p className="text-sm text-base-content/70">
                {t(currentItem.descriptionKey)}
              </p>
            </div>
          </div>

          <div className="dashboard-shell__desktop-actions items-center gap-2">
            <ThemeToggle label={false} />
            <button className="btn btn-outline btn-sm" onClick={handleLogout} type="button">
              {t("dashboard.shell.signOut")}
            </button>
          </div>
        </header>

        <main className="dashboard-shell__main space-y-6">{children}</main>
      </div>

      <div className="dashboard-shell__side drawer-side z-40">
        <label
          aria-label={t("dashboard.shell.dismissNavigation")}
          className="dashboard-shell__overlay drawer-overlay bg-neutral/45 backdrop-blur-sm"
          htmlFor="dashboard-drawer"
          onClick={closeDrawer}
          role="button"
        />

        <aside className="dashboard-shell__panel h-dvh min-h-dvh max-w-full overflow-y-auto border-r border-base-300 bg-base-100 shadow-2xl">
          <div className="dashboard-shell__panel-inner flex min-h-dvh flex-col">
            <div className="dashboard-shell__panel-header border-b border-base-300 p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="badge badge-primary badge-outline">
                  {t("app.name")}
                </span>
                <button
                  aria-label={t("dashboard.shell.closeNavigation")}
                  className="dashboard-shell__close-button btn btn-square btn-ghost"
                  onClick={closeDrawer}
                  type="button"
                >
                  <CloseIcon />
                </button>
              </div>
              <h2 className="text-2xl font-black tracking-tight">
                {t("dashboard.shell.navigationTitle")}
              </h2>
              <p className="mt-2 text-sm text-base-content/70">
                {t("dashboard.shell.navigationDescription")}
              </p>
            </div>

            <ul className="dashboard-shell__nav menu flex-1 gap-2 p-4 text-base">
              {dashboardNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    className={isNavItemActive(item.href) ? "active" : undefined}
                    href={item.href}
                    onClick={closeDrawer}
                  >
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="dashboard-shell__mobile-footer border-t border-base-300 p-4">
              <div className="space-y-4">
                <div className="rounded-box border border-base-300 bg-base-200 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/60">
                    {t("dashboard.shell.signedIn")}
                  </p>
                  <p className="mt-2 text-lg font-bold">{username}</p>
                  <p className="mt-1 text-sm text-base-content/70">
                    {t("dashboard.shell.activeSessionOn", {
                      page: t(currentItem.labelKey),
                    })}
                  </p>
                </div>

                <div className="rounded-box border border-base-300 bg-base-200 p-4 shadow-sm">
                  <ThemeToggle />
                </div>

                <button className="btn btn-primary w-full" onClick={handleLogout} type="button">
                  {t("dashboard.shell.signOut")}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
