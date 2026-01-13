import { Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const { book_id, rating, comment, reading_status } = req.body;
    const user_id = req.userId;

    const result = await pool.query(
      `INSERT INTO reviews (book_id, user_id, rating, comment, reading_status) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [book_id, user_id, rating, comment, reading_status]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Vous avez déjà laissé un avis pour ce livre' });
    }
    console.error('Erreur lors de la création de l\'avis:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const updateReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment, reading_status } = req.body;
    const user_id = req.userId;

    const result = await pool.query(
      `UPDATE reviews 
       SET rating = $1, comment = $2, reading_status = $3
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [rating, comment, reading_status, id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Avis non trouvé ou non autorisé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'avis:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.userId;

    const result = await pool.query(
      'DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Avis non trouvé ou non autorisé' });
    }

    res.json({ message: 'Avis supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'avis:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};