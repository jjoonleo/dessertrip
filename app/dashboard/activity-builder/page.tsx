import { notFound } from "next/navigation";
import { ActivityBuilderPage } from "../../../components/dashboard/activity-builder-page";
import { getActivityBuilderSnapshot } from "../../../lib/dashboard-data";

type ActivityBuilderDashboardPageProps = {
  searchParams: Promise<{
    activityId?: string | string[];
  }>;
};

export default async function ActivityBuilderDashboardPage({
  searchParams,
}: ActivityBuilderDashboardPageProps) {
  const resolvedSearchParams = await searchParams;
  const rawActivityId = resolvedSearchParams.activityId;
  const activityId = Array.isArray(rawActivityId) ? rawActivityId[0] : rawActivityId;
  const snapshot = await getActivityBuilderSnapshot(activityId);

  if (activityId && !snapshot.editingActivity) {
    notFound();
  }

  return (
    <ActivityBuilderPage
      editingActivity={snapshot.editingActivity}
      initialMembers={snapshot.members}
    />
  );
}
