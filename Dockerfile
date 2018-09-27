FROM node:8
COPY ./ .
RUN mkdir data/NODENAME
RUN npm i
ENTRYPOINT ./docker_entry_point.sh