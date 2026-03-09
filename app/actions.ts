"use server";

import { revalidatePath } from "next/cache";
import { getLocalizedErrorMessage, resolveRequestLocale } from "../lib/i18n/server";
import { clearSessionCookie, setSessionCookie } from "../lib/auth-server";
import { connectToDatabase } from "../lib/mongodb";
import {
  authenticateAdminUser,
  upsertPredefinedAdminUser,
} from "../lib/services/admin-users";
import { getMemberParticipationStats } from "../lib/services/member-stats";
import {
  archiveMember,
  createMember,
  restoreMember,
  updateMember,
} from "../lib/services/members";
import {
  createRegularActivity,
  deleteRegularActivity,
  updateRegularActivity,
} from "../lib/services/regular-activities";
import type {
  CreateMemberInput,
  CreateRegularActivityInput,
  UpdateMemberInput,
  UpdateRegularActivityInput,
} from "../lib/validation";

type MemberRecord = Awaited<ReturnType<typeof createMember>>;
type RegularActivityRecord = Awaited<ReturnType<typeof createRegularActivity>>;
type MemberStatsRecord = Awaited<ReturnType<typeof getMemberParticipationStats>>;

type ActionSuccess<T> = {
  ok: true;
  data: T;
};

type ActionFailure = {
  ok: false;
  error: string;
};

type ActionResult<T> = Promise<ActionSuccess<T> | ActionFailure>;

function revalidateDashboardTree() {
  revalidatePath("/dashboard", "layout");
}

function getErrorMessage(
  locale: Awaited<ReturnType<typeof resolveRequestLocale>>,
  error: unknown,
) {
  return getLocalizedErrorMessage(locale, error);
}

export async function loginAction(input: {
  username: string;
  password: string;
}): ActionResult<{ username: string }> {
  const locale = await resolveRequestLocale();

  try {
    await connectToDatabase();
    const adminUser = await authenticateAdminUser(input);

    if (!adminUser) {
      return {
        ok: false,
        error: getLocalizedErrorMessage(locale, new Error("errors.auth.invalidCredentials")),
      };
    }

    await setSessionCookie(adminUser.username);
    revalidatePath("/");
    revalidateDashboardTree();

    return {
      ok: true,
      data: {
        username: adminUser.username,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: getErrorMessage(locale, error),
    };
  }
}

export async function logoutAction(): ActionResult<null> {
  await clearSessionCookie();
  revalidatePath("/");
  revalidateDashboardTree();

  return {
    ok: true,
    data: null,
  };
}

export async function createMemberAction(
  input: CreateMemberInput,
): ActionResult<MemberRecord> {
  const locale = await resolveRequestLocale();

  try {
    await connectToDatabase();
    const member = await createMember(input);
    revalidateDashboardTree();

    return {
      ok: true,
      data: member,
    };
  } catch (error) {
    return {
      ok: false,
      error: getErrorMessage(locale, error),
    };
  }
}

export async function updateMemberAction(
  id: string,
  input: UpdateMemberInput,
): ActionResult<{
  member: MemberRecord;
  stats: MemberStatsRecord;
}> {
  const locale = await resolveRequestLocale();

  try {
    await connectToDatabase();
    const member = await updateMember(id, input);

    if (!member) {
      return {
        ok: false,
        error: getLocalizedErrorMessage(locale, new Error("errors.member.notFound")),
      };
    }

    const stats = await getMemberParticipationStats("all");
    revalidateDashboardTree();

    return {
      ok: true,
      data: {
        member,
        stats,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: getErrorMessage(locale, error),
    };
  }
}

export async function archiveMemberAction(
  id: string,
): ActionResult<{
  member: MemberRecord;
  stats: MemberStatsRecord;
}> {
  const locale = await resolveRequestLocale();

  try {
    await connectToDatabase();
    const member = await archiveMember(id);

    if (!member) {
      return {
        ok: false,
        error: getLocalizedErrorMessage(locale, new Error("errors.member.notFound")),
      };
    }

    const stats = await getMemberParticipationStats("all");
    revalidateDashboardTree();

    return {
      ok: true,
      data: {
        member,
        stats,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: getErrorMessage(locale, error),
    };
  }
}

export async function restoreMemberAction(
  id: string,
): ActionResult<{
  member: MemberRecord;
  stats: MemberStatsRecord;
}> {
  const locale = await resolveRequestLocale();

  try {
    await connectToDatabase();
    const member = await restoreMember(id);

    if (!member) {
      return {
        ok: false,
        error: getLocalizedErrorMessage(locale, new Error("errors.member.notFound")),
      };
    }

    const stats = await getMemberParticipationStats("all");
    revalidateDashboardTree();

    return {
      ok: true,
      data: {
        member,
        stats,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: getErrorMessage(locale, error),
    };
  }
}

export async function createRegularActivityAction(
  input: CreateRegularActivityInput,
): ActionResult<{
  activity: RegularActivityRecord;
  stats: MemberStatsRecord;
}> {
  const locale = await resolveRequestLocale();

  try {
    await connectToDatabase();
    const activity = await createRegularActivity(input);
    const stats = await getMemberParticipationStats("all");
    revalidateDashboardTree();

    return {
      ok: true,
      data: {
        activity,
        stats,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: getErrorMessage(locale, error),
    };
  }
}

export async function updateRegularActivityAction(
  id: string,
  input: UpdateRegularActivityInput,
): ActionResult<{
  activity: RegularActivityRecord;
  stats: MemberStatsRecord;
}> {
  const locale = await resolveRequestLocale();

  try {
    await connectToDatabase();
    const activity = await updateRegularActivity(id, input);

    if (!activity) {
      return {
        ok: false,
        error: getLocalizedErrorMessage(locale, new Error("errors.activity.notFound")),
      };
    }

    const stats = await getMemberParticipationStats("all");
    revalidateDashboardTree();

    return {
      ok: true,
      data: {
        activity,
        stats,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: getErrorMessage(locale, error),
    };
  }
}

export async function deleteRegularActivityAction(
  id: string,
): ActionResult<{
  id: string;
  stats: MemberStatsRecord;
}> {
  const locale = await resolveRequestLocale();

  try {
    await connectToDatabase();
    const deleted = await deleteRegularActivity(id);

    if (!deleted) {
      return {
        ok: false,
        error: getLocalizedErrorMessage(locale, new Error("errors.activity.notFound")),
      };
    }

    const stats = await getMemberParticipationStats("all");
    revalidateDashboardTree();

    return {
      ok: true,
      data: {
        id,
        stats,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: getErrorMessage(locale, error),
    };
  }
}

export async function ensureSeededAdminAction(input: {
  username: string;
  password: string;
}) {
  await connectToDatabase();
  return upsertPredefinedAdminUser(input);
}
