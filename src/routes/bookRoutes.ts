import { Router } from 'express';
import multer from 'multer';
import { getBooks, getBookById, createBook, updateBook, deleteBook, uploadCover } from '../controllers/bookController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', authMiddleware, getBooks);
router.get('/:id', authMiddleware, getBookById);
router.post('/', authMiddleware, createBook);
router.put('/:id', authMiddleware, updateBook);
router.delete('/:id', authMiddleware, deleteBook);
router.post('/upload-cover', authMiddleware, upload.single('cover'), uploadCover);

export default router;