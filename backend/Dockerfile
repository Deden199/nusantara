FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY prisma ./prisma
COPY src ./src
COPY .env.example ./.env
RUN npx prisma generate
CMD ["npm", "start"]
