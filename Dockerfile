FROM node:8

ENV MONGO_URI="mongodb://localhost"
RUN mkdir /posts-services
WORKDIR /posts-services

COPY package.json .

RUN npm install --production

COPY . .
EXPOSE 3000
CMD ["npm", "start"]
