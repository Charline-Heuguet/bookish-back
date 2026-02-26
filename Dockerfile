FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Installer TOUTES les dépendances (dev incluses) pour pouvoir compiler
RUN npm ci

COPY . .

# Compiler TypeScript
RUN npm run build

# Supprimer les devDependencies après le build
RUN npm prune --production

EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]