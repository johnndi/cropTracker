import bcrypt from "bcrypt";
import prisma from "../models/prismaClient.js";

const SALT_ROUNDS = 12;

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { fields: true } },
};

export async function listUsers({ role } = {}) {
  return prisma.user.findMany({
    where: role ? { role } : undefined,
    select: USER_SELECT,
    orderBy: { createdAt: "asc" },
  });
}

export async function getUserById(id) {
  return prisma.user.findUniqueOrThrow({
    where: { id },
    select: {
      ...USER_SELECT,
      fields: {
        select: {
          id: true,
          name: true,
          cropType: true,
          currentStage: true,
          plantingDate: true,
        },
      },
    },
  });
}

export async function createUser({ email, name, password, role = "AGENT" }) {
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  return prisma.user.create({
    data: { email, name, password: hashed, role },
    select: USER_SELECT,
  });
}

export async function updateUser(id, { name, email, role }) {
  return prisma.user.update({
    where: { id },
    data: {
      ...(name  && { name }),
      ...(email && { email }),
      ...(role  && { role }),
    },
    select: USER_SELECT,
  });
}

export async function deleteUser(id) {
  const fieldCount = await prisma.field.count({ where: { agentId: id } });
  if (fieldCount > 0) {
    const err = new Error(
      `Cannot delete agent: they still have ${fieldCount} field(s) assigned. Reassign or remove the fields first.`
    );
    err.status = 400;
    throw err;
  }
  await prisma.user.delete({ where: { id } });
  return { message: "User deleted successfully." };
}