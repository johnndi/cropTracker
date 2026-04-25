import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  login,
  logout,
  register,
  me,
  changePassword,
  loginRules,
  registerRules,
  changePasswordRules,
} from "../controllers/authController.js";

const router = Router();

// POST /api/auth/login
router.post("/login", loginRules, validate, login);

// POST /api/auth/logout
router.post("/logout", authenticate, logout);

// POST /api/auth/register  (admin only)
router.post(
  "/register",
  authenticate,
  authorize("ADMIN"),
  registerRules,
  validate,
  register
);

// GET /api/auth/me
router.get("/me", authenticate, me);

// PUT /api/auth/me/password
router.put(
  "/me/password",
  authenticate,
  changePasswordRules,
  validate,
  changePassword
);

export default router;