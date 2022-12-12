FROM node:16.18.1-alpine AS temp
WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm run build
FROM node:16.18.1-alpine
WORKDIR /usr/src/app
COPY --from=temp /usr/src/app/package.json ./
COPY --from=temp /usr/src/app/dist/server .
RUN npm install
EXPOSE 3000
EXPOSE 36236
CMD [ "node", "app.js" ]