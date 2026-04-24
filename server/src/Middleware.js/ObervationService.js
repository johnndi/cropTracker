// src/services/observationService.js
// Observation (field update) logic.
// Only AGENTS may create observations; admins may only read them.

import prisma from "./Prismaclient";

const { assertFieldOwnership, stageToStatus } = require("./fieldService");


/**
 * List all observations for a field.
 * Accessible by admin (any field) or agent (own fields only — enforced at route level).
 */
export async function listObservations(fieldId) {
  return prisma.observation.findMany({
    where: { fieldId },
    include: {
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Agent adds an observation to one of their fields.
 * Optionally advances the field's stage.
 *
 * @param {object} params
 * @param {string} params.fieldId
 * @param {string} params.agentId  - ID of the authenticated agent
 * @param {string} [params.notes]  - Free-text observation
 * @param {string} [params.stage]  - New CropStage enum value (optional)
 * @returns {{ observation, field }}
 */
export async function addObservation({ fieldId, agentId, notes, stage }) {
  // 1. Ensure the agent owns this field
  const field = await assertFieldOwnership(fieldId, agentId);

  // 2. Determine the stage to record (use new stage if provided, else current)
  const stageAtTime = stage ?? field.currentStage;

  // 3. Run observation insert + optional stage update in a transaction
  const [observation, updatedField] = await prisma.$transaction([
    prisma.observation.create({
      data: {
        notes: notes ?? null,
        stageAtTime,
        fieldId,
        userId: agentId,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    }),
    // Always update — if stage hasn't changed Prisma is a no-op
    prisma.field.update({
      where: { id: fieldId },
      data: { currentStage: stageAtTime },
      include: {
        agent: { select: { id: true, name: true, email: true } },
        _count: { select: { observations: true } },
      },
    }),
  ]);

  return {
    observation,
    field: { ...updatedField, status: stageToStatus(updatedField.currentStage) },
  };
}

/**
 * Get a single observation by ID.
 */
export async function getObservationById(id) {
  return prisma.observation.findUniqueOrThrow({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true } },
      field: { select: { id: true, name: true } },
    },
  });
}

/**
 * Admin-level: list all recent observations across all fields.
 * Supports pagination.
 */
 export async function listAllObservations({ page = 1, limit = 50 } = {}) {
  const skip = (page - 1) * limit;
  const [total, observations] = await prisma.$transaction([
    prisma.observation.count(),
    prisma.observation.findMany({
      skip,
      take: limit,
      include: {
        createdBy: { select: { id: true, name: true } },
        field: { select: { id: true, name: true, cropType: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { total, page, limit, observations };
}

