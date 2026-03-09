import { ActivityBuilderPage } from "../../../../components/dashboard/activity-builder-page";
import { getActivityFormSnapshot } from "../../../../lib/dashboard-data";

export default async function NewActivityDashboardPage() {
  const snapshot = await getActivityFormSnapshot();

  return (
    <ActivityBuilderPage
      editingActivity={snapshot.editingActivity}
      initialMembers={snapshot.members}
    />
  );
}
