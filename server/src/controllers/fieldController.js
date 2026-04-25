import { body, param, query } from "express-validator";
import * as fieldService from "../services/fieldService.js";

export const createFieldRules = [
  body("name").trim().notEmpty().withMessage("Field name is required."),
  body("cropType").trim().notEmpty().withMessage("Crop type is required."),
  body("plantingDate").isISO8601().withMessage("Planting date must be a valid date (YYYY-MM-DD)."),
  body("agentName").trim().notEmpty().withMessage("Agent name is required."),
  body("currentStage")
    .optional()
    .isIn(["PLANTED", "GROWING", "READY", "HARVESTED"])
    .withMessage("Invalid crop stage."),
];

export const updateFieldRules = [
  param("id").notEmpty(),
  body("name").optional().trim().notEmpty().withMessage("Name cannot be blank."),
  body("cropType").optional().trim().notEmpty(),
  body("plantingDate").optional().isISO8601().withMessage("Invalid date format."),
  body("agentName").optional().trim().notEmpty().withMessage("Agent name cannot be blank."),
];

export async function listFields(req, res, next) {
  try {
  
    const agentId =
      req.user.role === "AGENT" ? req.user.id : req.query.agentId;
    const { stage } = req.query;
    const fields = await fieldService.listFields({ agentId, stage });
    res.json({ fields });
  } catch (err) {
    next(err);
  }
}

export async function getField(req, res, next) {
  try {
    const field = await fieldService.getFieldById(req.params.id);

    // Agents may only view their own fields
    if (req.user.role === "AGENT" && field.agentId !== req.user.id) {
      return res.status(403).json({ error: "Access denied." });
    }

    res.json({ field });
  } catch (err) {
    next(err);
  }
}

export async function createField(req, res, next) {
  try {
    const field = await fieldService.createField(req.body);
    res.status(201).json({ field });
  } catch (err) {
    next(err);
  }
}

export async function updateField(req, res, next) {
  try {
    const field = await fieldService.updateField(req.params.id, req.body);
    res.json({ field });
  } catch (err) {
    next(err);
  }
}

export async function deleteField(req, res, next) {
  try {
    const result = await fieldService.deleteField(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}