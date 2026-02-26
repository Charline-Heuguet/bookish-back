# Utiliser une image Node.js légère
FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances de production uniquement
RUN npm ci --only=production

# Copier le code source
COPY . .

# Compiler TypeScript
RUN npm install -g typescript
RUN npm install --save-dev @types/node @types/express @types/cors @types/bcrypt @types/jsonwebtoken @types/multer
RUN tsc

# Exposer le port
EXPOSE 3001

# Variable d'environnement par défaut
ENV NODE_ENV=production

# Commande de démarrage
CMD ["node", "dist/index.js"]
