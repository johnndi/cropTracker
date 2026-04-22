import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getFields = async (req, res) => {
  const query = req.user.role === 'ADMIN' ? {} : { where: { agentId: req.user.id } };
  const fields = await prisma.field.findMany(query);
  
  const fieldsWithStatus = fields.map(field => {
    const daysSinceUpdate = (new Date() - new Date(field.updatedAt)) / (1000 * 60 * 60 * 24);
    let status = 'Active';
    if (field.currentStage === 'HARVESTED') status = 'Completed';
    else if (daysSinceUpdate > 7) status = 'At Risk';
    
    return { ...field, status };
  });

  res.json(fieldsWithStatus);
};

export const updateFieldStage = async (req, res) => {
  const { id } = req.params;
  const { stage, notes } = req.body;

  try {
    const update = await prisma.$transaction([
      prisma.field.update({ where: { id }, data: { currentStage: stage } }),
      prisma.observation.create({
        data: { fieldId: id, stageAtTime: stage, notes, userId: req.user.id }
      })
    ]);
    res.json(update);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};