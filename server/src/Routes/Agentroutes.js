import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { getMyFields } from "../controllers/agentController.js";

const router = Router();

// All routes under /api/agent are agent-only
router.use(authenticate, authorize("AGENT"));

// GET /api/agent/fields
// Returns all fields assigned to the currently logged-in agent.
// No query params needed — identity comes from the session cookie.
router.get("/fields", getMyFields);

export default router;