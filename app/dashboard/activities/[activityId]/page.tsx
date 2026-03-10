import { notFound } from "next/navigation";
import { ActivityDetailPage } from "../../../../components/dashboard/activity-detail-page";
import { getActivityDetailSnapshot } from "../../../../lib/dashboard-data";
import { parseStatsMonthQuery } from "../../../../lib/stats";

type ActivityDetailDashboardPageProps = {
  params: Promise<{
    activityId: string;
  }>;
  searchParams?: Promise<{
    memberId?: string | string[];
    month?: string | string[];
  }>;
};

type ActivityDetailSearchParams = {
  memberId?: string | string[];
  month?: string | string[];
};

function parseMemberIdQuery(value: string | string[] | undefined) {
  const normalizedValue = Array.isArray(value) ? value[0] : value;

  if (!normalizedValue || normalizedValue.trim().length === 0) {
    return null;
  }

  return normalizedValue;
}

export default async function ActivityDetailDashboardPage({
  params,
  searchParams,
}: ActivityDetailDashboardPageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams ?? Promise.resolve<ActivityDetailSearchParams>({}),
  ]);
  const snapshot = await getActivityDetailSnapshot(resolvedParams.activityId);

  if (!snapshot.activity) {
    notFound();
  }

  return (
    <ActivityDetailPage
      activity={snapshot.activity}
      contextMemberId={parseMemberIdQuery(resolvedSearchParams.memberId)}
      contextMonth={parseStatsMonthQuery(resolvedSearchParams.month)}
      members={snapshot.members}
    />
  );
}
