import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { listAllObservations } from "../controllers/observationController.js";

const router = Router();

// GET /api/observations?page=1&limit=50  — admin activity feed
router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  listAllObservations
);

export default router;