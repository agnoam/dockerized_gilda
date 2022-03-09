FROM node:16-alpine

WORKDIR /app/server
COPY . .

RUN yarn
RUN yarn build
RUN yarn --production

CMD ['yarn', 'start']