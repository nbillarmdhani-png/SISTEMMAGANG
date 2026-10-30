# Gunakan image Node.js versi LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json dan package-lock.json (jika ada)
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy seluruh source code backend
COPY . .

# Expose port (biasanya 5000)
EXPOSE 5000

# Script start dari package.json
CMD ["npm", "start"]
