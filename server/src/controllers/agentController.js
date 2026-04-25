import { listFields } from "../services/fieldService.js";

/**
 * GET /api/agent/fields
 * Returns all fields assigned to the authenticated agent.
 * The agent id is read from req.user (set by the authenticate middleware)
 * so the caller does not need to provide any parameters.
 */
export async function getMyFields(req, res, next) {
  try {
    const fields = await listFields({ agentId: req.user.id });
    res.json({
      agent: { id: req.user.id, name: req.user.name },
      count: fields.length,
      fields,
    });
  } catch (err) {
    next(err);
  }
}