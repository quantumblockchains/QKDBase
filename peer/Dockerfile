FROM node:14-alpine
ENV NODE PRODUCTION
WORKDIR /app
COPY package.json .
RUN yarn
COPY dist .

EXPOSE 3016 3017
CMD [ "node", "peer/scripts/examplePeer.js" ]
