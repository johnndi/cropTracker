export function errorHandler(err, req, res, next) {
  if (err.code) {
    switch (err.code) {
      case "P2002": {
        const field = err.meta?.target?.[0] ?? "field";
        return res.status(409).json({
          error: `A record with this ${field} already exists.`,
        });
      }
      case "P2025":
        return res.status(404).json({ error: "Record not found." });
      case "P2003":
        return res.status(400).json({ error: "Related record not found." });
    }
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Invalid token." });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Token expired." });
  }

  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production" && status === 500
      ? "Internal server error."
      : err.message || "Internal server error.";

  if (status === 500) console.error("[ERROR]", err);

  res.status(status).json({ error: message });
}