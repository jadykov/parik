FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy || npx prisma db push --accept-data-loss; npm run dev"]
