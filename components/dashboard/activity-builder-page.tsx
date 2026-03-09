"use client";

import { useEffect, useRef, useState } from "react";
import {
  AutoScrollActivator,
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  TraversalOrder,
  closestCorners,
  pointerWithin,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors,
  type AutoScrollOptions,
  type CollisionDetection,
  type DragOverEvent,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import {
  createRegularActivityAction,
  updateRegularActivityAction,
} from "../../app/actions";
import {
  activityGroupsEqual,
  getGroupDropId,
  getMemberItemId,
  moveMemberBetweenGroups,
  parseMemberItemId,
  resolveCommittedGroupMoveTarget,
  resolveGroupMoveTarget,
  type GroupMoveTarget,
} from "../../lib/activity-group-dnd";
import { useActivitiesStore } from "../../lib/stores/activities-store";
import { useActivityBuilderStore } from "../../lib/stores/activity-builder-store";
import { useMembersStore } from "../../lib/stores/members-store";
import { useStatsStore } from "../../lib/stores/stats-store";
import type { ActivityGroup, Member, RegularActivity } from "../../lib/types/domain";
import { SectionHeader } from "./section-header";

type ActivityBuilderPageProps = {
  initialMembers: Member[];
  editingActivity: RegularActivity | null;
};

const mobileTouchActivationConstraint = {
  delay: 180,
  tolerance: 8,
} as const;

function isPageScrollElement(element: Element) {
  if (typeof document === "undefined") {
    return false;
  }

  return (
    element === document.scrollingElement ||
    element === document.documentElement ||
    element === document.body
  );
}

const mobileEdgeAutoScrollOptions: AutoScrollOptions = {
  enabled: true,
  activator: AutoScrollActivator.Pointer,
  threshold: {
    y: 0.24,
    x: 0.08,
  },
  acceleration: 12,
  interval: 5,
  order: TraversalOrder.TreeOrder,
  canScroll: isPageScrollElement,
};

const activityGroupCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);

  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }

  const cornerCollisions = closestCorners(args);

  if (cornerCollisions.length > 0) {
    return cornerCollisions;
  }

  return rectIntersection(args);
};

type SortableGroupMemberProps = {
  member: Member | null;
  memberId: string;
};

type GroupMemberCardProps = {
  member: Member | null;
  dragState?: "idle" | "placeholder" | "overlay";
};

function GroupMemberCard({
  member,
  dragState = "idle",
}: GroupMemberCardProps) {
  return (
    <div
      className={`card min-h-[84px] border text-left transition ${
        dragState === "overlay"
          ? "border-primary/50 bg-base-100 shadow-xl"
          : dragState === "placeholder"
            ? "border-base-300 bg-base-100/70 opacity-35 shadow-none"
            : "border-base-300 bg-base-100 shadow-sm"
      }`}
      data-drag-state={dragState}
    >
      <div className="card-body gap-2 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{member?.name ?? "Unknown member"}</span>
          {member?.isManager ? (
            <span className="badge badge-secondary badge-outline badge-sm">
              Manager
            </span>
          ) : null}
          {member?.archivedAt ? (
            <span className="badge badge-warning badge-outline badge-sm">
              Archived
            </span>
          ) : null}
        </div>
        <span className="text-xs uppercase tracking-[0.2em] text-base-content/60">
          {member?.gender ?? "unknown"}
        </span>
      </div>
    </div>
  );
}

function SortableGroupMember({ member, memberId }: SortableGroupMemberProps) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: getMemberItemId(memberId),
  });

  return (
    <button
      ref={setNodeRef}
      className={`w-full rounded-box text-left touch-manipulation select-none ${
        isDragging ? "pointer-events-none" : ""
      }`}
      style={{
        transform: isDragging ? undefined : CSS.Transform.toString(transform),
        transition: isDragging ? undefined : transition,
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
      }}
      type="button"
      {...attributes}
      {...listeners}
    >
      <GroupMemberCard
        dragState={isDragging ? "placeholder" : "idle"}
        member={member}
      />
    </button>
  );
}

type DroppableGroupColumnProps = {
  activeDragMemberId: string | null;
  group: ActivityGroup;
  membersById: Map<string, Member>;
};

function DroppableGroupColumn({
  activeDragMemberId,
  group,
  membersById,
}: DroppableGroupColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: getGroupDropId(group.groupNumber),
  });

  return (
    <div
      ref={setNodeRef}
      className={`card min-h-[20rem] border border-base-300 bg-base-200 shadow-sm transition ${
        isOver
          ? "bg-primary/5 ring-2 ring-primary/40 shadow-md"
          : activeDragMemberId
            ? "ring-1 ring-base-300/80"
            : ""
      }`}
    >
      <div className="card-body flex h-full gap-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="card-title text-base">Group {group.groupNumber}</h2>
          <span className="badge badge-primary badge-outline">
            {group.memberIds.length} members
          </span>
        </div>

        <SortableContext
          items={group.memberIds.map((memberId) => getMemberItemId(memberId))}
          strategy={verticalListSortingStrategy}
        >
          <div className="min-h-[12rem] space-y-3 rounded-box border border-dashed border-base-300/80 bg-base-100/50 p-3">
            {group.memberIds.length === 0 ? (
              <div className="rounded-box border border-dashed border-base-300 bg-base-100 px-4 py-8 text-center text-sm text-base-content/60">
                Drop a member here
              </div>
            ) : (
              group.memberIds.map((memberId) => (
                <SortableGroupMember
                  key={memberId}
                  member={membersById.get(memberId) ?? null}
                  memberId={memberId}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

export function ActivityBuilderPage({
  initialMembers,
  editingActivity,
}: ActivityBuilderPageProps) {
  const router = useRouter();
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: mobileTouchActivationConstraint,
    }),
  );
  const [activeDragMemberId, setActiveDragMemberId] = useState<string | null>(null);
  const [previewGroups, setPreviewGroups] = useState<ActivityGroup[] | null>(null);
  const previewMoveTargetRef = useRef<GroupMoveTarget | null>(null);

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
  const memberPickerDraftIds = useActivityBuilderStore(
    (state) => state.memberPickerDraftIds,
  );
  const isMemberPickerOpen = useActivityBuilderStore(
    (state) => state.isMemberPickerOpen,
  );
  const memberSearch = useActivityBuilderStore((state) => state.memberSearch);
  const targetGroupCount = useActivityBuilderStore((state) => state.targetGroupCount);
  const generatedGroups = useActivityBuilderStore((state) => state.generatedGroups);
  const editingActivityId = useActivityBuilderStore(
    (state) => state.editingActivityId,
  );
  const builderWarnings = useActivityBuilderStore((state) => state.warnings);
  const builderErrors = useActivityBuilderStore((state) => state.errors);
  const lastGeneratedAt = useActivityBuilderStore((state) => state.lastGeneratedAt);
  const hydrateFromActivity = useActivityBuilderStore(
    (state) => state.hydrateFromActivity,
  );
  const setActivityDate = useActivityBuilderStore((state) => state.setActivityDate);
  const setArea = useActivityBuilderStore((state) => state.setArea);
  const openMemberPicker = useActivityBuilderStore((state) => state.openMemberPicker);
  const closeMemberPicker = useActivityBuilderStore(
    (state) => state.closeMemberPicker,
  );
  const toggleMemberPickerMember = useActivityBuilderStore(
    (state) => state.toggleMemberPickerMember,
  );
  const confirmMemberPicker = useActivityBuilderStore(
    (state) => state.confirmMemberPicker,
  );
  const setMemberSearch = useActivityBuilderStore((state) => state.setMemberSearch);
  const setTargetGroupCount = useActivityBuilderStore(
    (state) => state.setTargetGroupCount,
  );
  const syncWarnings = useActivityBuilderStore((state) => state.syncWarnings);
  const generateGroups = useActivityBuilderStore((state) => state.generateGroups);
  const moveGroupMember = useActivityBuilderStore((state) => state.moveGroupMember);
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
    if (editingActivity) {
      hydrateFromActivity(editingActivity);
      return;
    }

    if (editingActivityId) {
      resetDraft();
    }
  }, [editingActivity, editingActivityId, hydrateFromActivity, resetDraft]);

  useEffect(() => {
    syncWarnings(members);
  }, [members, participantMemberIds, syncWarnings, targetGroupCount]);

  useEffect(() => {
    if (!activeDragMemberId || typeof document === "undefined") {
      return;
    }

    const html = document.documentElement;
    const body = document.body;
    const scrollingElement =
      document.scrollingElement instanceof HTMLElement
        ? document.scrollingElement
        : null;

    const previousHtmlScrollBehavior = html.style.scrollBehavior;
    const previousBodyScrollBehavior = body.style.scrollBehavior;
    const previousScrollingElementScrollBehavior = scrollingElement?.style.scrollBehavior;

    html.style.scrollBehavior = "auto";
    body.style.scrollBehavior = "auto";

    if (scrollingElement) {
      scrollingElement.style.scrollBehavior = "auto";
    }

    return () => {
      html.style.scrollBehavior = previousHtmlScrollBehavior;
      body.style.scrollBehavior = previousBodyScrollBehavior;

      if (scrollingElement) {
        scrollingElement.style.scrollBehavior =
          previousScrollingElementScrollBehavior ?? "";
      }
    };
  }, [activeDragMemberId]);

  const membersById = new Map(members.map((member) => [member.id, member] as const));
  const selectedMembers = participantMemberIds
    .map((memberId) => membersById.get(memberId))
    .filter((member): member is Member => Boolean(member));
  const selectedManagerCount = selectedMembers.filter((member) => member.isManager).length;
  const archivedIncludedCount = members.filter((member) => member.archivedAt !== null).length;
  const visiblePickerMembers = members.filter((member) =>
    member.name.toLowerCase().includes(memberSearch.trim().toLowerCase()),
  );
  const activeDragMember =
    activeDragMemberId ? membersById.get(activeDragMemberId) ?? null : null;
  const displayedGroups = previewGroups ?? generatedGroups;
  const safeTargetGroupCount =
    Number.isInteger(targetGroupCount) && targetGroupCount >= 1
      ? targetGroupCount
      : Math.max(1, generatedGroups.length);

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

    if (safeTargetGroupCount > participantMemberIds.length) {
      setBuilderErrors([
        "Number of groups cannot be greater than the selected participants.",
      ]);
      return;
    }

    if (generatedGroups.length === 0) {
      setBuilderErrors(["Generate groups before saving this activity."]);
      return;
    }

    setActivityPending(true);

    const payload = {
      activityDate,
      area: area.trim(),
      participantMemberIds,
      groupConfig: {
        targetGroupCount: safeTargetGroupCount,
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
    router.push("/dashboard/activities");
    router.refresh();
  }

  function handleCancel() {
    resetDraft();
    clearBuilderErrors();
    setActivityError(null);
    router.push("/dashboard/activities");
  }

  function handleResetDraft() {
    clearBuilderErrors();
    setActivityError(null);

    if (editingActivity) {
      hydrateFromActivity(editingActivity);
      return;
    }

    resetDraft();
  }

  function handleConfirmMembers() {
    confirmMemberPicker();
    syncWarnings(members);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveDragMemberId(parseMemberItemId(event.active.id));
    setPreviewGroups(null);
    previewMoveTargetRef.current = null;
  }

  function handleDragCancel() {
    setActiveDragMemberId(null);
    setPreviewGroups(null);
    previewMoveTargetRef.current = null;
  }

  function handleDragOver(event: DragOverEvent) {
    const activeMemberId = parseMemberItemId(event.active.id);

    if (!activeMemberId) {
      setPreviewGroups(null);
      previewMoveTargetRef.current = null;
      return;
    }

    if (!event.over) {
      setPreviewGroups(null);
      previewMoveTargetRef.current = null;
      return;
    }

    setPreviewGroups((currentPreviewGroups) => {
      const groupsForPreview = currentPreviewGroups ?? generatedGroups;
      const moveTarget = resolveGroupMoveTarget({
        activeMemberId,
        groups: groupsForPreview,
        over: event.over,
      });

      if (!moveTarget) {
        return currentPreviewGroups;
      }

      previewMoveTargetRef.current = moveTarget;

      const nextPreviewGroups = moveMemberBetweenGroups(groupsForPreview, {
        activeMemberId,
        ...moveTarget,
      });

      if (activityGroupsEqual(nextPreviewGroups, generatedGroups)) {
        return null;
      }

      if (activityGroupsEqual(nextPreviewGroups, currentPreviewGroups)) {
        return currentPreviewGroups;
      }

      return nextPreviewGroups;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const activeMemberId = parseMemberItemId(event.active.id);

    try {
      if (!activeMemberId) {
        return;
      }

      const moveTarget = resolveCommittedGroupMoveTarget({
        activeMemberId,
        groups: displayedGroups,
        over: event.over,
        previewMoveTarget: previewMoveTargetRef.current,
      });

      if (!moveTarget) {
        return;
      }

      moveGroupMember({
        activeMemberId,
        ...moveTarget,
      });
    } finally {
      setActiveDragMemberId(null);
      setPreviewGroups(null);
      previewMoveTargetRef.current = null;
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        badge="Activities"
        description="Create or edit a Saturday activity by choosing a date and location, selecting members, generating groups, and then adjusting them manually."
        title={editingActivity ? "Edit activity" : "Add activity"}
      />

      <div className="stats stats-vertical w-full border border-base-300 bg-base-100 shadow-sm lg:stats-horizontal">
        <div className="stat">
          <div className="stat-title">Selected members</div>
          <div className="stat-value text-primary">{participantMemberIds.length}</div>
          <div className="stat-desc">
            {selectedManagerCount} manager{selectedManagerCount === 1 ? "" : "s"} selected
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">Target groups</div>
          <div className="stat-value text-secondary">{targetGroupCount}</div>
          <div className="stat-desc">Use manager-first random grouping</div>
        </div>
        <div className="stat">
          <div className="stat-title">Generated groups</div>
          <div className="stat-value text-accent">{generatedGroups.length}</div>
          <div className="stat-desc">
            {archivedIncludedCount > 0
              ? `${archivedIncludedCount} archived member${
                  archivedIncludedCount === 1 ? "" : "s"
                } kept for edit`
              : editingActivity
                ? "Editing an existing activity"
                : "New activity draft"}
          </div>
        </div>
      </div>

      <section className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body gap-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {editingActivity ? "Edit regular activity" : "New regular activity"}
              </h3>
              <p className="text-sm text-base-content/70">
                Fill the basics first, then open the member picker and generate groups.
              </p>
            </div>
            <button className="btn btn-ghost" onClick={handleCancel} type="button">
              Back to activities
            </button>
          </div>

          <form className="space-y-5" id="activity-form" onSubmit={handleSaveActivity}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="form-control gap-2">
                <span className="label-text font-medium">Saturday date</span>
                <input
                  className="input input-bordered w-full"
                  onChange={(event) => setActivityDate(event.target.value)}
                  type="date"
                  value={activityDate}
                />
              </label>

              <label className="form-control gap-2">
                <span className="label-text font-medium">Location</span>
                <input
                  className="input input-bordered w-full"
                  onChange={(event) => setArea(event.target.value)}
                  placeholder="Gangnam, Mapo, Seongsu..."
                  value={area}
                />
              </label>
            </div>

            <div className="card border border-base-300 bg-base-200 shadow-sm">
              <div className="card-body gap-4 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h4 className="font-semibold">Selected members</h4>
                    <p className="text-sm text-base-content/60">
                      Pick participants in a dedicated modal with search.
                    </p>
                  </div>
                  <button
                    className="btn btn-outline"
                    onClick={openMemberPicker}
                    type="button"
                  >
                    Select members
                  </button>
                </div>

                {selectedMembers.length === 0 ? (
                  <div className="alert">
                    <span>No members selected yet.</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedMembers.map((member) => (
                      <span
                        key={member.id}
                        className="badge badge-outline badge-lg gap-2 px-3 py-3"
                      >
                        {member.name}
                        {member.isManager ? " • manager" : ""}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="card border border-base-300 bg-base-200 shadow-sm">
              <div className="card-body gap-4 p-4">
                <div className="grid gap-4 md:grid-cols-[minmax(0,260px)_1fr]">
                  <label className="form-control gap-2">
                    <span className="label-text font-medium">Number of groups</span>
                    <input
                      className="input input-bordered w-full"
                      disabled={participantMemberIds.length === 0}
                      min={1}
                      onChange={(event) =>
                        setTargetGroupCount(Math.max(1, Number(event.target.value) || 1))
                      }
                      type="number"
                      value={safeTargetGroupCount}
                    />
                  </label>

                  <div className="flex items-end">
                    <button
                      className="btn btn-primary w-full md:w-auto"
                      disabled={participantMemberIds.length === 0}
                      onClick={() => generateGroups(members)}
                      type="button"
                    >
                      Generate groups
                    </button>
                  </div>
                </div>

                {builderWarnings.length > 0 ? (
                  <div className="alert alert-warning">
                    <div className="space-y-1">
                      {builderWarnings.map((warning) => (
                        <p key={warning}>{warning}</p>
                      ))}
                    </div>
                  </div>
                ) : null}
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

          </form>
        </div>
      </section>

      <section className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body gap-5">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Adjust generated groups</h3>
            <p className="text-sm text-base-content/70">
              Drag members between groups or reorder inside the same group before
              saving.
            </p>
            <p className="text-sm text-base-content/60">
              Long-press a member to drag on mobile, then move near the top or
              bottom edge to scroll.
            </p>
          </div>

          {generatedGroups.length === 0 ? (
            <div className="alert">
              <span>Generate groups to start arranging members.</span>
            </div>
          ) : (
            <DndContext
              autoScroll={mobileEdgeAutoScrollOptions}
              collisionDetection={activityGroupCollisionDetection}
              onDragCancel={handleDragCancel}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragStart={handleDragStart}
              sensors={sensors}
            >
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {displayedGroups.map((group) => (
                  <DroppableGroupColumn
                    activeDragMemberId={activeDragMemberId}
                    key={group.groupNumber}
                    group={group}
                    membersById={membersById}
                  />
                ))}
              </div>
              <DragOverlay>
                {activeDragMember ? (
                  <div className="w-[18rem] max-w-[80vw] rotate-1">
                    <GroupMemberCard dragState="overlay" member={activeDragMember} />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </section>

      <section className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                className="btn btn-primary"
                disabled={activityPending}
                form="activity-form"
                type="submit"
              >
                {activityPending
                  ? "Saving..."
                  : editingActivity
                    ? "Update activity"
                    : "Create activity"}
              </button>
              <button
                className="btn btn-ghost"
                onClick={handleResetDraft}
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
        </div>
      </section>

      {isMemberPickerOpen ? (
        <div className="modal modal-open" role="dialog">
          <div className="modal-box max-w-4xl space-y-5">
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Select members</h2>
              <p className="text-sm text-base-content/70">
                Search and select participants for this activity, then confirm the
                roster.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <input
                className="input input-bordered w-full"
                onChange={(event) => setMemberSearch(event.target.value)}
                placeholder="Search members"
                value={memberSearch}
              />
              <span className="badge badge-outline badge-lg">
                {memberPickerDraftIds.length} selected
              </span>
            </div>

            <div className="grid max-h-[28rem] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
              {visiblePickerMembers.length === 0 ? (
                <div className="alert sm:col-span-2 lg:col-span-3">
                  <span>No members match the search.</span>
                </div>
              ) : (
                visiblePickerMembers.map((member) => {
                  const selected = memberPickerDraftIds.includes(member.id);

                  return (
                    <button
                      key={member.id}
                      className={`rounded-box border px-3 py-3 text-left transition ${
                        selected
                          ? "border-primary bg-primary text-primary-content"
                          : "border-base-300 bg-base-100 hover:border-primary/40"
                      }`}
                      onClick={() => toggleMemberPickerMember(member.id)}
                      type="button"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">{member.name}</span>
                          {member.isManager ? (
                            <span className="badge badge-secondary badge-outline badge-xs">
                              Manager
                            </span>
                          ) : null}
                          {member.archivedAt ? (
                            <span className="badge badge-warning badge-outline badge-xs">
                              Archived
                            </span>
                          ) : null}
                        </div>
                        <div className="text-[11px] uppercase tracking-[0.16em] opacity-80">
                          {member.gender}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="modal-action mt-0">
              <button className="btn btn-ghost" onClick={closeMemberPicker} type="button">
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleConfirmMembers} type="button">
                Confirm members
              </button>
            </div>
          </div>
          <button
            aria-label="Close member picker"
            className="modal-backdrop"
            onClick={closeMemberPicker}
            type="button"
          />
        </div>
      ) : null}
    </div>
  );
}
