// src/services/fieldService.js
// Core field management logic:
//   - CRUD (admin)
//   - Agent assignment / reassignment (admin)
//   - Stage-to-status derivation

const prisma = require("../models/prismaClient");

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Derive a human-readable status from a CropStage enum value.
 * This is the single source of truth for status calculation.
 *
 *   PLANTED  → "Active"
 *   GROWING  → "Active"
 *   READY    → "Completed"
 *   HARVESTED→ "Completed"
 */
function stageToStatus(stage) {
  const map = {
    PLANTED: "Active",
    GROWING: "Active",
    READY: "Completed",
    HARVESTED: "Completed",
  };
  return map[stage] ?? "Active";
}

/** Default include shape for field responses. */
const FIELD_INCLUDE = {
  agent: {
    select: { id: true, name: true, email: true },
  },
  _count: { select: { observations: true } },
};

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * List all fields (admin) or only the calling agent's fields.
 * @param {{ agentId?: string, stage?: CropStage }} filters
 */
async function listFields({ agentId, stage } = {}) {
  const fields = await prisma.field.findMany({
    where: {
      ...(agentId ? { agentId } : {}),
      ...(stage ? { currentStage: stage } : {}),
    },
    include: FIELD_INCLUDE,
    orderBy: { createdAt: "asc" },
  });

  return fields.map((f) => ({ ...f, status: stageToStatus(f.currentStage) }));
}

/**
 * Get a single field by ID.
 * Includes the full observations history.
 */
async function getFieldById(id) {
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

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Admin creates a new field.
 * @param {{ name, cropType, plantingDate, agentId, currentStage? }} data
 */
async function createField({ name, cropType, plantingDate, agentId, currentStage = "PLANTED" }) {
  // Verify agent exists and is actually an AGENT
  const agent = await prisma.user.findFirst({
    where: { id: agentId, role: "AGENT" },
  });
  if (!agent) {
    const err = new Error("Assigned user is not a valid agent.");
    err.status = 400;
    throw err;
  }

  const field = await prisma.field.create({
    data: {
      name,
      cropType,
      plantingDate: new Date(plantingDate),
      currentStage,
      agentId,
    },
    include: FIELD_INCLUDE,
  });

  return { ...field, status: stageToStatus(field.currentStage) };
}

/**
 * Admin updates field metadata (name, cropType, plantingDate, agentId).
 * Stage updates must go through observationService to maintain the audit trail.
 */
async function updateField(id, { name, cropType, plantingDate, agentId }) {
  // If reassigning, verify new agent
  if (agentId) {
    const agent = await prisma.user.findFirst({
      where: { id: agentId, role: "AGENT" },
    });
    if (!agent) {
      const err = new Error("Assigned user is not a valid agent.");
      err.status = 400;
      throw err;
    }
  }

  const field = await prisma.field.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(cropType && { cropType }),
      ...(plantingDate && { plantingDate: new Date(plantingDate) }),
      ...(agentId && { agentId }),
    },
    include: FIELD_INCLUDE,
  });

  return { ...field, status: stageToStatus(field.currentStage) };
}

/**
 * Admin deletes a field (cascades to observations via Prisma schema).
 */
async function deleteField(id) {
  await prisma.field.delete({ where: { id } });
  return { message: "Field deleted successfully." };
}

/**
 * Verify that a field belongs to the requesting agent.
 * Used by agent-scoped routes to prevent cross-agent access.
 */
async function assertFieldOwnership(fieldId, agentId) {
  const field = await prisma.field.findFirst({
    where: { id: fieldId, agentId },
  });
  if (!field) {
    const err = new Error("Field not found or not assigned to you.");
    err.status = 403;
    throw err;
  }
  return field;
}

module.exports = {
  listFields,
  getFieldById,
  createField,
  updateField,
  deleteField,
  assertFieldOwnership,
  stageToStatus,
};