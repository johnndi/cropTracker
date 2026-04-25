import { listFields } from "../services/fieldService.js";


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