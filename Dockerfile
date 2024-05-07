FROM node:lts AS project-dependencies
WORKDIR /green-tracker-backend/
COPY ./package.json ./package-lock.json ./
RUN npm install

FROM node:lts AS built-project
WORKDIR /green-tracker-backend/
COPY ./ ./
COPY --from=project-dependencies ./green-tracker-backend/ ./
RUN npm run build

ENTRYPOINT ["npm", "run", "start:prod"]

EXPOSE 3000