# Utilisez une image de base pour Node.js
FROM node:14

# Créez le répertoire de travail
WORKDIR /app

# Copiez package.json et package-lock.json pour installer les dépendances
COPY ./package*.json ./
RUN npm install

# Copiez le reste du code source
COPY ./ ./

# Exposez le port sur lequel le serveur écoute
EXPOSE 3001

# Commande pour exécuter le serveur
CMD ["npm", "start"]
