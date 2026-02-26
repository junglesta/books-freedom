FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile || bun install

FROM deps AS build
COPY . .
RUN bun run build

FROM oven/bun:1-slim AS production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/server ./src/server
COPY --from=build /app/package.json ./
RUN mkdir -p data

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["bun", "src/server/index.ts"]
