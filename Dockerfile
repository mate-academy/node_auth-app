FROM node:24-alpine
WORKDIR /app

# Копіюємо конфігурації та Prisma схему
COPY package*.json ./
COPY prisma ./prisma/

# Встановлюємо залежності та генеруємо клієнт Prisma
RUN npm ci
RUN npx prisma generate

# Копіюємо весь вихідний код
COPY . .

EXPOSE 3000

CMD ["node", "./src/index.js"]