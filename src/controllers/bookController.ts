import { Response } from 'express';
import { pool } from '../config/database';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';

export const getBooks = async (req: AuthRequest, res: Response) => {
  try {
    const { genre, search } = req.query;
    
    let query = 'SELECT * FROM books WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (genre) {
      query += ` AND genre = $${paramIndex}`;
      params.push(genre);
      paramIndex++;
    }

    if (search) {
      query += ` AND (title ILIKE $${paramIndex} OR author ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getBookById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const bookResult = await pool.query('SELECT * FROM books WHERE id = $1', [id]);

    if (bookResult.rows.length === 0) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }

    const reviewsResult = await pool.query(
      `SELECT r.*, u.username 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.book_id = $1 
       ORDER BY r.created_at DESC`,
      [id]
    );

    res.json({
      ...bookResult.rows[0],
      reviews: reviewsResult.rows
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du livre:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const createBook = async (req: AuthRequest, res: Response) => {
  try {
    const { title, author, genre, published_year, summary, cover_image_url } = req.body;

    const result = await pool.query(
      `INSERT INTO books (title, author, genre, published_year, summary, cover_image_url) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [title, author, genre, published_year, summary, cover_image_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la création du livre:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const updateBook = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, author, genre, published_year, summary, cover_image_url } = req.body;

    const result = await pool.query(
      `UPDATE books 
       SET title = $1, author = $2, genre = $3, published_year = $4, summary = $5, cover_image_url = $6
       WHERE id = $7 
       RETURNING *`,
      [title, author, genre, published_year, summary, cover_image_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du livre:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const deleteBook = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM books WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }

    res.json({ message: 'Livre supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du livre:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const uploadCover = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const fileName = `${Date.now()}-${req.file.originalname}`;
    
    const { data, error } = await supabase.storage
      .from('book-covers')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Erreur upload Supabase:', error);
      return res.status(500).json({ error: 'Erreur lors de l\'upload' });
    }

    const { data: publicUrlData } = supabase.storage
      .from('book-covers')
      .getPublicUrl(fileName);

    res.json({ url: publicUrlData.publicUrl });
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};