import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import authRoutes        from "./Routes/AuthRoutes.js";
import userRoutes        from "./Routes/UserRoutes.js";
import fieldRoutes       from "./Routes/FieldRoutes.js";
import observationRoutes from "./Routes/ObsrevationRoutes.js";
import { errorHandler }  from "./middleware/errorHandler.js";
import agentRoutes       from "./Routes/Agentroutes.js";

const app  = express();
const PORT = process.env.PORT || 4000;


app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));


const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} not allowed.`));
    },
    credentials: true, 
  })
);


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many login attempts. Please try again later." },
});

app.use(limiter);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get("/health", (_req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() })
);


app.use("/api/auth",         authLimiter, authRoutes);
app.use("/api/users",        userRoutes);
app.use("/api/fields",       fieldRoutes);
app.use("/api/observations", observationRoutes);
app.use("/api/agent",        agentRoutes);

app.use((_req, res) => res.status(404).json({ error: "Route not found." }));


app.use(errorHandler);


app.listen(PORT, () => {
  console.log(`🌾 FarmOps API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;