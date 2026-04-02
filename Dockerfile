FROM node:20-alpine AS build

WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
COPY src/ src/
COPY scripts/ scripts/
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
RUN npm ci && npm run build

FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json ./
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
RUN npm ci --omit=dev
COPY --from=build /app/dist/ dist/
COPY web-dist/ web-dist/
COPY skills/ skills/

ENV PORT=3848
EXPOSE 3848

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3848/health || exit 1

CMD ["node", "dist/transport/http.js"]
