# Utilisez une image de base pour Node.js
FROM node:14

# Créez le répertoire de travail
WORKDIR /app

# Copiez package.json et package-lock.json pour installer les dépendances
COPY ./package*.json ./
RUN npm install

# Copiez le reste du code source
COPY ./ ./

# Construisez l'application
RUN npm run build

# Exposez le port sur lequel l'application réagit
EXPOSE 3000

# Commande pour exécuter l'application
CMD ["npm", "start"]
