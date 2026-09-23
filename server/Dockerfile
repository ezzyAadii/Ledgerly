FROM node:20-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY server/package*.json ./
RUN npm install --omit=dev
FROM node:20-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
RUN groupadd -r ledgerly && useradd -r -g ledgerly ledgerly && mkdir -p /app/database && chown -R ledgerly:ledgerly /app
COPY --from=deps --chown=ledgerly:ledgerly /app/node_modules ./node_modules
COPY --chown=ledgerly:ledgerly server/src ./src
USER ledgerly
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node","src/index.js"]
