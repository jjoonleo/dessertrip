export const appLocales = ["ko", "en"] as const;
export const LOCALE_COOKIE_NAME = "dessertrip-locale";

export type AppLocale = (typeof appLocales)[number];

export type TranslationValues = Record<
  string,
  string | number | null | undefined
>;

export const enMessages = {
  "app.name": "Dessertrip",
  "app.metadata.description": "Management app for the Dessertrip dessert club.",
  "theme.label": "Theme",
  "theme.toggleAria": "Toggle theme",
  "theme.dark": "Dark",
  "theme.pastel": "Pastel",
  "nav.overview.label": "Overview",
  "nav.overview.description":
    "See the club summary and jump into the main workflows.",
  "nav.members.label": "Members",
  "nav.members.description":
    "Add members, manage manager roles, and filter the roster.",
  "nav.activities.label": "Activities",
  "nav.activities.description":
    "Browse regular activities and flash meetings, create new ones, and manage saved details.",
  "nav.stats.label": "Stats",
  "nav.stats.description":
    "Review per-member weighted participation scores across activities.",
  "login.hero.badge": "Dessertrip",
  "login.hero.title": "Sign in to manage Dessertrip.",
  "login.hero.description":
    "Use the manager account to manage members, activities, and participation records.",
  "login.form.title": "Manager sign in",
  "login.form.description": "Enter the manager account credentials to continue.",
  "login.form.username": "Username",
  "login.form.usernamePlaceholder": "Manager username",
  "login.form.password": "Password",
  "login.form.passwordPlaceholder": "Password",
  "login.form.submitIdle": "Sign in",
  "login.form.submitPending": "Signing in...",
  "login.form.submitDone": "Signed in",
  "dashboard.badge": "Club Admin",
  "dashboard.shell.openNavigation": "Open navigation",
  "dashboard.shell.dismissNavigation": "Dismiss navigation",
  "dashboard.shell.closeNavigation": "Close navigation",
  "dashboard.shell.signOut": "Sign out",
  "dashboard.shell.navigationTitle": "Club navigation",
  "dashboard.shell.navigationDescription":
    "Navigate between dashboard pages while keeping the shared admin shell and theme controls in place.",
  "dashboard.shell.signedIn": "Signed in",
  "dashboard.shell.activeSessionOn": "Manager session active on {{page}}",
  "overview.badge": "Overview",
  "overview.title": "Weekly dessert club control center",
  "overview.description":
    "Use the sidebar to move between dedicated pages for members, saved activities and planning, and participation stats.",
  "overview.stats.members.title": "Members",
  "overview.stats.members.description": "{{count}} managers in the roster",
  "overview.stats.activities.title": "Activities",
  "overview.stats.activities.empty": "No activities saved yet",
  "overview.stats.activities.latest": "Latest: {{name}}",
  "overview.cta.open": "Open",
  "members.badge": "Members",
  "members.title": "Member management",
  "members.description":
    "Managers can add, edit, archive, and restore members here. Archived members stay in historical records but are hidden from the active roster by default.",
  "members.stats.all.title": "All members",
  "members.stats.all.description": "Including archived members",
  "members.stats.active.title": "Active members",
  "members.stats.active.description": "Selectable for new activities",
  "members.stats.archived.title": "Archived",
  "members.stats.archived.description": "Restorable from this page",
  "members.roster.title": "Roster",
  "members.roster.summary":
    "Showing {{visible}} of {{total}} members with the current filters.",
  "members.addUser": "Add user",
  "members.filters.searchPlaceholder": "Search members",
  "members.filters.allGenders": "All genders",
  "members.filters.female": "Female",
  "members.filters.male": "Male",
  "members.filters.allRoles": "All roles",
  "members.filters.managers": "Managers",
  "members.filters.memberOnly": "Members",
  "members.filters.activeOnly": "Active only",
  "members.filters.allMembers": "All members",
  "members.filters.archivedOnly": "Archived only",
  "members.empty": "No members match the current filters.",
  "members.managerBadge": "Manager",
  "members.memberBadge": "Member",
  "members.archivedBadge": "Archived",
  "members.actions.edit": "Edit",
  "members.actions.archive": "Archive",
  "members.actions.restore": "Restore",
  "members.modal.create.title": "Add user",
  "members.modal.create.description":
    "Add a new club member to the Dessertrip roster.",
  "members.modal.edit.title": "Edit member",
  "members.modal.edit.description": "Update {{name}}'s roster information.",
  "members.modal.archive.title": "Archive member",
  "members.modal.archive.description":
    "{{name}} will disappear from the active roster but remain in historical activities and participation stats.",
  "members.modal.name": "Name",
  "members.modal.namePlaceholder": "Member name",
  "members.modal.gender": "Gender",
  "members.modal.managerCheckbox": "This member is also a club manager",
  "members.modal.cancel": "Cancel",
  "members.modal.save": "Save changes",
  "members.modal.savePending": "Saving...",
  "members.modal.archivePending": "Archiving...",
  "members.modal.closeCreate": "Close add user modal",
  "members.modal.closeEdit": "Close edit member modal",
  "members.modal.closeArchive": "Close archive member modal",
  "activities.badge": "Activities",
  "activities.title": "Activities",
  "activities.description":
    "Browse saved regular activities and flash meetings, inspect details, and jump into the create or edit form from here.",
  "activities.stats.saved.title": "Saved activities",
  "activities.stats.saved.description": "All persisted activity records",
  "activities.stats.visible.title": "Visible",
  "activities.stats.visible.description": "Current search result",
  "activities.stats.openDetail.title": "Open detail",
  "activities.stats.openDetail.description": "Expanded activity panel",
  "activities.list.title": "Saved activities",
  "activities.list.description":
    "Search past activities or start a new one from this page.",
  "activities.list.add": "Add activity",
  "activities.searchPlaceholder": "Search by activity name or area",
  "activities.empty": "No activities match the current filters.",
  "activities.collapse.hint": "Click to view activity details and actions",
  "activities.badge.participants": "{{count}} participants",
  "activities.badge.groups": "{{count}} groups",
  "activities.actions.edit": "Edit",
  "activities.actions.delete": "Delete",
  "activities.actions.confirmDelete": "Confirm delete",
  "activities.actions.cancel": "Cancel",
  "activities.groups.empty": "No saved groups yet.",
  "activities.group.title": "Group {{number}}",
  "activities.participants.title": "Participants",
  "activities.badge.members": "{{count}} members",
  "activities.unknownMember": "Unknown member",
  "activityDetail.badge": "Activity detail",
  "activityDetail.title": "{{name}}",
  "activityDetail.description":
    "Review the saved details, participants, and group assignments for {{name}}.",
  "activityDetail.stats.type.title": "Type",
  "activityDetail.stats.type.description": "Saved activity format",
  "activityDetail.stats.date.title": "Date",
  "activityDetail.stats.date.description": "Recorded activity date",
  "activityDetail.stats.area.title": "Area",
  "activityDetail.stats.area.description": "Saved meeting location",
  "activityDetail.stats.participants.title": "Participants",
  "activityDetail.stats.participants.description":
    "Members included in this activity",
  "activityDetail.stats.score.title": "Participation score",
  "activityDetail.stats.score.description": "Weighted value used in stats",
  "activityDetail.stats.groups.title": "Groups",
  "activityDetail.stats.groups.description": "Saved group assignments",
  "activityDetail.actions.title": "Next steps",
  "activityDetail.actions.description":
    "Return to the previous view or open the editable form.",
  "activityDetail.actions.backToHistory": "Back to member history",
  "activityDetail.actions.backToActivities": "Back to activities",
  "activityDetail.actions.edit": "Edit activity",
  "activityDetail.participants.title": "Participants",
  "activityDetail.participants.description":
    "All saved members included in this activity.",
  "activityDetail.groups.title": "Group assignments",
  "activityDetail.groups.description":
    "Saved groups for this regular activity.",
  "activityDetail.groups.empty": "No saved groups for this activity.",
  "builder.badge": "Activities",
  "builder.title.add": "Add activity",
  "builder.title.edit": "Edit activity",
  "builder.description":
    "Create or edit a regular activity or flash meeting by choosing a date and location, selecting members, and optionally generating groups for regular activities.",
  "builder.stats.selectedMembers.title": "Selected members",
  "builder.stats.selectedMembers.description": "{{count}} managers selected",
  "builder.stats.activityType.title": "Activity type",
  "builder.stats.activityType.description":
    "Regular activities require groups. Flash meetings do not.",
  "builder.stats.targetGroups.title": "Target groups",
  "builder.stats.targetGroups.description":
    "Use manager-first random grouping",
  "builder.stats.generatedGroups.title": "Generated groups",
  "builder.stats.generatedGroups.archived":
    "{{count}} archived members kept for edit",
  "builder.stats.generatedGroups.editing": "Editing an existing activity",
  "builder.stats.generatedGroups.new": "New activity draft",
  "builder.stats.participationWeight.title": "Participation score",
  "builder.stats.participationWeight.description":
    "Each flash meeting adds 0.5 to participation stats.",
  "builder.form.title.add": "New activity",
  "builder.form.title.edit": "Edit activity",
  "builder.form.description":
    "Fill the basics first, then open the member picker. Generate groups only for regular activities.",
  "builder.form.back": "Back to activities",
  "builder.field.type": "Activity type",
  "builder.field.date": "Activity date",
  "builder.field.dateRegular": "Saturday date",
  "builder.field.dateFlash": "Meeting date",
  "builder.field.location": "Location",
  "builder.field.locationPlaceholder": "Gangnam, Mapo, Seongsu...",
  "builder.selected.title": "Selected members",
  "builder.selected.description":
    "Pick participants in a dedicated modal with search.",
  "builder.selected.open": "Select members",
  "builder.selected.empty": "No members selected yet.",
  "builder.selected.managerSuffix": "manager",
  "builder.grouping.field": "Number of groups",
  "builder.grouping.generate": "Generate groups",
  "builder.flash.notice":
    "Flash meetings do not use groups. Saving will record only the selected participants.",
  "builder.validation.requiredFields":
    "Activity date and area are required.",
  "builder.validation.noParticipantsSave":
    "Select at least one participant before saving.",
  "builder.validation.targetTooLarge":
    "Number of groups cannot be greater than the selected participants.",
  "builder.validation.generateBeforeSave":
    "Generate groups before saving this activity.",
  "builder.validation.noParticipantsGenerate":
    "Select at least one participant before generating groups.",
  "builder.warning.managerShortage":
    "Group count is greater than the selected manager count, so some groups may not have a manager.",
  "builder.adjust.title": "Adjust generated groups",
  "builder.adjust.description":
    "Drag members between groups or reorder inside the same group before saving.",
  "builder.adjust.mobileHint":
    "Long-press a member to drag on mobile, then move near the top or bottom edge to scroll.",
  "builder.adjust.empty": "Generate groups to start arranging members.",
  "builder.group.title": "Group {{number}}",
  "builder.group.membersCount": "{{count}} members",
  "builder.group.dropHere": "Drop a member here",
  "builder.actions.saving": "Saving...",
  "builder.actions.update": "Update activity",
  "builder.actions.create": "Save",
  "builder.actions.reset": "Reset draft",
  "builder.lastGenerated": "Last generated {{time}}",
  "builder.memberPicker.title": "Select members",
  "builder.memberPicker.description":
    "Search and select participants for this activity, then confirm the roster.",
  "builder.memberPicker.searchPlaceholder": "Search members",
  "builder.memberPicker.selected": "{{count}} selected",
  "builder.memberPicker.empty": "No members match the search.",
  "builder.memberPicker.cancel": "Cancel",
  "builder.memberPicker.confirm": "Confirm members",
  "builder.memberPicker.close": "Close member picker",
  "builder.member.unknown": "Unknown member",
  "builder.member.unknownGender": "unknown",
  "stats.badge": "Stats",
  "stats.title": "Member participation",
  "stats.description":
    "Weighted participation scores are derived from saved activity participants. Regular activities count as 1 and flash meetings count as 0.5.",
  "stats.stats.tracked.title": "Tracked members",
  "stats.stats.tracked.description":
    "Members included in participation stats",
  "stats.stats.visible.title": "Visible rows",
  "stats.stats.visible.description": "Filtered and sorted result",
  "stats.stats.archived.title": "Archived members",
  "stats.stats.archived.description": "Historical roster retained",
  "stats.stats.selectedMonth.title": "Selected month",
  "stats.stats.selectedMonth.description":
    "Currently scoped month for participation stats",
  "stats.stats.monthParticipants.title": "Participants this month",
  "stats.stats.monthParticipants.description":
    "Members with a score above 0 in the selected month",
  "stats.stats.monthTotal.title": "Total participation score",
  "stats.stats.monthTotal.description":
    "Weighted total across all members in the selected month",
  "stats.filters.periodTitle": "Period",
  "stats.filters.periodDescriptionAll":
    "Switch to a month to inspect participation for that period.",
  "stats.filters.periodDescriptionMonth":
    "Showing weighted participation for {{month}}.",
  "stats.filters.allTime": "All time",
  "stats.filters.month": "Month",
  "stats.filters.searchPlaceholder": "Search stats",
  "stats.filters.sortByCount": "Sort by score",
  "stats.filters.sortByName": "Sort by name",
  "stats.filters.ascending": "Ascending",
  "stats.filters.descending": "Descending",
  "stats.table.name": "Name",
  "stats.table.gender": "Gender",
  "stats.table.role": "Role",
  "stats.table.participations": "Participation score",
  "stats.table.participationsAllTime": "Participation score (all time)",
  "stats.table.participationsMonth": "Participation score ({{month}})",
  "stats.table.empty": "No members match the current filters.",
  "history.badge": "Stats",
  "history.title": "{{name}} activity history",
  "history.description":
    "Review the saved activities that include {{name}}.",
  "history.descriptionMonth":
    "Review the saved activities that include {{name}} in {{month}}.",
  "history.filters.periodDescriptionAll":
    "Switch to a month to inspect this member's history for that period.",
  "history.filters.periodDescriptionMonth":
    "Showing only this member's activity history for {{month}}.",
  "history.filters.noMonths": "No monthly activity yet",
  "history.stats.score.title": "Participation score",
  "history.stats.score.description":
    "Weighted total across saved activities",
  "history.stats.score.descriptionMonth":
    "Weighted total across saved activities in {{month}}",
  "history.stats.role.title": "Role",
  "history.stats.role.description": "Current roster role",
  "history.stats.status.title": "Status",
  "history.stats.status.description": "Roster record state",
  "history.section.title": "Participated activities",
  "history.section.description":
    "Open any saved activity to review or edit its details.",
  "history.section.descriptionMonth":
    "Showing only saved activities from {{month}}.",
  "history.section.back": "Back to stats",
  "history.empty": "No saved activities include this member yet.",
  "history.emptyMonth":
    "No saved activities include this member in {{month}}.",
  "history.badge.group": "Group {{number}}",
  "history.openActivity": "Open activity",
  "common.activityType.regular": "Regular",
  "common.activityType.flash": "Flash",
  "common.gender.female": "Female",
  "common.gender.male": "Male",
  "common.role.manager": "Manager",
  "common.role.member": "Member",
  "common.status.active": "Active",
  "common.status.archived": "Archived",
  "errors.generic": "Something went wrong.",
  "errors.auth.invalidCredentials": "Invalid username or password.",
  "errors.member.notFound": "Member not found.",
  "errors.activity.notFound": "Activity not found.",
  "errors.validation.member.nameRequired": "Name is required.",
  "errors.validation.member.genderRequired": "Gender is required.",
  "errors.validation.member.isManagerRequired": "isManager is required.",
  "errors.validation.member.updateRequired":
    "At least one member field must be updated.",
  "errors.validation.admin.usernameRequired": "Username is required.",
  "errors.validation.admin.passwordMin":
    "Password must be at least 8 characters.",
  "errors.validation.activity.dateFormat":
    "activityDate must use YYYY-MM-DD.",
  "errors.validation.activity.typeRequired": "activityType is required.",
  "errors.validation.activity.saturdayRequired":
    "activityDate must be a Saturday in KST.",
  "errors.validation.activity.areaRequired": "Area is required.",
  "errors.validation.activity.updateRequired":
    "At least one activity field must be updated.",
  "errors.validation.activity.participantsUnique":
    "participantMemberIds must be unique.",
  "errors.validation.activity.groupMemberRequired":
    "Each group must contain at least one member.",
  "errors.validation.activity.groupMembersUnique":
    "Group members must be unique.",
  "errors.validation.activity.groupNumberRequired":
    "groupNumber is required.",
  "errors.validation.activity.groupNumberInteger":
    "groupNumber must be an integer.",
  "errors.validation.activity.groupNumberUnique":
    "groupNumber must be unique.",
  "errors.validation.activity.targetGroupRequired":
    "targetGroupCount is required.",
  "errors.validation.activity.targetGroupInteger":
    "targetGroupCount must be an integer.",
  "errors.validation.activity.groupedMembersSelectedOnly":
    "Grouped members must also be selected participants.",
  "errors.validation.activity.memberInMultipleGroups":
    "A member cannot appear in multiple groups.",
  "errors.validation.activity.groupsMustCoverParticipants":
    "Saved groups must include every selected participant exactly once.",
  "errors.validation.activity.groupGeneratedAtRequired":
    "groupGeneratedAt is required when groups are saved.",
  "errors.validation.activity.groupGeneratedAtEmptyOnly":
    "groupGeneratedAt cannot be set when groups are empty.",
  "errors.validation.activity.regularGroupsRequired":
    "Regular activities must save at least one group.",
  "errors.validation.activity.flashGroupConfigEmpty":
    "Flash meetings cannot save group settings.",
  "errors.validation.activity.flashGroupsEmpty":
    "Flash meetings cannot save groups.",
  "errors.validation.activity.flashGroupGeneratedAtEmpty":
    "Flash meetings cannot save groupGeneratedAt.",
  "errors.validation.activity.activityTypeLocked":
    "activityType cannot be changed after creation.",
  "errors.validation.activity.memberReference":
    "Every participantMemberId must reference an existing member.",
  "errors.grouping.failedManagers": "Failed to allocate managers into groups.",
  "errors.grouping.failedMembers":
    "Failed to allocate groups for the selected members.",
  "errors.grouping.invalidTarget":
    "targetGroupCount must be an integer greater than or equal to 1.",
  "errors.grouping.targetTooLarge":
    "targetGroupCount cannot be greater than the selected participants.",
} as const;

type MessageDictionary = {
  [Key in keyof typeof enMessages]: string;
};

export type TranslationKey = keyof typeof enMessages;

export const koMessages: MessageDictionary = {
  "app.name": "디저트립",
  "app.metadata.description": "디저트 동아리 디저트립 운영 앱",
  "theme.label": "테마",
  "theme.toggleAria": "테마 전환",
  "theme.dark": "다크",
  "theme.pastel": "파스텔",
  "nav.overview.label": "개요",
  "nav.overview.description": "동아리 현황 확인과 주요 작업 이동",
  "nav.members.label": "멤버",
  "nav.members.description": "멤버 추가, 매니저 관리, 명단 필터링",
  "nav.activities.label": "활동",
  "nav.activities.description": "정기활동과 번개모임 조회, 새 활동 생성, 세부 정보 관리",
  "nav.stats.label": "통계",
  "nav.stats.description": "멤버별 가중 참여 점수 확인",
  "login.hero.badge": "디저트립",
  "login.hero.title": "디저트립 관리 페이지",
  "login.hero.description": "관리자 계정으로 멤버, 활동, 참여 기록 관리",
  "login.form.title": "관리자 로그인",
  "login.form.description": "관리자 계정 정보 입력",
  "login.form.username": "아이디",
  "login.form.usernamePlaceholder": "관리자 아이디",
  "login.form.password": "비밀번호",
  "login.form.passwordPlaceholder": "비밀번호",
  "login.form.submitIdle": "로그인",
  "login.form.submitPending": "로그인 중",
  "login.form.submitDone": "로그인 완료",
  "dashboard.badge": "동아리 관리자",
  "dashboard.shell.openNavigation": "내비게이션 열기",
  "dashboard.shell.dismissNavigation": "내비게이션 닫기",
  "dashboard.shell.closeNavigation": "내비게이션 닫기",
  "dashboard.shell.signOut": "로그아웃",
  "dashboard.shell.navigationTitle": "동아리 내비게이션",
  "dashboard.shell.navigationDescription":
    "공통 관리자 화면과 테마 설정을 유지한 페이지 이동",
  "dashboard.shell.signedIn": "로그인 상태",
  "dashboard.shell.activeSessionOn": "{{page}} 페이지 관리자 세션 활성화",
  "overview.badge": "개요",
  "overview.title": "디저트립 운영 대시보드",
  "overview.description": "사이드바에서 멤버, 활동, 통계 페이지 이동",
  "overview.stats.members.title": "멤버",
  "overview.stats.members.description": "운영진 {{count}}명",
  "overview.stats.activities.title": "활동",
  "overview.stats.activities.empty": "저장된 활동 없음",
  "overview.stats.activities.latest": "최근 활동: {{name}}",
  "overview.cta.open": "열기",
  "members.badge": "멤버",
  "members.title": "멤버 관리",
  "members.description":
    "멤버 추가, 수정, 보관, 복원. 보관 멤버 기록 유지, 기본 명단 숨김",
  "members.stats.all.title": "전체 멤버",
  "members.stats.all.description": "보관된 멤버 포함",
  "members.stats.active.title": "활성 멤버",
  "members.stats.active.description": "새 정기 활동 선택 가능",
  "members.stats.archived.title": "보관 멤버",
  "members.stats.archived.description": "이 페이지에서 복원 가능",
  "members.roster.title": "멤버 목록",
  "members.roster.summary": "현재 필터 기준 {{visible}} / {{total}}명 표시",
  "members.addUser": "멤버 추가",
  "members.filters.searchPlaceholder": "멤버 검색",
  "members.filters.allGenders": "전체 성별",
  "members.filters.female": "여성",
  "members.filters.male": "남성",
  "members.filters.allRoles": "전체 역할",
  "members.filters.managers": "매니저만",
  "members.filters.memberOnly": "일반 멤버만",
  "members.filters.activeOnly": "활성만",
  "members.filters.allMembers": "전체 멤버",
  "members.filters.archivedOnly": "보관만",
  "members.empty": "현재 필터와 일치하는 멤버 없음",
  "members.managerBadge": "매니저",
  "members.memberBadge": "멤버",
  "members.archivedBadge": "보관됨",
  "members.actions.edit": "수정",
  "members.actions.archive": "보관",
  "members.actions.restore": "복원",
  "members.modal.create.title": "멤버 추가",
  "members.modal.create.description": "디저트립 명단에 새 멤버 추가",
  "members.modal.edit.title": "멤버 수정",
  "members.modal.edit.description": "{{name}} 명단 정보 수정",
  "members.modal.archive.title": "멤버 보관",
  "members.modal.archive.description":
    "{{name}} 활성 명단 제외, 기존 활동 기록과 참여 통계 유지",
  "members.modal.name": "이름",
  "members.modal.namePlaceholder": "멤버 이름",
  "members.modal.gender": "성별",
  "members.modal.managerCheckbox": "동아리 매니저 권한",
  "members.modal.cancel": "취소",
  "members.modal.save": "변경 사항 저장",
  "members.modal.savePending": "저장 중",
  "members.modal.archivePending": "보관 중",
  "members.modal.closeCreate": "멤버 추가 모달 닫기",
  "members.modal.closeEdit": "멤버 수정 모달 닫기",
  "members.modal.closeArchive": "멤버 보관 모달 닫기",
  "activities.badge": "활동",
  "activities.title": "활동 관리",
  "activities.description":
    "저장된 정기활동과 번개모임 확인, 세부 정보 검토, 새 활동 생성, 기존 활동 수정",
  "activities.stats.saved.title": "저장된 활동",
  "activities.stats.saved.description": "저장된 전체 활동 기록",
  "activities.stats.visible.title": "표시 항목",
  "activities.stats.visible.description": "현재 검색 결과",
  "activities.stats.openDetail.title": "상세 보기",
  "activities.stats.openDetail.description": "현재 펼쳐진 활동 패널",
  "activities.list.title": "저장된 활동",
  "activities.list.description": "지난 활동 검색 또는 새 활동 시작",
  "activities.list.add": "활동 추가",
  "activities.searchPlaceholder": "활동명 또는 지역으로 검색",
  "activities.empty": "현재 필터와 일치하는 활동 없음",
  "activities.collapse.hint": "활동 세부 정보와 작업 보기",
  "activities.badge.participants": "참여자 {{count}}명",
  "activities.badge.groups": "{{count}}개 조",
  "activities.actions.edit": "수정",
  "activities.actions.delete": "삭제",
  "activities.actions.confirmDelete": "삭제 확인",
  "activities.actions.cancel": "취소",
  "activities.groups.empty": "저장된 조 없음",
  "activities.group.title": "{{number}}조",
  "activities.participants.title": "참여 멤버",
  "activities.badge.members": "멤버 {{count}}명",
  "activities.unknownMember": "알 수 없는 멤버",
  "activityDetail.badge": "활동 상세",
  "activityDetail.title": "{{name}}",
  "activityDetail.description":
    "{{name}}의 저장 정보, 참여 멤버, 조 편성을 확인합니다.",
  "activityDetail.stats.type.title": "활동 유형",
  "activityDetail.stats.type.description": "저장된 활동 형식",
  "activityDetail.stats.date.title": "활동 날짜",
  "activityDetail.stats.date.description": "저장된 활동 일자",
  "activityDetail.stats.area.title": "장소",
  "activityDetail.stats.area.description": "저장된 모임 위치",
  "activityDetail.stats.participants.title": "참여자",
  "activityDetail.stats.participants.description":
    "이 활동에 포함된 멤버 수",
  "activityDetail.stats.score.title": "참여 점수",
  "activityDetail.stats.score.description": "통계에 반영되는 가중치",
  "activityDetail.stats.groups.title": "조 수",
  "activityDetail.stats.groups.description": "저장된 조 편성",
  "activityDetail.actions.title": "다음 작업",
  "activityDetail.actions.description":
    "이전 화면으로 돌아가거나 수정 화면을 엽니다.",
  "activityDetail.actions.backToHistory": "멤버 활동 내역으로",
  "activityDetail.actions.backToActivities": "활동 목록으로",
  "activityDetail.actions.edit": "활동 수정",
  "activityDetail.participants.title": "참여 멤버",
  "activityDetail.participants.description":
    "이 활동에 저장된 전체 참여 멤버입니다.",
  "activityDetail.groups.title": "조 편성",
  "activityDetail.groups.description":
    "이 정기활동에 저장된 조 편성입니다.",
  "activityDetail.groups.empty": "저장된 조 편성이 없습니다.",
  "builder.badge": "활동",
  "builder.title.add": "활동 추가",
  "builder.title.edit": "활동 수정",
  "builder.description": "날짜와 장소 입력, 멤버 선택, 정기활동인 경우 조 생성과 수동 조정",
  "builder.stats.selectedMembers.title": "선택된 멤버",
  "builder.stats.selectedMembers.description": "선택된 매니저 {{count}}명",
  "builder.stats.activityType.title": "활동 유형",
  "builder.stats.activityType.description":
    "정기활동은 조가 필요하고 번개모임은 조가 필요하지 않습니다.",
  "builder.stats.targetGroups.title": "목표 조 수",
  "builder.stats.targetGroups.description": "매니저 우선 랜덤 편성",
  "builder.stats.generatedGroups.title": "생성된 조",
  "builder.stats.generatedGroups.archived": "수정용 보관 멤버 {{count}}명 포함",
  "builder.stats.generatedGroups.editing": "기존 정기 활동 수정",
  "builder.stats.generatedGroups.new": "새 정기 활동 초안",
  "builder.stats.participationWeight.title": "참여 점수",
  "builder.stats.participationWeight.description":
    "번개모임 1회는 통계에 0.5점으로 반영됩니다.",
  "builder.form.title.add": "새 활동",
  "builder.form.title.edit": "활동 수정",
  "builder.form.description": "기본 정보 입력 후 참여 멤버 선택. 정기활동만 조 생성 필요",
  "builder.form.back": "활동 목록으로",
  "builder.field.type": "활동 유형",
  "builder.field.date": "활동 날짜",
  "builder.field.dateRegular": "토요일 날짜",
  "builder.field.dateFlash": "모임 날짜",
  "builder.field.location": "장소",
  "builder.field.locationPlaceholder": "강남, 마포, 성수...",
  "builder.selected.title": "선택된 멤버",
  "builder.selected.description": "검색 가능한 모달에서 참여 멤버 선택",
  "builder.selected.open": "멤버 선택",
  "builder.selected.empty": "아직 선택된 멤버가 없습니다.",
  "builder.selected.managerSuffix": "매니저",
  "builder.grouping.field": "조 개수",
  "builder.grouping.generate": "조 생성",
  "builder.flash.notice":
    "번개모임은 조를 사용하지 않습니다. 저장하면 선택한 참여자만 기록됩니다.",
  "builder.validation.requiredFields": "활동 날짜와 장소 입력 필요",
  "builder.validation.noParticipantsSave":
    "저장 전 최소 1명의 참여 멤버 선택 필요",
  "builder.validation.targetTooLarge":
    "조 개수는 선택한 참여 멤버 수보다 많을 수 없습니다.",
  "builder.validation.generateBeforeSave": "저장 전 조 생성 필요",
  "builder.validation.noParticipantsGenerate":
    "조 생성 전 최소 1명의 참여 멤버 선택 필요",
  "builder.warning.managerShortage":
    "선택한 매니저 수보다 조 수가 많아 일부 조에 매니저가 없을 수 있음",
  "builder.adjust.title": "생성된 조 조정",
  "builder.adjust.description":
    "저장 전 멤버 드래그 이동과 같은 조 안 순서 변경",
  "builder.adjust.mobileHint":
    "모바일에서는 멤버를 길게 눌러 드래그, 화면 위아래 가장자리에서 스크롤",
  "builder.adjust.empty": "멤버 배치 시작 전 조 생성 필요",
  "builder.group.title": "{{number}}조",
  "builder.group.membersCount": "멤버 {{count}}명",
  "builder.group.dropHere": "여기로 멤버를 놓으세요",
  "builder.actions.saving": "저장 중",
  "builder.actions.update": "정기 활동 수정",
  "builder.actions.create": "저장",
  "builder.actions.reset": "초안 초기화",
  "builder.lastGenerated": "마지막 생성 {{time}}",
  "builder.memberPicker.title": "멤버 선택",
  "builder.memberPicker.description": "이번 활동 참여 멤버 검색, 선택, 명단 확정",
  "builder.memberPicker.searchPlaceholder": "멤버 검색",
  "builder.memberPicker.selected": "{{count}}명 선택됨",
  "builder.memberPicker.empty": "검색 결과와 일치하는 멤버 없음",
  "builder.memberPicker.cancel": "취소",
  "builder.memberPicker.confirm": "멤버 확정",
  "builder.memberPicker.close": "멤버 선택 모달 닫기",
  "builder.member.unknown": "알 수 없는 멤버",
  "builder.member.unknownGender": "알 수 없음",
  "stats.badge": "통계",
  "stats.title": "멤버 참여 통계",
  "stats.description":
    "저장된 활동 참여자 기준 가중 참여 점수 집계. 정기활동은 1점, 번개모임은 0.5점으로 계산",
  "stats.stats.tracked.title": "집계 대상 멤버",
  "stats.stats.tracked.description": "참여 통계에 포함된 멤버",
  "stats.stats.visible.title": "표시 중인 행",
  "stats.stats.visible.description": "필터와 정렬 결과",
  "stats.stats.archived.title": "보관된 멤버",
  "stats.stats.archived.description": "이력에 남아 있는 멤버",
  "stats.stats.selectedMonth.title": "선택한 월",
  "stats.stats.selectedMonth.description": "현재 참여 통계를 보는 기준 월",
  "stats.stats.monthParticipants.title": "이번 달 참여 멤버",
  "stats.stats.monthParticipants.description":
    "선택한 월 참여 점수가 0보다 큰 멤버 수",
  "stats.stats.monthTotal.title": "이번 달 총 참여 점수",
  "stats.stats.monthTotal.description":
    "선택한 월 전체 멤버 기준 가중 참여 점수 합계",
  "stats.filters.periodTitle": "기간",
  "stats.filters.periodDescriptionAll":
    "월을 선택하면 해당 기간의 참여 통계를 볼 수 있습니다.",
  "stats.filters.periodDescriptionMonth":
    "{{month}} 기준 가중 참여 통계를 표시 중입니다.",
  "stats.filters.allTime": "전체 기간",
  "stats.filters.month": "월",
  "stats.filters.searchPlaceholder": "통계 검색",
  "stats.filters.sortByCount": "참여 점수순",
  "stats.filters.sortByName": "이름순",
  "stats.filters.ascending": "오름차순",
  "stats.filters.descending": "내림차순",
  "stats.table.name": "이름",
  "stats.table.gender": "성별",
  "stats.table.role": "역할",
  "stats.table.participations": "참여 점수",
  "stats.table.participationsAllTime": "참여 점수 (전체 기간)",
  "stats.table.participationsMonth": "참여 점수 ({{month}})",
  "stats.table.empty": "현재 필터와 일치하는 멤버 없음",
  "history.badge": "통계",
  "history.title": "{{name}} 활동 이력",
  "history.description": "저장된 활동 중 {{name}} 참여 기록",
  "history.descriptionMonth": "{{month}}에 {{name}}가 참여한 활동 기록",
  "history.filters.periodDescriptionAll":
    "월을 선택하면 해당 기간의 이력을 볼 수 있습니다.",
  "history.filters.periodDescriptionMonth":
    "{{month}} 활동 이력만 표시 중입니다.",
  "history.filters.noMonths": "월별 활동 없음",
  "history.stats.score.title": "참여 점수",
  "history.stats.score.description": "저장된 활동 기준 가중 합계",
  "history.stats.score.descriptionMonth": "{{month}} 저장 활동 기준 가중 합계",
  "history.stats.role.title": "역할",
  "history.stats.role.description": "현재 명단 역할",
  "history.stats.status.title": "상태",
  "history.stats.status.description": "명단 기록 상태",
  "history.section.title": "참여한 활동",
  "history.section.description": "저장된 활동 열기, 세부 정보 검토 또는 수정",
  "history.section.descriptionMonth": "{{month}} 활동만 표시",
  "history.section.back": "통계로 돌아가기",
  "history.empty": "이 멤버가 포함된 저장 활동 없음",
  "history.emptyMonth": "{{month}}에 이 멤버가 포함된 저장 활동 없음",
  "history.badge.group": "{{number}}조",
  "history.openActivity": "활동 열기",
  "common.activityType.regular": "정기활동",
  "common.activityType.flash": "번개모임",
  "common.gender.female": "여성",
  "common.gender.male": "남성",
  "common.role.manager": "매니저",
  "common.role.member": "멤버",
  "common.status.active": "활성",
  "common.status.archived": "보관됨",
  "errors.generic": "문제 발생",
  "errors.auth.invalidCredentials": "아이디 또는 비밀번호 불일치",
  "errors.member.notFound": "멤버 없음",
  "errors.activity.notFound": "정기 활동 없음",
  "errors.validation.member.nameRequired": "이름 입력 필요",
  "errors.validation.member.genderRequired": "성별 선택 필요",
  "errors.validation.member.isManagerRequired": "관리자 여부 선택 필요",
  "errors.validation.member.updateRequired": "수정할 멤버 정보 필요",
  "errors.validation.admin.usernameRequired": "아이디 입력 필요",
  "errors.validation.admin.passwordMin": "비밀번호 8자 이상 필요",
  "errors.validation.activity.dateFormat": "활동 날짜 형식 오류: YYYY-MM-DD",
  "errors.validation.activity.typeRequired": "활동 유형 선택 필요",
  "errors.validation.activity.saturdayRequired":
    "활동 날짜는 KST 기준 토요일만 가능",
  "errors.validation.activity.areaRequired": "장소 입력 필요",
  "errors.validation.activity.updateRequired": "수정할 활동 정보 필요",
  "errors.validation.activity.participantsUnique": "참여 멤버 중복 불가",
  "errors.validation.activity.groupMemberRequired": "각 조 최소 1명 필요",
  "errors.validation.activity.groupMembersUnique":
    "한 조 안에서 멤버 중복 불가",
  "errors.validation.activity.groupNumberRequired": "조 번호 필요",
  "errors.validation.activity.groupNumberInteger": "조 번호는 정수만 가능",
  "errors.validation.activity.groupNumberUnique": "조 번호 중복 불가",
  "errors.validation.activity.targetGroupRequired": "목표 조 수 필요",
  "errors.validation.activity.targetGroupInteger":
    "목표 조 수는 정수만 가능",
  "errors.validation.activity.groupedMembersSelectedOnly":
    "조 편성 멤버는 선택한 참여 멤버만 가능",
  "errors.validation.activity.memberInMultipleGroups":
    "한 멤버의 복수 조 배정 불가",
  "errors.validation.activity.groupsMustCoverParticipants":
    "저장된 조는 모든 참여자를 한 번씩 포함해야 함",
  "errors.validation.activity.groupGeneratedAtRequired":
    "조 저장 시 생성 시각 필요",
  "errors.validation.activity.groupGeneratedAtEmptyOnly":
    "빈 조에는 생성 시각 설정 불가",
  "errors.validation.activity.regularGroupsRequired":
    "정기활동은 최소 1개의 조를 저장해야 합니다.",
  "errors.validation.activity.flashGroupConfigEmpty":
    "번개모임에는 조 설정을 저장할 수 없습니다.",
  "errors.validation.activity.flashGroupsEmpty":
    "번개모임에는 조를 저장할 수 없습니다.",
  "errors.validation.activity.flashGroupGeneratedAtEmpty":
    "번개모임에는 조 생성 시각을 저장할 수 없습니다.",
  "errors.validation.activity.activityTypeLocked":
    "활동 생성 후 유형 변경 불가",
  "errors.validation.activity.memberReference":
    "모든 참여 멤버는 실제 멤버여야 함",
  "errors.grouping.failedManagers": "매니저 조 배치 실패",
  "errors.grouping.failedMembers": "선택 멤버 조 편성 실패",
  "errors.grouping.invalidTarget": "목표 조 수는 1 이상의 정수만 가능",
  "errors.grouping.targetTooLarge":
    "목표 조 수는 선택한 참여 멤버 수 이하만 가능",
} satisfies MessageDictionary;

export const messagesByLocale: Record<AppLocale, MessageDictionary> = {
  ko: koMessages,
  en: enMessages,
};

export function isTranslationKey(value: string): value is TranslationKey {
  return value in enMessages;
}

function resolveLocaleFromOrderedLanguages(
  orderedLanguages: readonly string[],
): AppLocale {
  for (const locale of orderedLanguages) {
    if (locale.startsWith("ko")) {
      return "ko";
    }

    if (locale.startsWith("en")) {
      return "en";
    }
  }

  return "ko";
}

export function resolveLocaleFromAcceptLanguage(
  acceptLanguage: string | null | undefined,
): AppLocale {
  if (!acceptLanguage) {
    return "ko";
  }

  const preferredLocales = acceptLanguage
    .split(",")
    .map((part, index) => {
      const [rawLocale, ...params] = part.trim().split(";");
      const qualityParam = params.find((param) => param.trim().startsWith("q="));
      const quality = qualityParam ? Number(qualityParam.trim().slice(2)) : 1;

      return {
        locale: rawLocale?.toLowerCase() ?? "",
        quality: Number.isFinite(quality) ? quality : 0,
        index,
      };
    })
    .filter((entry) => entry.locale.length > 0)
    .sort((left, right) => {
      if (right.quality !== left.quality) {
        return right.quality - left.quality;
      }

      return left.index - right.index;
    })
    .map((entry) => entry.locale);

  return resolveLocaleFromOrderedLanguages(preferredLocales);
}

export function resolveLocaleFromBrowserLanguages(
  languages: readonly string[] | null | undefined,
  fallbackLanguage?: string | null,
): AppLocale {
  const orderedLanguages =
    languages && languages.length > 0
      ? languages.map((locale) => locale.toLowerCase())
      : fallbackLanguage
        ? [fallbackLanguage.toLowerCase()]
        : [];

  return resolveLocaleFromOrderedLanguages(orderedLanguages);
}

export function translate(
  locale: AppLocale,
  key: TranslationKey,
  values?: TranslationValues,
) {
  const template = messagesByLocale[locale][key];

  if (!values) {
    return template;
  }

  return template.replace(/\{\{(\w+)\}\}/g, (_, token: string) => {
    const value = values[token];
    return value === null || value === undefined ? "" : String(value);
  });
}

export function createTranslator(locale: AppLocale) {
  return (key: TranslationKey, values?: TranslationValues) =>
    translate(locale, key, values);
}
