"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createRegularActivityAction,
  updateRegularActivityAction,
} from "../../app/actions";
import { useActivitiesStore } from "../../lib/stores/activities-store";
import { useActivityBuilderStore } from "../../lib/stores/activity-builder-store";
import { useMembersStore } from "../../lib/stores/members-store";
import { useStatsStore } from "../../lib/stores/stats-store";
import type { Member, RegularActivity } from "../../lib/types/domain";
import { SectionHeader } from "./section-header";

type ActivityBuilderPageProps = {
  initialMembers: Member[];
  editingActivity: RegularActivity | null;
};

export function ActivityBuilderPage({
  initialMembers,
  editingActivity,
}: ActivityBuilderPageProps) {
  const router = useRouter();

  const members = useMembersStore((state) => state.members);
  const hydrateMembers = useMembersStore((state) => state.hydrate);

  const activityPending = useActivitiesStore((state) => state.pending);
  const activityError = useActivitiesStore((state) => state.error);
  const upsertActivity = useActivitiesStore((state) => state.upsertActivity);
  const setActivityPending = useActivitiesStore((state) => state.setPending);
  const setActivityError = useActivitiesStore((state) => state.setError);

  const activityDate = useActivityBuilderStore((state) => state.activityDate);
  const area = useActivityBuilderStore((state) => state.area);
  const participantMemberIds = useActivityBuilderStore(
    (state) => state.participantMemberIds,
  );
  const targetGroupSize = useActivityBuilderStore(
    (state) => state.targetGroupSize,
  );
  const generatedGroups = useActivityBuilderStore((state) => state.generatedGroups);
  const editingActivityId = useActivityBuilderStore(
    (state) => state.editingActivityId,
  );
  const builderErrors = useActivityBuilderStore((state) => state.errors);
  const lastGeneratedAt = useActivityBuilderStore((state) => state.lastGeneratedAt);
  const hydrateFromActivity = useActivityBuilderStore(
    (state) => state.hydrateFromActivity,
  );
  const setActivityDate = useActivityBuilderStore((state) => state.setActivityDate);
  const setArea = useActivityBuilderStore((state) => state.setArea);
  const setTargetGroupSize = useActivityBuilderStore(
    (state) => state.setTargetGroupSize,
  );
  const toggleParticipant = useActivityBuilderStore(
    (state) => state.toggleParticipant,
  );
  const generateGroups = useActivityBuilderStore((state) => state.generateGroups);
  const resetDraft = useActivityBuilderStore((state) => state.resetDraft);
  const setBuilderErrors = useActivityBuilderStore((state) => state.setErrors);
  const clearBuilderErrors = useActivityBuilderStore((state) => state.clearErrors);
  const reconcileParticipants = useActivityBuilderStore(
    (state) => state.reconcileParticipants,
  );

  const hydrateStats = useStatsStore((state) => state.hydrate);

  useEffect(() => {
    hydrateMembers(initialMembers);
    reconcileParticipants(initialMembers);
  }, [hydrateMembers, initialMembers, reconcileParticipants]);

  useEffect(() => {
    if (!editingActivity) {
      return;
    }

    hydrateFromActivity(editingActivity);
  }, [editingActivity, hydrateFromActivity]);

  const memberNameById = new Map(
    members.map((member) => [member.id, member.name] as const),
  );
  const activeMembers = members.filter((member) => member.archivedAt === null);
  const managerCount = activeMembers.filter((member) => member.isManager).length;
  const archivedIncludedCount = members.length - activeMembers.length;

  async function handleSaveActivity(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearBuilderErrors();
    setActivityError(null);

    if (activityDate.trim().length === 0 || area.trim().length === 0) {
      setBuilderErrors(["Activity date and area are required."]);
      return;
    }

    if (participantMemberIds.length === 0) {
      setBuilderErrors(["Select at least one participant before saving."]);
      return;
    }

    setActivityPending(true);

    const payload = {
      activityDate,
      area: area.trim(),
      participantMemberIds,
      groupConfig: {
        targetGroupSize,
      },
      groups: generatedGroups,
      groupGeneratedAt: lastGeneratedAt ? new Date(lastGeneratedAt) : null,
    };
    const wasEditing = editingActivityId !== null;
    const result = wasEditing
      ? await updateRegularActivityAction(editingActivityId, payload)
      : await createRegularActivityAction(payload);

    if (!result.ok) {
      setActivityPending(false);
      setActivityError(result.error);
      return;
    }

    upsertActivity(result.data.activity);
    hydrateStats(result.data.stats);
    resetDraft();

    if (wasEditing) {
      router.replace("/dashboard/activity-builder");
      return;
    }

    router.refresh();
  }

  function handleCancelEdit() {
    resetDraft();
    clearBuilderErrors();
    setActivityError(null);
    router.replace("/dashboard/activity-builder");
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        badge="Activity Builder"
        description="This page owns participant selection, balanced random grouping, and create or edit flows for Saturday activities."
        title={
          editingActivityId ? "Edit regular activity" : "Create regular activity"
        }
      />

      <div className="stats stats-vertical w-full border border-base-300 bg-base-100 shadow lg:stats-horizontal">
        <div className="stat">
          <div className="stat-title">Members available</div>
          <div className="stat-value text-primary">{activeMembers.length}</div>
          <div className="stat-desc">
            {archivedIncludedCount > 0
              ? `${archivedIncludedCount} archived member${
                  archivedIncludedCount === 1 ? "" : "s"
                } kept for this edit`
              : `${managerCount} managers in the active roster`}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">Selected participants</div>
          <div className="stat-value text-secondary">
            {participantMemberIds.length}
          </div>
          <div className="stat-desc">Current activity draft</div>
        </div>
        <div className="stat">
          <div className="stat-title">Generated groups</div>
          <div className="stat-value text-accent">{generatedGroups.length}</div>
          <div className="stat-desc">
            {editingActivityId ? "Editing saved activity" : "New draft"}
          </div>
        </div>
      </div>

      <section className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body gap-5">
          {editingActivityId ? (
            <div className="alert alert-info">
              <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <span>
                  Editing a saved activity. Saving will update the existing record.
                </span>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={handleCancelEdit}
                  type="button"
                >
                  Cancel edit
                </button>
              </div>
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={handleSaveActivity}>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="form-control gap-2">
                <span className="label-text font-medium">Saturday date</span>
                <input
                  className="input input-bordered w-full"
                  onChange={(event) => setActivityDate(event.target.value)}
                  type="date"
                  value={activityDate}
                />
              </label>

              <label className="form-control gap-2 md:col-span-2">
                <span className="label-text font-medium">Area</span>
                <input
                  className="input input-bordered w-full"
                  onChange={(event) => setArea(event.target.value)}
                  placeholder="Gangnam, Mapo, Seongsu..."
                  value={area}
                />
              </label>
            </div>

            <label className="form-control gap-2">
              <span className="label-text font-medium">People per group</span>
              <input
                className="input input-bordered w-full"
                min={2}
                onChange={(event) =>
                  setTargetGroupSize(Math.max(2, Number(event.target.value) || 2))
                }
                type="number"
                value={targetGroupSize}
              />
            </label>

            <div className="space-y-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">Selected participants</p>
                  <p className="text-sm text-base-content/60">
                    {participantMemberIds.length} selected in the current draft
                  </p>
                </div>
                <button
                  className="btn btn-outline"
                  onClick={() => generateGroups(members)}
                  type="button"
                >
                  Generate balanced groups
                </button>
              </div>

              <div className="grid max-h-80 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                {members.map((member) => {
                  const selected = participantMemberIds.includes(member.id);

                  return (
                    <button
                      key={member.id}
                      className={`btn h-auto min-h-24 justify-start whitespace-normal px-4 py-4 text-left ${
                        selected ? "btn-primary" : "btn-outline"
                      }`}
                      onClick={() => toggleParticipant(member.id)}
                      type="button"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">{member.name}</span>
                          {member.archivedAt ? (
                            <span className="badge badge-warning badge-outline badge-sm">
                              Archived
                            </span>
                          ) : null}
                        </div>
                        <div className="text-xs uppercase tracking-[0.2em] opacity-70">
                          {member.gender}
                          {member.isManager ? " • manager" : ""}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {builderErrors.length > 0 ? (
              <div className="alert alert-error">
                <div className="space-y-1">
                  {builderErrors.map((error) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              </div>
            ) : null}

            {activityError ? (
              <div className="alert alert-error">
                <span>{activityError}</span>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  className="btn btn-primary"
                  disabled={activityPending}
                  type="submit"
                >
                  {activityPending
                    ? "Saving..."
                    : editingActivityId
                      ? "Update activity"
                      : "Create activity"}
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={resetDraft}
                  type="button"
                >
                  Reset draft
                </button>
              </div>

              {lastGeneratedAt ? (
                <span className="badge badge-ghost badge-lg">
                  Last generated{" "}
                  {new Date(lastGeneratedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              ) : null}
            </div>
          </form>

          {generatedGroups.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {generatedGroups.map((group) => (
                <div
                  key={group.groupNumber}
                  className="card border border-base-300 bg-base-200 shadow-sm"
                >
                  <div className="card-body gap-3 p-4">
                    <div className="flex items-center justify-between">
                      <h2 className="card-title text-base">
                        Group {group.groupNumber}
                      </h2>
                      <span className="badge badge-primary badge-outline">
                        {group.memberIds.length} members
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.memberIds.map((memberId) => (
                        <span
                          key={memberId}
                          className="badge badge-outline badge-lg"
                        >
                          {memberNameById.get(memberId) ?? "Unknown member"}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
