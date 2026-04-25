import { body, param } from "express-validator";
import * as observationService from "../services/observationService.js";
import { getFieldById } from "../services/fieldService.js";

export const addObservationRules = [
  param("fieldId").notEmpty().withMessage("Field ID is required."),
  body("notes").optional().isString(),
  body("stage")
    .optional()
    .isIn(["PLANTED", "GROWING", "READY", "HARVESTED"])
    .withMessage("Invalid crop stage."),
  body()
    .custom((_, { req }) => {
      if (!req.body.notes && !req.body.stage) {
        throw new Error("Provide at least a note or a stage update.");
      }
      return true;
    }),
];

export async function listObservations(req, res, next) {
  try {
    const { fieldId } = req.params;

    // Agents may only view observations for their own fields
    if (req.user.role === "AGENT") {
      const field = await getFieldById(fieldId);
      if (field.agentId !== req.user.id) {
        return res.status(403).json({ error: "Access denied." });
      }
    }

    const observations = await observationService.listObservations(fieldId);
    res.json({ observations });
  } catch (err) {
    next(err);
  }
}

export async function addObservation(req, res, next) {
  try {
    const result = await observationService.addObservation({
      fieldId: req.params.fieldId,
      agentId: req.user.id,
      notes:   req.body.notes,
      stage:   req.body.stage,
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}


export async function listAllObservations(req, res, next) {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 50;
    const result = await observationService.listAllObservations({ page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}