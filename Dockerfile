FROM oven/bun:1-alpine

WORKDIR /app

ARG SNIP_REPO_URL=https://github.com/kmchanaa/snip-demo.git
ARG SNIP_BUNDLE_BRANCH=bundle

RUN apk add --no-cache git \
  && git clone --depth 1 --branch "$SNIP_BUNDLE_BRANCH" "$SNIP_REPO_URL" /tmp/snip-bundle \
  && cp -a /tmp/snip-bundle/. /app/ \
  && rm -rf /tmp/snip-bundle /app/.git

ENV PORT=3000
ENV PUBLIC_DIR=./public

EXPOSE 3000

CMD ["bun", "server.js"]