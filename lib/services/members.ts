import { Types } from "mongoose";
import { MemberModel } from "../models/member";
import { serializeMember } from "./serializers";
import type { ArchiveFilter } from "../types/domain";
import {
  createMemberInputSchema,
  updateMemberInputSchema,
  type CreateMemberInput,
  type UpdateMemberInput,
} from "../validation";

function getMemberArchiveQuery(archiveFilter: ArchiveFilter) {
  if (archiveFilter === "archived") {
    return {
      archivedAt: { $ne: null },
    };
  }

  if (archiveFilter === "active") {
    return {
      archivedAt: null,
    };
  }

  return {};
}

export async function createMember(input: CreateMemberInput) {
  const validatedInput = createMemberInputSchema.parse(input);
  const member = await MemberModel.create(validatedInput);

  return serializeMember(member);
}

export async function updateMember(id: string, input: UpdateMemberInput) {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  const validatedInput = updateMemberInputSchema.parse(input);
  const member = await MemberModel.findById(id);

  if (!member) {
    return null;
  }

  if (validatedInput.name !== undefined) {
    member.name = validatedInput.name;
  }

  if (validatedInput.gender !== undefined) {
    member.gender = validatedInput.gender;
  }

  if (validatedInput.isManager !== undefined) {
    member.isManager = validatedInput.isManager;
  }

  await member.save();

  return serializeMember(member);
}

export async function archiveMember(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  const member = await MemberModel.findById(id);

  if (!member) {
    return null;
  }

  member.archivedAt = member.archivedAt ?? new Date();
  await member.save();

  return serializeMember(member);
}

export async function restoreMember(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  const member = await MemberModel.findById(id);

  if (!member) {
    return null;
  }

  member.archivedAt = null;
  await member.save();

  return serializeMember(member);
}

export async function listMembers(archiveFilter: ArchiveFilter = "active") {
  const members = await MemberModel.find(getMemberArchiveQuery(archiveFilter)).sort({
    name: 1,
    _id: 1,
  });
  return members.map(serializeMember);
}
