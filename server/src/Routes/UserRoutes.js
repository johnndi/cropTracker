import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  createUserRules,
  updateUserRules,
} from "../controllers/userController.js";

const router = Router();

// All user management routes are admin-only
router.use(authenticate, authorize("ADMIN"));

// GET  /api/users?role=AGENT
router.get("/", listUsers);

// GET  /api/users/:id
router.get("/:id", getUser);

// POST /api/users
router.post("/", createUserRules, validate, createUser);

// PUT  /api/users/:id
router.put("/:id", updateUserRules, validate, updateUser);

// DELETE /api/users/:id
router.delete("/:id", deleteUser);

export default router;