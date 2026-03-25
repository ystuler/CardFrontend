FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS dev
COPY . .
EXPOSE 5173
CMD ["pnpm", "dev", "--host", "0.0.0.0", "--port", "5173"]

FROM deps AS build
COPY . .
RUN pnpm build

FROM deps AS prod
COPY . .
COPY --from=build /app/.svelte-kit ./.svelte-kit
EXPOSE 3000
CMD ["pnpm", "preview", "--host", "0.0.0.0", "--port", "3000"]
