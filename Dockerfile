FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --production

COPY server/ ./server/
COPY public/ ./public/

RUN mkdir -p /app/data

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/categories || exit 1

ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/app/data/wtp.db

CMD ["node", "server/index.js"]
