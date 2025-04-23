FROM node:20.19.1-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:20.19.1-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:20.19.1-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

FROM node:20.19.1-alpine
COPY ./package.json package-lock.json .env /app/
COPY prisma /app/prisma
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
COPY generated/prisma/libquery_engine-linux-musl-arm64-openssl-3.0.x.so.node /app/build/server
COPY generated/prisma/libquery_engine-linux-musl-openssl-3.0.x.so.node /app/build/server
WORKDIR /app
CMD ["npm", "run", "start:prod"]
