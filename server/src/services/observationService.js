import prisma from "../models/prismaClient.js";
import { assertFieldOwnership, stageToStatus } from "./fieldService.js";

export async function listObservations(fieldId) {
  return prisma.observation.findMany({
    where: { fieldId },
    include: { createdBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function addObservation({ fieldId, agentId, notes, stage }) {
  const field = await assertFieldOwnership(fieldId, agentId);
  const stageAtTime = stage ?? field.currentStage;

  const [observation, updatedField] = await prisma.$transaction([
    prisma.observation.create({
      data: { notes: notes ?? null, stageAtTime, fieldId, userId: agentId },
      include: { createdBy: { select: { id: true, name: true } } },
    }),
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

export async function getObservationById(id) {
  return prisma.observation.findUniqueOrThrow({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true } },
      field: { select: { id: true, name: true } },
    },
  });
}

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