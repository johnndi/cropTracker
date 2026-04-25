import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  listFields,
  getField,
  createField,
  updateField,
  deleteField,
  createFieldRules,
  updateFieldRules,
} from "../controllers/fieldController.js";
import {
  listObservations,
  addObservation,
  addObservationRules,
} from "../controllers/observationController.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET  /api/fields          — admin sees all; agent sees own
// POST /api/fields          — admin only
router
  .route("/")
  .get(listFields)
  .post(authorize("ADMIN"), createFieldRules, validate, createField);

// GET    /api/fields/:id    — admin or owning agent
// PUT    /api/fields/:id    — admin only
// DELETE /api/fields/:id    — admin only
router
  .route("/:id")
  .get(getField)
  .put(authorize("ADMIN"), updateFieldRules, validate, updateField)
  .delete(authorize("ADMIN"), deleteField);

// GET  /api/fields/:fieldId/observations   — admin or owning agent
// POST /api/fields/:fieldId/observations   — owning agent only
router
  .route("/:fieldId/observations")
  .get(listObservations)
  .post(authorize("AGENT"), addObservationRules, validate, addObservation);

export default router;