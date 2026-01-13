import { Router } from 'express';
import { createReview, updateReview, deleteReview } from '../controllers/reviewController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, createReview);
router.put('/:id', authMiddleware, updateReview);
router.delete('/:id', authMiddleware, deleteReview);

export default router;