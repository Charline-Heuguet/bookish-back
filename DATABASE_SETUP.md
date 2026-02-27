# Configuration de la base de données

## Créer les tables dans Supabase

1. **Accéder à Supabase** : https://supabase.com/dashboard
2. **Ouvrir le SQL Editor** : 
   - Dans votre projet, cliquez sur "SQL Editor" dans le menu de gauche
3. **Exécuter le schéma** :
   - Copiez le contenu du fichier `schema.sql`
   - Collez-le dans l'éditeur SQL
   - Cliquez sur "Run" ou appuyez sur `Cmd/Ctrl + Enter`

## Structure des tables

### `users`
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- username (VARCHAR)
- password_hash (VARCHAR)
- avatar_url (TEXT)
- created_at (TIMESTAMP)

### `books`
- id (UUID, PK)
- title (VARCHAR)
- author (VARCHAR)
- isbn (VARCHAR)
- genre (VARCHAR)
- published_year (INTEGER)
- summary (TEXT)
- cover_image_url (TEXT)
- added_by (UUID, FK → users)
- created_at (TIMESTAMP)

### `reviews`
- id (UUID, PK)
- book_id (UUID, FK → books)
- user_id (UUID, FK → users)
- rating (INTEGER, 1-5)
- comment (TEXT)
- reading_status (VARCHAR: 'read', 'reading', 'to-read')
- created_at (TIMESTAMP)
- **Contrainte** : UNIQUE(book_id, user_id) - 1 seul avis par utilisateur/livre

### `favorites`
- id (UUID, PK)
- user_id (UUID, FK → users)
- book_id (UUID, FK → books)
- created_at (TIMESTAMP)
- **Contrainte** : UNIQUE(user_id, book_id)

## Storage pour les couvertures

Dans Supabase Storage, créez un bucket nommé **`book-covers`** :

1. Allez dans "Storage" dans le menu
2. Cliquez sur "Create a new bucket"
3. Nom : `book-covers`
4. Public : **Oui** (pour que les images soient accessibles publiquement)
5. Cliquez sur "Create bucket"

## Vérification

Après avoir exécuté le schéma, vérifiez dans l'onglet "Table Editor" que les 4 tables sont créées :
- users
- books
- reviews
- favorites

Vous pouvez maintenant tester l'inscription !
