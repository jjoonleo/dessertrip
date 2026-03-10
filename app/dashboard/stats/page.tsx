import { StatsPage } from "../../../components/dashboard/stats-page";
import { getStatsSnapshot } from "../../../lib/dashboard-data";
import { parseStatsMonthQuery } from "../../../lib/stats";

type StatsDashboardPageProps = {
  searchParams?: Promise<{
    month?: string | string[];
  }>;
};

export default async function StatsDashboardPage({
  searchParams,
}: StatsDashboardPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const snapshot = await getStatsSnapshot();
  const initialSelectedPeriod = parseStatsMonthQuery(resolvedSearchParams.month);

  return (
    <StatsPage
      initialSelectedPeriod={initialSelectedPeriod ?? undefined}
      initialStats={snapshot.stats}
    />
  );
}
