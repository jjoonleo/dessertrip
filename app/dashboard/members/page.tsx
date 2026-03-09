import { MembersPage } from "../../../components/dashboard/members-page";
import { getMembersSnapshot } from "../../../lib/dashboard-data";

export default async function MembersDashboardPage() {
  const snapshot = await getMembersSnapshot();

  return <MembersPage initialMembers={snapshot.members} />;
}
