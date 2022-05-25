FROM node:9 as builder

WORKDIR /app/client-builder

# For caching
COPY package*.json .
RUN npm i

COPY . .
RUN npm run build

CMD ["npm", "start"]


FROM bitnami/nginx

# Set working directory to nginx asset directory
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
COPY --from=builder /app/client-builder/dist/ .
COPY production.routing.conf /opt/bitnami/nginx/conf/server_blocks/angular-server.conf

USER root
RUN apt-get update && apt-get upgrade
RUN apt-get install gettext-base
RUN chmod -R 777 ./assets
USER 1001

EXPOSE 8080

# TAKEN from: https://nkpremices.com/dynamically-set-angular-env-variables-in-docker/
CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/assets/env.sample.js > /usr/share/nginx/html/assets/env.js && exec nginx -g 'daemon off;'"]