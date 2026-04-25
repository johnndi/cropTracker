import jwt from "jsonwebtoken";
import prisma from "../models/prismaClient.js";
import { COOKIE_NAME } from "../services/authService.js";


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