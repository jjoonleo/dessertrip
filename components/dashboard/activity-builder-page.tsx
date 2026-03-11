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
  useDraggable,
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
  createActivityAction,
  updateActivityAction,
} from "../../app/actions";
import { getActivityTypeConfig } from "../../lib/activity";
import { formatParticipationScore } from "../../lib/participation";
import { useI18n } from "../i18n/i18n-context";
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
import type { Activity, ActivityGroup, Member } from "../../lib/types/domain";
import { FormField } from "../ui/form-field";
import { SectionHeader } from "./section-header";

type ActivityBuilderPageProps = {
  initialMembers: Member[];
  editingActivity: Activity | null;
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
  archivedLabel: string;
  femaleLabel: string;
  managerLabel: string;
  maleLabel: string;
  member: Member | null;
  memberId: string;
  unknownGenderLabel: string;
  unknownMemberLabel: string;
};

type GroupMemberCardProps = {
  archivedLabel: string;
  femaleLabel: string;
  managerLabel: string;
  maleLabel: string;
  member: Member | null;
  dragState?: "idle" | "placeholder" | "overlay";
  unknownGenderLabel: string;
  unknownMemberLabel: string;
};

function GroupMemberCard({
  archivedLabel,
  femaleLabel,
  managerLabel,
  maleLabel,
  member,
  dragState = "idle",
  unknownGenderLabel,
  unknownMemberLabel,
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
          <span className="font-semibold">
            {member?.name ?? unknownMemberLabel}
          </span>
          {member?.isManager ? (
            <span className="badge badge-secondary badge-outline badge-sm">
              {managerLabel}
            </span>
          ) : null}
          {member?.archivedAt ? (
            <span className="badge badge-warning badge-outline badge-sm">
              {archivedLabel}
            </span>
          ) : null}
        </div>
        <span className="text-xs uppercase tracking-[0.2em] text-base-content/60">
          {member
            ? member.gender === "female"
              ? femaleLabel
              : maleLabel
            : unknownGenderLabel}
        </span>
      </div>
    </div>
  );
}

function SortableGroupMember({
  archivedLabel,
  femaleLabel,
  managerLabel,
  maleLabel,
  member,
  memberId,
  unknownGenderLabel,
  unknownMemberLabel,
}: SortableGroupMemberProps) {
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
        archivedLabel={archivedLabel}
        dragState={isDragging ? "placeholder" : "idle"}
        femaleLabel={femaleLabel}
        managerLabel={managerLabel}
        maleLabel={maleLabel}
        member={member}
        unknownGenderLabel={unknownGenderLabel}
        unknownMemberLabel={unknownMemberLabel}
      />
    </button>
  );
}

function DraggableUnassignedMember({
  archivedLabel,
  femaleLabel,
  managerLabel,
  maleLabel,
  member,
  memberId,
  unknownGenderLabel,
  unknownMemberLabel,
}: SortableGroupMemberProps) {
  const { attributes, isDragging, listeners, setNodeRef, transform } = useDraggable({
    id: getMemberItemId(memberId),
  });

  return (
    <button
      ref={setNodeRef}
      className={`w-full rounded-box text-left touch-manipulation select-none ${
        isDragging ? "pointer-events-none" : ""
      }`}
      style={{
        transform: CSS.Transform.toString(transform),
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
      }}
      type="button"
      {...attributes}
      {...listeners}
    >
      <GroupMemberCard
        archivedLabel={archivedLabel}
        dragState={isDragging ? "placeholder" : "idle"}
        femaleLabel={femaleLabel}
        managerLabel={managerLabel}
        maleLabel={maleLabel}
        member={member}
        unknownGenderLabel={unknownGenderLabel}
        unknownMemberLabel={unknownMemberLabel}
      />
    </button>
  );
}

type DroppableGroupColumnProps = {
  activeDragMemberId: string | null;
  archivedLabel: string;
  dropHereLabel: string;
  femaleLabel: string;
  group: ActivityGroup;
  groupMembersCountLabel: (count: number) => string;
  groupTitleLabel: (groupNumber: number) => string;
  managerLabel: string;
  maleLabel: string;
  membersById: Map<string, Member>;
  unknownGenderLabel: string;
  unknownMemberLabel: string;
};

function DroppableGroupColumn({
  activeDragMemberId,
  archivedLabel,
  dropHereLabel,
  femaleLabel,
  group,
  groupMembersCountLabel,
  groupTitleLabel,
  managerLabel,
  maleLabel,
  membersById,
  unknownGenderLabel,
  unknownMemberLabel,
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
          <h2 className="card-title text-base">
            {groupTitleLabel(group.groupNumber)}
          </h2>
          <span className="badge badge-primary badge-outline">
            {groupMembersCountLabel(group.memberIds.length)}
          </span>
        </div>

        <SortableContext
          items={group.memberIds.map((memberId) => getMemberItemId(memberId))}
          strategy={verticalListSortingStrategy}
        >
          <div className="min-h-[12rem] space-y-3 rounded-box border border-dashed border-base-300/80 bg-base-100/50 p-3">
            {group.memberIds.length === 0 ? (
              <div className="rounded-box border border-dashed border-base-300 bg-base-100 px-4 py-8 text-center text-sm text-base-content/60">
                {dropHereLabel}
              </div>
            ) : (
              group.memberIds.map((memberId) => (
                <SortableGroupMember
                  archivedLabel={archivedLabel}
                  femaleLabel={femaleLabel}
                  key={memberId}
                  managerLabel={managerLabel}
                  maleLabel={maleLabel}
                  member={membersById.get(memberId) ?? null}
                  memberId={memberId}
                  unknownGenderLabel={unknownGenderLabel}
                  unknownMemberLabel={unknownMemberLabel}
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
  const { locale, t } = useI18n();
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
  const activityType = useActivityBuilderStore((state) => state.activityType);
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
  const setActivityType = useActivityBuilderStore((state) => state.setActivityType);
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
  const setStatsLocale = useStatsStore((state) => state.setLocale);

  useEffect(() => {
    hydrateMembers(initialMembers, locale);
    reconcileParticipants(initialMembers);
  }, [hydrateMembers, initialMembers, locale, reconcileParticipants]);

  useEffect(() => {
    setStatsLocale(locale);
  }, [locale, setStatsLocale]);

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
  }, [activityType, members, participantMemberIds, syncWarnings, targetGroupCount]);

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
  const isRegularMode = activityType === "regular";
  const assignedMemberIds = new Set(
    generatedGroups.flatMap((group) => group.memberIds),
  );
  const displayedAssignedMemberIds = new Set(
    displayedGroups.flatMap((group) => group.memberIds),
  );
  const unassignedMemberIds = participantMemberIds.filter(
    (memberId) => !displayedAssignedMemberIds.has(memberId),
  );
  const unassignedMembers = unassignedMemberIds
    .map((memberId) => membersById.get(memberId))
    .filter((member): member is Member => Boolean(member));
  const participationWeight = getActivityTypeConfig(activityType).participationWeight;
  const safeTargetGroupCount =
    Number.isInteger(targetGroupCount) && targetGroupCount >= 1
      ? targetGroupCount
      : Math.max(1, generatedGroups.length);

  async function handleSaveActivity(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearBuilderErrors();
    setActivityError(null);

    if (activityDate.trim().length === 0 || area.trim().length === 0) {
      setBuilderErrors(["builder.validation.requiredFields"]);
      return;
    }

    if (participantMemberIds.length === 0) {
      setBuilderErrors(["builder.validation.noParticipantsSave"]);
      return;
    }

    if (isRegularMode && safeTargetGroupCount > participantMemberIds.length) {
      setBuilderErrors(["builder.validation.targetTooLarge"]);
      return;
    }

    if (isRegularMode && generatedGroups.length === 0) {
      setBuilderErrors(["builder.validation.generateBeforeSave"]);
      return;
    }

    if (
      isRegularMode &&
      participantMemberIds.some((memberId) => !assignedMemberIds.has(memberId))
    ) {
      setBuilderErrors(["errors.validation.activity.groupsMustCoverParticipants"]);
      return;
    }

    if (isRegularMode && generatedGroups.some((group) => group.memberIds.length === 0)) {
      setBuilderErrors(["errors.validation.activity.groupMemberRequired"]);
      return;
    }

    setActivityPending(true);

    const payload = {
      activityType,
      activityDate,
      area: area.trim(),
      participantMemberIds,
      groupConfig: isRegularMode
        ? {
            targetGroupCount: safeTargetGroupCount,
          }
        : null,
      groups: isRegularMode ? generatedGroups : [],
      groupGeneratedAt:
        isRegularMode && lastGeneratedAt ? new Date(lastGeneratedAt) : null,
    };
    const wasEditing = editingActivityId !== null;
    const result = wasEditing
      ? await updateActivityAction(editingActivityId, payload)
      : await createActivityAction(payload);

    if (!result.ok) {
      setActivityPending(false);
      setActivityError(result.error);
      return;
    }

    upsertActivity(result.data.activity);
    hydrateStats(result.data.stats, locale);
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
        badge={t("builder.badge")}
        description={t("builder.description")}
        title={editingActivity ? t("builder.title.edit") : t("builder.title.add")}
      />

      <div className="stats stats-vertical w-full border border-base-300 bg-base-100 shadow-sm lg:stats-horizontal">
        <div className="stat">
          <div className="stat-title">
            {t("builder.stats.selectedMembers.title")}
          </div>
          <div className="stat-value text-primary">{participantMemberIds.length}</div>
          <div className="stat-desc">
            {t("builder.stats.selectedMembers.description", {
              count: selectedManagerCount,
            })}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">{t("builder.stats.activityType.title")}</div>
          <div className="stat-value text-secondary">
            {activityType === "flash"
              ? t("common.activityType.flash")
              : t("common.activityType.regular")}
          </div>
          <div className="stat-desc">
            {t("builder.stats.activityType.description")}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">
            {isRegularMode
              ? t("builder.stats.generatedGroups.title")
              : t("builder.stats.participationWeight.title")}
          </div>
          <div className="stat-value text-accent">
            {isRegularMode
              ? generatedGroups.length
              : formatParticipationScore(participationWeight)}
          </div>
          <div className="stat-desc">
            {isRegularMode
              ? archivedIncludedCount > 0
                ? t("builder.stats.generatedGroups.archived", {
                    count: archivedIncludedCount,
                  })
                : editingActivity
                  ? t("builder.stats.generatedGroups.editing")
                  : t("builder.stats.generatedGroups.new")
              : t("builder.stats.participationWeight.description")}
          </div>
        </div>
      </div>

      <section className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body gap-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {editingActivity
                  ? t("builder.form.title.edit")
                  : t("builder.form.title.add")}
              </h3>
              <p className="text-sm text-base-content/70">
                {t("builder.form.description")}
              </p>
            </div>
            <button className="btn btn-ghost" onClick={handleCancel} type="button">
              {t("builder.form.back")}
            </button>
          </div>

          <form className="space-y-5" id="activity-form" onSubmit={handleSaveActivity}>
            <div className="grid gap-4 md:grid-cols-3">
              <FormField label={t("builder.field.type")}>
                <select
                  className="select select-bordered w-full"
                  disabled={editingActivity !== null}
                  onChange={(event) =>
                    setActivityType(event.target.value as "regular" | "flash")
                  }
                  value={activityType}
                >
                  <option value="regular">{t("common.activityType.regular")}</option>
                  <option value="flash">{t("common.activityType.flash")}</option>
                </select>
              </FormField>

              <FormField
                label={
                  activityType === "regular"
                    ? t("builder.field.dateRegular")
                    : t("builder.field.dateFlash")
                }
              >
                <input
                  className="input input-bordered w-full"
                  onChange={(event) => setActivityDate(event.target.value)}
                  type="date"
                  value={activityDate}
                />
              </FormField>

              <FormField label={t("builder.field.location")}>
                <input
                  className="input input-bordered w-full"
                  onChange={(event) => setArea(event.target.value)}
                  placeholder={t("builder.field.locationPlaceholder")}
                  value={area}
                />
              </FormField>
            </div>

            <div className="card border border-base-300 bg-base-200 shadow-sm">
              <div className="card-body gap-4 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h4 className="font-semibold">{t("builder.selected.title")}</h4>
                    <p className="text-sm text-base-content/60">
                      {t("builder.selected.description")}
                    </p>
                  </div>
                  <button
                    className="btn btn-outline"
                    onClick={openMemberPicker}
                    type="button"
                  >
                    {t("builder.selected.open")}
                  </button>
                </div>

                {selectedMembers.length === 0 ? (
                  <div className="alert">
                    <span>{t("builder.selected.empty")}</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedMembers.map((member) => (
                      <span
                        key={member.id}
                        className="badge badge-outline badge-lg gap-2 px-3 py-3"
                      >
                        {member.name}
                        {member.isManager
                          ? ` • ${t("builder.selected.managerSuffix")}`
                          : ""}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {isRegularMode ? (
              <div className="card border border-base-300 bg-base-200 shadow-sm">
                <div className="card-body gap-4 p-4">
                  <div className="grid gap-4 md:grid-cols-[minmax(0,260px)_1fr]">
                    <FormField label={t("builder.grouping.field")}>
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
                    </FormField>

                    <div className="flex items-end">
                      <button
                        className="btn btn-primary w-full md:w-auto"
                        disabled={participantMemberIds.length === 0}
                        onClick={() => generateGroups(members)}
                        type="button"
                      >
                        {generatedGroups.length > 0
                          ? t("builder.grouping.regenerate")
                          : t("builder.grouping.generate")}
                      </button>
                      {generatedGroups.length > 0 ? (
                        <p className="mt-2 text-sm text-base-content/60">
                          {t("builder.grouping.regenerateHint")}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {builderWarnings.length > 0 ? (
                    <div className="alert alert-warning">
                      <div className="space-y-1">
                        {builderWarnings.map((warning) => (
                          <p key={warning}>{t(warning)}</p>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="alert alert-info">
                <span>{t("builder.flash.notice")}</span>
              </div>
            )}

            {builderErrors.length > 0 ? (
              <div className="alert alert-error">
                <div className="space-y-1">
                  {builderErrors.map((error) => (
                    <p key={error}>{t(error)}</p>
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

      {isRegularMode ? (
        <section className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body gap-5">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{t("builder.adjust.title")}</h3>
              <p className="text-sm text-base-content/70">
                {t("builder.adjust.description")}
              </p>
              <p className="text-sm text-base-content/60">
                {t("builder.adjust.mobileHint")}
              </p>
            </div>

            {generatedGroups.length === 0 ? (
              <div className="alert">
                <span>{t("builder.adjust.empty")}</span>
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
                <div className="space-y-4">
                  {generatedGroups.length > 0 && unassignedMembers.length > 0 ? (
                    <div className="rounded-box border border-dashed border-warning/50 bg-warning/10 p-4">
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-1">
                          <h4 className="font-semibold">{t("builder.unassigned.title")}</h4>
                          <p className="text-sm text-base-content/70">
                            {t("builder.unassigned.description")}
                          </p>
                        </div>
                        <span className="badge badge-warning badge-outline">
                          {t("builder.group.membersCount", {
                            count: unassignedMembers.length,
                          })}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {unassignedMembers.map((member) => (
                          <DraggableUnassignedMember
                            archivedLabel={t("common.status.archived")}
                            femaleLabel={t("common.gender.female")}
                            key={member.id}
                            managerLabel={t("common.role.manager")}
                            maleLabel={t("common.gender.male")}
                            member={member}
                            memberId={member.id}
                            unknownGenderLabel={t("builder.member.unknownGender")}
                            unknownMemberLabel={t("builder.member.unknown")}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                    {displayedGroups.map((group) => (
                      <DroppableGroupColumn
                        activeDragMemberId={activeDragMemberId}
                        archivedLabel={t("common.status.archived")}
                        dropHereLabel={t("builder.group.dropHere")}
                        femaleLabel={t("common.gender.female")}
                        key={group.groupNumber}
                        group={group}
                        groupMembersCountLabel={(count) =>
                          t("builder.group.membersCount", { count })
                        }
                        groupTitleLabel={(groupNumber) =>
                          t("builder.group.title", { number: groupNumber })
                        }
                        managerLabel={t("common.role.manager")}
                        maleLabel={t("common.gender.male")}
                        membersById={membersById}
                        unknownGenderLabel={t("builder.member.unknownGender")}
                        unknownMemberLabel={t("builder.member.unknown")}
                      />
                    ))}
                  </div>
                </div>
                <DragOverlay>
                  {activeDragMember ? (
                    <div className="w-[18rem] max-w-[80vw] rotate-1">
                      <GroupMemberCard
                        archivedLabel={t("common.status.archived")}
                        dragState="overlay"
                        femaleLabel={t("common.gender.female")}
                        managerLabel={t("common.role.manager")}
                        maleLabel={t("common.gender.male")}
                        member={activeDragMember}
                        unknownGenderLabel={t("builder.member.unknownGender")}
                        unknownMemberLabel={t("builder.member.unknown")}
                      />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </div>
        </section>
      ) : null}

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
                  ? t("builder.actions.saving")
                  : editingActivity
                    ? t("builder.actions.update")
                    : t("builder.actions.create")}
              </button>
              <button
                className="btn btn-ghost"
                onClick={handleResetDraft}
                type="button"
              >
                {t("builder.actions.reset")}
              </button>
            </div>

            {isRegularMode && lastGeneratedAt ? (
              <span className="badge badge-ghost badge-lg">
                {t("builder.lastGenerated", {
                  time: new Intl.DateTimeFormat(
                    locale === "ko" ? "ko-KR" : "en-US",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  ).format(new Date(lastGeneratedAt)),
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
              <h2 className="text-xl font-bold">
                {t("builder.memberPicker.title")}
              </h2>
              <p className="text-sm text-base-content/70">
                {t("builder.memberPicker.description")}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <input
                className="input input-bordered w-full"
                onChange={(event) => setMemberSearch(event.target.value)}
                placeholder={t("builder.memberPicker.searchPlaceholder")}
                value={memberSearch}
              />
              <span className="badge badge-outline badge-lg">
                {t("builder.memberPicker.selected", {
                  count: memberPickerDraftIds.length,
                })}
              </span>
            </div>

            <div className="grid max-h-[28rem] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
              {visiblePickerMembers.length === 0 ? (
                <div className="alert sm:col-span-2 lg:col-span-3">
                  <span>{t("builder.memberPicker.empty")}</span>
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
                              {t("common.role.manager")}
                            </span>
                          ) : null}
                          {member.archivedAt ? (
                            <span className="badge badge-warning badge-outline badge-xs">
                              {t("common.status.archived")}
                            </span>
                          ) : null}
                        </div>
                        <div className="text-[11px] uppercase tracking-[0.16em] opacity-80">
                          {member.gender === "female"
                            ? t("common.gender.female")
                            : t("common.gender.male")}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="modal-action mt-0">
              <button className="btn btn-ghost" onClick={closeMemberPicker} type="button">
                {t("builder.memberPicker.cancel")}
              </button>
              <button className="btn btn-primary" onClick={handleConfirmMembers} type="button">
                {t("builder.memberPicker.confirm")}
              </button>
            </div>
          </div>
          <button
            aria-label={t("builder.memberPicker.close")}
            className="modal-backdrop"
            onClick={closeMemberPicker}
            type="button"
          />
        </div>
      ) : null}
    </div>
  );
}
