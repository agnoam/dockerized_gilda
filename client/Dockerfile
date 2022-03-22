FROM node:9 as builder

WORKDIR /app/client-builder
COPY . .

RUN npm i
RUN npm run build

RUN ls ./dist/

FROM bitnami/nginx:1.21.4-debian-10-r26

# Set working directory to nginx asset directory
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
COPY --from=builder /app/client-builder/dist/ .
COPY production.routing.conf /opt/bitnami/nginx/conf/server_blocks/angular-server.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]