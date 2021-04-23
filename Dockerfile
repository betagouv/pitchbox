FROM node:lts

WORKDIR /app

RUN chown node:node /app

COPY . .

RUN npm install
RUN npm run build

USER node

EXPOSE 8100
CMD npm run start
