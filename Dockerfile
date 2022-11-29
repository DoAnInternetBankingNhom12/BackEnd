FROM node:14.20.0-alpine3.16 AS temp
WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm run build
FROM node:14.20.0-alpine3.16
WORKDIR /usr/src/app
COPY --from=temp /usr/src/app/package.json ./
COPY --from=temp /usr/src/app/dist/server .
RUN npm install
EXPOSE 3000
CMD [ "node", "app.js" ]