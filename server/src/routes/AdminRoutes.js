
  // routes/adminRoutes.js
import { Router } from 'express';
import { protect, authorize } from '../Middlewares/auth.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


const router = Router();

router.use(protect, authorize('ADMIN'));

router.post('/fields', async (req, res) => {
  const { name, cropType, plantingDate, agentId } = req.body;
  try {
    const newField = await prisma.field.create({
      data: {
        name,
        cropType,
        plantingDate: new Date(plantingDate),
        agentId
      }
    });
    res.status(201).json(newField);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;