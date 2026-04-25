import jwt from "jsonwebtoken";
import prisma from "../models/prismaClient.js";
import { COOKIE_NAME } from "../services/authService.js";

/**
 * Reads the JWT from the httpOnly cookie (farmops_session).
 * Verifies it, then fetches a fresh user record from the DB
 * and attaches it to req.user.
 *
 * Cookie payload contains: sub (id), name, role.
 * We re-fetch from DB so revoked/deleted users are caught immediately.
 */
export async function authenticate(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      return res.status(401).json({ error: "Not authenticated. Please log in." });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message =
        err.name === "TokenExpiredError" ? "Session expired. Please log in again." : "Invalid session.";
      return res.status(401).json({ error: message });
    }

    // Fetch fresh record — catches deleted users or role changes since token was issued
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ error: "Account no longer exists." });
    }

    // Attach full user + the cookie-carried fields for convenience
    req.user = user;

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * RBAC guard. Usage: authorize("ADMIN") or authorize("ADMIN", "AGENT")
 */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${roles.join(" or ")}.`,
      });
    }
    next();
  };
}