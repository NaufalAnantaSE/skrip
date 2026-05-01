FROM node:24-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG APP_NAME
RUN npm run build ${APP_NAME}

FROM node:24-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

ARG APP_NAME
ENV APP_MAIN_FILE=dist/apps/${APP_NAME}/main.js

CMD node ${APP_MAIN_FILE}