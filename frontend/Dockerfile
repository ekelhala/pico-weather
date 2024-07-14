FROM node:18-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
# Set station information here!
# ENV NEXT_PUBLIC_STATION_LOCATION=""
# ENV NEXT_PUBLIC_STATION_HARDWARE=""
# ENV NEXT_PUBLIC_STATION_CONTACT=""

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs
RUN adduser -u 1001 -S nextjs
RUN chown nextjs:nodejs .next
ENV PORT 3000
EXPOSE 3000
USER nextjs
CMD ["npm", "start"]