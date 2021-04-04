FROM node:12.13.0-alpine
RUN mkdir -p /opt/micro-rankings
WORKDIR /opt/micro-rankings
RUN adduser -S micro-rankings
COPY . .
RUN npm install
EXPOSE 3002
CMD [ "npm", "run", "start:dev" ]