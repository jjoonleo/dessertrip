import { notFound } from "next/navigation";
import { ActivityBuilderPage } from "../../../../../components/dashboard/activity-builder-page";
import { getActivityFormSnapshot } from "../../../../../lib/dashboard-data";

type EditActivityDashboardPageProps = {
  params: Promise<{
    activityId: string;
  }>;
};

export default async function EditActivityDashboardPage({
  params,
}: EditActivityDashboardPageProps) {
  const resolvedParams = await params;
  const snapshot = await getActivityFormSnapshot(resolvedParams.activityId);

  if (!snapshot.editingActivity) {
    notFound();
  }

  return (
    <ActivityBuilderPage
      editingActivity={snapshot.editingActivity}
      initialMembers={snapshot.members}
    />
  );
}
