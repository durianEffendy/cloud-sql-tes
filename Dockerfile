FROM node:18.20.3

WORKDIR /src

COPY package*.json ./

ENV PORT 8080

RUN npm install

COPY . .

CMD [ "npm", "run", "start"]