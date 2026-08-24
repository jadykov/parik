FROM node:20-alpine
WORKDIR /bot
COPY package.json package-lock.json* ./
RUN npm install
COPY prisma ./prisma
COPY tsconfig.json ./tsconfig.json
COPY src ./src
RUN DATABASE_URL=postgres://barber:barber@db:5432/barbershop npx prisma generate
CMD ["npm", "run", "dev"]
