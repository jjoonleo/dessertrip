import Link from "next/link";
import type { Member, RegularActivity } from "../../lib/types/domain";
import { SectionHeader } from "./section-header";

type MemberParticipationHistoryPageProps = {
  member: Member;
  activities: RegularActivity[];
};

export function MemberParticipationHistoryPage({
  member,
  activities,
}: MemberParticipationHistoryPageProps) {
  return (
    <div className="space-y-6">
      <SectionHeader
        badge="Stats"
        description={`Review the saved Saturday activities that include ${member.name}.`}
        title={`${member.name} activity history`}
      />

      <div className="stats stats-vertical w-full border border-base-300 bg-base-100 shadow lg:stats-horizontal">
        <div className="stat">
          <div className="stat-title">Participated activities</div>
          <div className="stat-value text-primary">{activities.length}</div>
          <div className="stat-desc">Saved activities containing this member</div>
        </div>
        <div className="stat">
          <div className="stat-title">Role</div>
          <div className="stat-value text-secondary">
            {member.isManager ? "Manager" : "Member"}
          </div>
          <div className="stat-desc">Current roster role</div>
        </div>
        <div className="stat">
          <div className="stat-title">Status</div>
          <div className="stat-value text-accent">
            {member.archivedAt ? "Archived" : "Active"}
          </div>
          <div className="stat-desc">Roster record state</div>
        </div>
      </div>

      <section className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body gap-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Participated activities</h3>
              <p className="text-sm text-base-content/70">
                Open any saved activity to review or edit the generated groups.
              </p>
            </div>

            <Link className="btn btn-outline" href="/dashboard/stats">
              Back to stats
            </Link>
          </div>

          {activities.length === 0 ? (
            <div className="alert">
              <span>No saved activities include this member yet.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => {
                const memberGroup =
                  activity.groups.find((group) =>
                    group.memberIds.includes(member.id),
                  ) ?? null;

                return (
                  <div
                    key={activity.id}
                    className="card border border-base-300 bg-base-100 shadow-sm"
                  >
                    <div className="card-body gap-4 p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <h4 className="text-lg font-semibold">
                            {activity.activityName}
                          </h4>
                          <p className="text-sm text-base-content/60">
                            {activity.activityDate} • {activity.area}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className="badge badge-primary badge-outline">
                            {activity.participantMemberIds.length} participants
                          </span>
                          <span className="badge badge-secondary badge-outline">
                            {activity.groups.length} groups
                          </span>
                          {memberGroup ? (
                            <span className="badge badge-accent badge-outline">
                              Group {memberGroup.groupNumber}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="card-actions justify-end">
                        <Link
                          className="btn btn-outline btn-sm"
                          href={`/dashboard/activities/${activity.id}/edit`}
                        >
                          Open activity
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
