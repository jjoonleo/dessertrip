import { ActivitiesPage } from "../../../components/dashboard/activities-page";
import { getActivitiesSnapshot } from "../../../lib/dashboard-data";

export default async function ActivitiesDashboardPage() {
  const snapshot = await getActivitiesSnapshot();

  return (
    <ActivitiesPage
      initialActivities={snapshot.activities}
      initialMembers={snapshot.members}
    />
  );
}
