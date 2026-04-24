// src/services/userService.js
// Agent / user management operations (admin-scoped).

const bcrypt = require("bcryptjs");
const prisma = require("../models/prismaClient");

const SALT_ROUNDS = 12;

/** Select shape returned for user listings — never exposes password. */
const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { fields: true } },
};

/**
 * List all users. Optionally filter by role.
 * @param {{ role?: "ADMIN"|"AGENT" }} filters
 */
async function listUsers({ role } = {}) {
  return prisma.user.findMany({
    where: role ? { role } : undefined,
    select: USER_SELECT,
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Get a single user by ID including their assigned fields summary.
 */
async function getUserById(id) {
  const user = await prisma.user.findUniqueOrThrow({
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
  return user;
}

/**
 * Admin creates a new agent account.
 * @param {{ email, name, password, role? }} data
 */
async function createUser({ email, name, password, role = "AGENT" }) {
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  return prisma.user.create({
    data: { email, name, password: hashed, role },
    select: USER_SELECT,
  });
}

/**
 * Admin updates a user's name, email, or role.
 * Does NOT handle password (use authService.changePassword).
 */
async function updateUser(id, { name, email, role }) {
  return prisma.user.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(role && { role }),
    },
    select: USER_SELECT,
  });
}

/**
 * Admin deletes a user.
 * Fields previously assigned to this agent will have their agentId set
 * to a system/unassigned placeholder, or you can cascade-reassign first.
 * Here we raise a 400 if the agent still has assigned fields.
 */
async function deleteUser(id) {
  // Prevent deletion of agents who still own fields
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

module.exports = { listUsers, getUserById, createUser, updateUser, deleteUser };