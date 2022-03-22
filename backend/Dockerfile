FROM police-node

WORKDIR /app/server
COPY . .

RUN yarn
RUN yarn build
RUN yarn --production

RUN rm -rf ./src

CMD ["yarn", "start"]