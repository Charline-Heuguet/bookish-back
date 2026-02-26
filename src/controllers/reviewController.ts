import { Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const { book_id, rating, comment, reading_status } = req.body;
    const user_id = req.userId;

    // Vérifier si l'utilisateur a déjà laissé un avis pour ce livre
    const { data: existing } = await supabase
      .from('reviews')
      .select('*')
      .eq('book_id', book_id)
      .eq('user_id', user_id)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Vous avez déjà laissé un avis pour ce livre' });
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        book_id,
        user_id,
        rating,
        comment,
        reading_status
      }])
      .select(`
        *,
        users!inner(username, email)
      `)
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      return res.status(500).json({ error: 'Erreur lors de la création de l\'avis' });
    }

    // Formater la réponse avec le username
    const formattedReview = {
      ...data,
      username: (data as any).users?.username || 'Anonyme'
    };

    res.status(201).json(formattedReview);
  } catch (error) {
    console.error('Erreur lors de la création de l\'avis:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const updateReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment, reading_status } = req.body;
    const user_id = req.userId;

    const { data, error } = await supabase
      .from('reviews')
      .update({
        rating,
        comment,
        reading_status
      })
      .eq('id', id)
      .eq('user_id', user_id)
      .select(`
        *,
        users!inner(username)
      `)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Avis non trouvé ou non autorisé' });
    }

    // Formater la réponse avec le username
    const formattedReview = {
      ...data,
      username: (data as any).users?.username || 'Anonyme'
    };

    res.json(formattedReview);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'avis:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.userId;

    const { data, error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Avis non trouvé ou non autorisé' });
    }

    res.json({ message: 'Avis supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'avis:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};