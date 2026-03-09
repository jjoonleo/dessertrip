import { DashboardLayoutShell } from "../../components/dashboard/dashboard-layout-shell";
import { requireSession } from "../../lib/auth-server";

type DashboardLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await requireSession();

  return (
    <DashboardLayoutShell username={session.username}>
      {children}
    </DashboardLayoutShell>
  );
}
