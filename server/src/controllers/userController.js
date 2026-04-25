import { body, param } from "express-validator";
import * as userService from "../services/userService.js";

export const createUserRules = [
  body("name").trim().notEmpty().withMessage("Name is required."),
  body("email").isEmail().withMessage("Valid email is required."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters."),
  body("role")
    .optional()
    .isIn(["ADMIN", "AGENT"])
    .withMessage("Role must be ADMIN or AGENT."),
];

export const updateUserRules = [
  param("id").notEmpty().withMessage("User ID is required."),
  body("name").optional().trim().notEmpty().withMessage("Name cannot be blank."),
  body("email").optional().isEmail().withMessage("Valid email is required."),
  body("role")
    .optional()
    .isIn(["ADMIN", "AGENT"])
    .withMessage("Role must be ADMIN or AGENT."),
];

export async function listUsers(req, res, next) {
  try {
    const { role } = req.query;
    const users = await userService.listUsers({ role });
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

export async function getUser(req, res, next) {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function createUser(req, res, next) {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const result = await userService.deleteUser(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}