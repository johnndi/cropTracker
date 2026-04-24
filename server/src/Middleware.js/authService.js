// src/services/authService.js
// Core authentication logic: register, login, token creation.

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../models/prismaClient");

const SALT_ROUNDS = 12;

/**
 * Generate a signed JWT for a user.
 * @param {object} user - { id, email, role }
 * @returns {string} Signed JWT
 */
function generateToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

/**
 * Strip password from a user object before sending to client.
 */
function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

/**
 * Register a new user (admin only in practice — route is guarded).
 * @param {{ email, name, password, role }} data
 */
async function register({ email, name, password, role = "AGENT" }) {
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { email, name, password: hashed, role },
  });

  const token = generateToken(user);
  return { user: sanitizeUser(user), token };
}

/**
 * Authenticate a user with email + password.
 * Throws with status 401 on invalid credentials.
 */
async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const err = new Error("Invalid email or password.");
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const err = new Error("Invalid email or password.");
    err.status = 401;
    throw err;
  }

  const token = generateToken(user);
  return { user: sanitizeUser(user), token };
}

/**
 * Change a user's password.
 * Verifies the current password before updating.
 */
async function changePassword({ userId, currentPassword, newPassword }) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    const err = new Error("Current password is incorrect.");
    err.status = 400;
    throw err;
  }

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });

  return { message: "Password updated successfully." };
}

module.exports = { register, login, changePassword, generateToken, sanitizeUser };