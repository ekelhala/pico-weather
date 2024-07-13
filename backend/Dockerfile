FROM node:18
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 8000
ENV PORT=8000
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs
CMD ["npm", "start"]