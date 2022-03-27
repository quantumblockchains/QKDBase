FROM node:14-alpine
ENV NODE PRODUCTION
WORKDIR /app
COPY package.json .
RUN yarn
COPY dist .
RUN mkdir /app/peer/blocks

EXPOSE 3016
CMD [ "node", "peer/scripts/examplePeer.js" ]
