# Bibliothèque - Backend

Backend de l'application web de gestion de bibliothèque personnelle.

## Démo

- **API** : [https://bookish-back.onrender.com](https://bookish-back.onrender.com)
- **Frontend** : [https://bookish-front.vercel.app](https://bookish-front.vercel.app)

## Stack technique

- **Node.js** + **Express** + **TypeScript**
- **Supabase** (PostgreSQL + Storage)
- **JWT** pour l'authentification
- **Multer** pour l'upload de fichiers

## Installation locale

### Prérequis
- Node.js 18+
- Un compte Supabase

### 1. Cloner le repo

```bash
git clone https://github.com/Charline-Heuguet/bookish-back
cd bookish-back
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration Supabase

1. Créez un projet sur [Supabase](https://supabase.com)
2. Exécutez le fichier [schema.sql](schema.sql) dans l'éditeur SQL pour créer les tables
3. Créez un bucket de stockage nommé `book-covers` avec les permissions publiques

### 4. Variables d'environnement

Créez un fichier `.env` à la racine :

```env
SUPABASE_URL=votre_url_supabase
SUPABASE_ANON_KEY=votre_cle_supabase_anon
JWT_SECRET=votre_secret_jwt_aleatoire
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### 5. Lancer le serveur

```bash
# Mode développement
npm run dev

# Build production
npm run build

# Lancer en production
npm start
```

Le serveur démarre sur `http://localhost:3000`

## Structure du projet

```
src/
├── config/           # Configuration Supabase
├── controllers/      # Logique métier
├── middleware/       # Middlewares (auth)
├── routes/          # Définition des routes API
└── index.ts         # Point d'entrée
```

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Livres
- `GET /api/books` - Liste des livres (avec filtres optionnels)
- `POST /api/books` - Créer un livre (authentifié)
- `GET /api/books/:id` - Détails d'un livre
- `PUT /api/books/:id` - Modifier un livre (authentifié)
- `DELETE /api/books/:id` - Supprimer un livre (authentifié)

### Avis
- `GET /api/reviews?bookId=X` - Liste des avis (filtrable par livre)
- `POST /api/reviews` - Créer un avis (authentifié)
- `PUT /api/reviews/:id` - Modifier un avis (authentifié)
- `DELETE /api/reviews/:id` - Supprimer un avis (authentifié)

Les routes protégées nécessitent un token JWT dans le header :
```
Authorization: Bearer <token>
```

## Base de données

4 tables principales :

- **users** : Utilisateurs avec authentification
- **books** : Livres avec métadonnées et lien vers l'utilisateur qui l'a ajouté
- **reviews** : Avis avec notes et statut de lecture
- **favorites** : Table de liaison pour les favoris

Le schéma complet est disponible dans le fichier [schema.sql](schema.sql).

## Déploiement (Render)

Le projet est configuré pour être déployé sur Render via Docker.

### Configuration Render

1. Créer un nouveau Web Service
2. Connecter le repository GitHub
3. Configurer les variables d'environnement :
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `JWT_SECRET`
   - `FRONTEND_URL` (URL du frontend sur Vercel)
   - `PORT` (laissez vide, Render le définit automatiquement)

4. Render détectera automatiquement le `Dockerfile` et construira l'image

### CORS

Le backend autorise uniquement les requêtes CORS provenant de l'URL définie dans `FRONTEND_URL`. Pensez à mettre à jour cette variable après le déploiement du frontend.

## Tests

```bash
npm test
```

## Licence

MIT
