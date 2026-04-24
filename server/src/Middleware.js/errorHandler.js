// src/middleware/errorHandler.js
// Central Express error handler — must be registered last (4 params).

/**
 * Formats all unhandled errors into a consistent JSON shape.
 * Prisma-specific errors are mapped to user-friendly messages.
 */
export function errorHandler(err, req, res, next) {
  // Prisma known errors
  if (err.code) {
    switch (err.code) {
      case "P2002": {
        // Unique constraint violation
        const field = err.meta?.target?.[0] ?? "field";
        return res.status(409).json({
          error: `A record with this ${field} already exists.`,
        });
      }
      case "P2025":
        // Record not found (e.g. update/delete on non-existent row)
        return res.status(404).json({ error: "Record not found." });
      case "P2003":
        return res.status(400).json({ error: "Related record not found." });
      default:
        break;
    }
  }

  // JWT errors (shouldn't normally reach here — caught in middleware)
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Invalid token." });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Token expired." });
  }

  // Generic fallback
  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production" && status === 500
      ? "Internal server error."
      : err.message || "Internal server error.";

  if (status === 500) {
    console.error("[ERROR]", err);
  }

  res.status(status).json({ error: message });
}