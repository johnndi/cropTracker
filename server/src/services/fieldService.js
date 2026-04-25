import prisma from "../models/prismaClient.js";

export function stageToStatus(stage) {
  const map = {
    PLANTED:   "Active",
    GROWING:   "Active",
    READY:     "Completed",
    HARVESTED: "Completed",
  };
  return map[stage] ?? "Active";
}

const FIELD_INCLUDE = {
  agent: { select: { id: true, name: true, email: true } },
  _count: { select: { observations: true } },
};

export async function listFields({ agentId, stage } = {}) {
  const fields = await prisma.field.findMany({
    where: {
      ...(agentId ? { agentId } : {}),
      ...(stage   ? { currentStage: stage } : {}),
    },
    include: FIELD_INCLUDE,
    orderBy: { createdAt: "asc" },
  });
  return fields.map((f) => ({ ...f, status: stageToStatus(f.currentStage) }));
}

export async function getFieldById(id) {
  const field = await prisma.field.findUniqueOrThrow({
    where: { id },
    include: {
      ...FIELD_INCLUDE,
      observations: {
        include: { createdBy: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return { ...field, status: stageToStatus(field.currentStage) };
}

/**
 * Look up an agent by name and return their id.
 * - Case-insensitive match.
 * - Throws 400 if no agent found with that name.
 * - Throws 409 if multiple agents share the same name (ambiguous).
 */
async function resolveAgentByName(agentName) {
  const matches = await prisma.user.findMany({
    where: {
      name: { equals: agentName, mode: "insensitive" },
      role: "AGENT",
    },
    select: { id: true, name: true },
  });

  if (matches.length === 0) {
    const err = new Error(`No agent found with the name "${agentName}".`);
    err.status = 400;
    throw err;
  }

  if (matches.length > 1) {
    const err = new Error(
      `Multiple agents found with the name "${agentName}". Use agentId to disambiguate.`
    );
    err.status = 409;
    throw err;
  }

  return matches[0].id;
}

export async function createField({ name, cropType, plantingDate, agentName, currentStage = "PLANTED" }) {
  const agentId = await resolveAgentByName(agentName);

  const field = await prisma.field.create({
    data: { name, cropType, plantingDate: new Date(plantingDate), currentStage, agentId },
    include: FIELD_INCLUDE,
  });
  return { ...field, status: stageToStatus(field.currentStage) };
}

export async function updateField(id, { name, cropType, plantingDate, agentName }) {
  const agentId = agentName ? await resolveAgentByName(agentName) : undefined;

  const field = await prisma.field.update({
    where: { id },
    data: {
      ...(name         && { name }),
      ...(cropType     && { cropType }),
      ...(plantingDate && { plantingDate: new Date(plantingDate) }),
      ...(agentId      && { agentId }),
    },
    include: FIELD_INCLUDE,
  });
  return { ...field, status: stageToStatus(field.currentStage) };
}

export async function deleteField(id) {
  await prisma.field.delete({ where: { id } });
  return { message: "Field deleted successfully." };
}

export async function assertFieldOwnership(fieldId, agentId) {
  const field = await prisma.field.findFirst({ where: { id: fieldId, agentId } });
  if (!field) {
    const err = new Error("Field not found or not assigned to you.");
    err.status = 403;
    throw err;
  }
  return field;
}