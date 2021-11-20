FROM node:14-alpine
ENV NODE PRODUCTION
WORKDIR /app
COPY package.json .
RUN yarn
COPY /dist .

EXPOSE 3010
CMD [ "node", "bootstrapNode.js" ]