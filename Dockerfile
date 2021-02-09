
FROM node:12

RUN mkdir -p /usr/src/app
RUN mkdir -p /usr/src/app/tmp

WORKDIR /usr/src/app

COPY download.sh ./
RUN sh download.sh

COPY package.json ./

RUN npm install

COPY . . 

EXPOSE 3000

CMD ["npm", "run", "start"]
