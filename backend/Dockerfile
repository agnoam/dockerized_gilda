FROM bitnami/node:16.15.1

WORKDIR /app/server

# Cache packages layer
COPY package*.json .
COPY yarn.lock .
RUN yarn

COPY . .
RUN yarn build
RUN yarn --production

RUN rm -rf ./src

CMD ["yarn", "start"]