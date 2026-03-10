import { notFound } from "next/navigation";
import { MemberParticipationHistoryPage } from "../../../../components/dashboard/member-participation-history-page";
import { getMemberParticipationHistorySnapshot } from "../../../../lib/dashboard-data";
import { parseStatsMonthQuery } from "../../../../lib/stats";

type MemberParticipationHistoryDashboardPageProps = {
  params: Promise<{
    memberId: string;
  }>;
  searchParams?: Promise<{
    month?: string | string[];
  }>;
};

type MemberParticipationHistorySearchParams = {
  month?: string | string[];
};

export default async function MemberParticipationHistoryDashboardPage({
  params,
  searchParams,
}: MemberParticipationHistoryDashboardPageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams ?? Promise.resolve<MemberParticipationHistorySearchParams>({}),
  ]);
  const selectedMonth = parseStatsMonthQuery(resolvedSearchParams.month);
  const snapshot = await getMemberParticipationHistorySnapshot(
    resolvedParams.memberId,
    selectedMonth ?? undefined,
  );

  if (!snapshot.member) {
    notFound();
  }

  return (
    <MemberParticipationHistoryPage
      activities={snapshot.activities}
      availableMonths={snapshot.availableMonths}
      member={snapshot.member}
      selectedMonth={selectedMonth}
    />
  );
}
