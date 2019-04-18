## Build image
FROM node:10 as build

WORKDIR /app

COPY . /app

RUN yarn install --frozen-lockfile
RUN yarn server:build

## Final image
FROM node:10

WORKDIR /app

COPY --from=build /app/dist /app/dist
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/

ENTRYPOINT ["yarn",  "server:start"]
