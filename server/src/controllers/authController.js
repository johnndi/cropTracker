import { body } from "express-validator";
import { validate } from "../middleware/validate.js";
import * as authService from "../services/authService.js";
import { COOKIE_NAME, COOKIE_OPTIONS } from "../services/authService.js";

export const loginRules = [
  body("email").isEmail().withMessage("Valid email is required."),
  body("password").notEmpty().withMessage("Password is required."),
];

export const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required."),
  body("email").isEmail().withMessage("Valid email is required."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters."),
  body("role")
    .optional()
    .isIn(["ADMIN", "AGENT"])
    .withMessage("Role must be ADMIN or AGENT."),
];

export const changePasswordRules = [
  body("currentPassword").notEmpty().withMessage("Current password is required."),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters."),
];

/**
 * POST /api/auth/login
 * Authenticates the user and sets an httpOnly cookie containing the JWT.
 * The JWT payload includes name and role so the client can decode it
 * without an extra round-trip.
 */
export async function login(req, res, next) {
  try {
    const { user, token } = await authService.login(req.body);

    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

    res.json({
      user,
      // Expose name + role explicitly so clients don't need to decode the JWT
      session: { name: user.name, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 * Clears the session cookie.
 */
export function logout(req, res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: COOKIE_OPTIONS.httpOnly,
    secure:   COOKIE_OPTIONS.secure,
    sameSite: COOKIE_OPTIONS.sameSite,
  });
  res.json({ message: "Logged out successfully." });
}

/**
 * POST /api/auth/register  (admin only)
 * Creates a new user and returns their record.
 * Does NOT set a cookie — the new user must log in separately.
 */
export async function register(req, res, next) {
  try {
    const { user } = await authService.register(req.body);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Returns the currently authenticated user from req.user (set by authenticate middleware).
 * Also returns the name + role from the cookie payload for convenience.
 */
export async function me(req, res) {
  res.json({
    user: req.user,
    session: { name: req.user.name, role: req.user.role },
  });
}

/**
 * PUT /api/auth/me/password
 */
export async function changePassword(req, res, next) {
  try {
    const result = await authService.changePassword({
      userId: req.user.id,
      ...req.body,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}