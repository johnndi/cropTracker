
import { Router } from 'express';
import { getFields, updateFieldStage } from '../controllers/fieldController.js';
import { protect, authorize } from '../Middlewares/auth.js';

const router = Router();

router.use(protect);
router.get('/', getFields);
router.patch('/:id/stage', authorize('FIELD_AGENT'), updateFieldStage);

export default router;