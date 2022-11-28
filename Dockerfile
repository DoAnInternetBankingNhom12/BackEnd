FROM node:14.20.0-alpine3.16 AS temp
WORKDIR /usr/src/app
COPY . .
RUN ls -a
RUN npm install
RUN npm run build
RUN ls -a
FROM node:14.20.0-alpine3.16
WORKDIR /usr/src/app
RUN ls -a
COPY --from=temp /usr/src/app/dist/server .
RUN npm install
RUN ls -a
EXPOSE 3000
CMD [ "node", "app.js" ]