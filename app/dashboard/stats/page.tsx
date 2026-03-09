import { StatsPage } from "../../../components/dashboard/stats-page";
import { getStatsSnapshot } from "../../../lib/dashboard-data";

export default async function StatsDashboardPage() {
  const snapshot = await getStatsSnapshot();

  return <StatsPage initialStats={snapshot.stats} />;
}
