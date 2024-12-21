FROM artifacts.cha.rbxd.ds/loadimpact/k6:latest as Base
USER root
RUN apk add --update bash npm
RUN npm install -g yarn

# Build the App
WORKDIR /app/api-performance-load-test-suite

COPY package.json package.json
COPY ./tsconfig.json ./tsconfig.json
COPY ./webpack.config.js ./webpack.config.js
COPY ./.babelrc ./.babelrc
COPY ./yarn.lock ./yarn.lock

RUN export SET NODE_OPTIONS=--openssl-legacy-provider
RUN yarn install --frozen-lockfile

COPY datasource /app/api-performance-load-test-suite/datasource
COPY src /app/api-performance-load-test-suite/src

RUN yarn webpack

# blank, so it can be set by docker compose
ENTRYPOINT []
