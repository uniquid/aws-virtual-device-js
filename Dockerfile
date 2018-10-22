FROM node:8
RUN mkdir -p data/NODENAME
COPY package.json .
RUN npm i
COPY ./ .
ENTRYPOINT ./docker_entry_point.sh