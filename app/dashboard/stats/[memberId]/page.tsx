import { notFound } from "next/navigation";
import { MemberParticipationHistoryPage } from "../../../../components/dashboard/member-participation-history-page";
import { getMemberParticipationHistorySnapshot } from "../../../../lib/dashboard-data";

type MemberParticipationHistoryDashboardPageProps = {
  params: Promise<{
    memberId: string;
  }>;
};

export default async function MemberParticipationHistoryDashboardPage({
  params,
}: MemberParticipationHistoryDashboardPageProps) {
  const resolvedParams = await params;
  const snapshot = await getMemberParticipationHistorySnapshot(
    resolvedParams.memberId,
  );

  if (!snapshot.member) {
    notFound();
  }

  return (
    <MemberParticipationHistoryPage
      activities={snapshot.activities}
      member={snapshot.member}
    />
  );
}
