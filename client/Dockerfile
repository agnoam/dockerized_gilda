FROM node:16-alpine as builder

WORKDIR /app/client-builder
COPY . .

RUN yarn
RUN yarn build:production

FROM bitnami/nginx:1.21.4-debian-10-r26
COPY --from=builder /app/client-builder/dist /usr/share/nginx/html
