import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../models/prismaClient.js";

const SALT_ROUNDS = 12;

// Cookie name used across auth middleware and controllers
export const COOKIE_NAME = "farmops_session";

// Cookie options — httpOnly prevents JS access, sameSite blocks CSRF
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // HTTPS only in prod
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

/**
 * Generate a signed JWT.
 * Payload carries: sub (user id for DB lookups), name, role.
 * name + role are included so the frontend can read them directly from the
 * cookie after decoding — no extra /me request needed.
 */
export function generateToken(user) {
  return jwt.sign(
    {
      sub:  user.id,
      name: user.name,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function sanitizeUser({ password, ...safe }) {
  return safe;
}

export async function register({ email, name, password, role = "AGENT" }) {
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { email, name, password: hashed, role },
  });
  return { user: sanitizeUser(user), token: generateToken(user) };
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    const err = new Error("Invalid email or password.");
    err.status = 401;
    throw err;
  }

  return { user: sanitizeUser(user), token: generateToken(user) };
}

export async function changePassword({ userId, currentPassword, newPassword }) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  if (!(await bcrypt.compare(currentPassword, user.password))) {
    const err = new Error("Current password is incorrect.");
    err.status = 400;
    throw err;
  }

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  return { message: "Password updated successfully." };
}