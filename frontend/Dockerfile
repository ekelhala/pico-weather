FROM node:18-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs
RUN adduser -u 1001 -S nextjs
RUN chown nextjs:nodejs .next
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["npm", "start"]