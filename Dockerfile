# 與 GEO 前台（GEO-Saas/frontend/Dockerfile）相同的三段式 standalone 建置

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 建置時就要決定：canonical 等網址、內容來源、圖片來源網域（會寫進前端程式與 next/image 設定）
ARG SITE_URL
ARG CONTENT_SOURCE=local
ARG NEXT_PUBLIC_GEO_PUBLIC_URL
ENV SITE_URL=$SITE_URL
ENV CONTENT_SOURCE=$CONTENT_SOURCE
ENV NEXT_PUBLIC_GEO_PUBLIC_URL=$NEXT_PUBLIC_GEO_PUBLIC_URL

RUN npm run build

# Stage 3: Production runner (minimal image)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system nodejs && adduser --system --ingroup nodejs nextjs

# Copy only what's needed to run
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# local 模式在執行時仍會讀 content/（例如 llms.txt 定期重新產生）
COPY --from=builder --chown=nextjs:nodejs /app/content ./content

USER nextjs

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
