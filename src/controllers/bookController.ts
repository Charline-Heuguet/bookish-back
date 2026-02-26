import { Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';

export const getBooks = async (req: AuthRequest, res: Response) => {
  try {
    const { genre, search } = req.query;
    let query = supabase.from('books').select('*');

    if (genre) {
      query = query.eq('genre', genre);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur Supabase:', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    res.json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getBookById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single();

    if (bookError || !book) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }

    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        id,
        book_id,
        user_id,
        rating,
        comment,
        reading_status,
        created_at,
        users!inner(username)
      `)
      .eq('book_id', id)
      .order('created_at', { ascending: false });

    if (reviewsError) {
      console.error('Erreur lors de la récupération des avis:', reviewsError);
    }

    // Reformater les données pour aplatir le username
    const formattedReviews = reviews?.map((review: any) => ({
      id: review.id,
      book_id: review.book_id,
      user_id: review.user_id,
      rating: review.rating,
      comment: review.comment,
      reading_status: review.reading_status,
      created_at: review.created_at,
      username: review.users?.username || 'Anonyme'
    })) || [];

    res.json({
      ...book,
      reviews: formattedReviews
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du livre:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
export const createBook = async (req: AuthRequest, res: Response) => {
  try {
    const { title, author, genre, published_year, summary, cover_image_url } = req.body;

    console.log('Creating book with data:', { title, author, genre, published_year, summary, cover_image_url, added_by: req.userId });

    const { data, error } = await supabase
      .from('books')
      .insert([{
        title,
        author,
        genre,
        published_year,
        summary,
        cover_image_url,
        added_by: req.userId
      }])
      .select()
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      console.error('Erreur détails:', JSON.stringify(error, null, 2));
      return res.status(500).json({ error: 'Erreur lors de la création du livre', details: error.message });
    }

    console.log('Book created successfully:', data);
    res.status(201).json(data);
  } catch (error) {
    console.error('Erreur lors de la création du livre:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const updateBook = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, author, genre, published_year, summary, cover_image_url } = req.body;

    const { data, error } = await supabase
      .from('books')
      .update({
        title,
        author,
        genre,
        published_year,
        summary,
        cover_image_url
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }

    res.json(data);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du livre:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const deleteBook = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id);

    if (error) {
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

    const cleanFileName = req.file.originalname
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
      .replace(/[^a-zA-Z0-9.-]/g, '_'); // Remplacer caractères spéciaux par _

    const fileName = `${Date.now()}-${cleanFileName}`;
    
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