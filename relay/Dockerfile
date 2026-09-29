FROM node:24-alpine
WORKDIR /app
COPY relay/package.json relay/package-lock.json ./relay/
RUN cd relay && npm ci --omit=dev
COPY shared ./shared
COPY relay/protocol.mjs relay/server.mjs relay/admin.mjs ./relay/
RUN chown -R node:node /app
USER node
ENV NODE_ENV=production
ENV PORT=8787
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8787)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "relay/server.mjs"]
