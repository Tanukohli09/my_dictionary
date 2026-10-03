FROM node:22-bookworm-slim AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:web

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production \
    DICTIONARY_ENV=production \
    HOST=0.0.0.0 \
    PORT=10000 \
    DICTIONARY_WEB_ROOT=/app/dist

WORKDIR /app
COPY --from=build /app/dist ./dist
COPY server ./server

USER node
EXPOSE 10000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "server/dictionaryProxy.js"]
