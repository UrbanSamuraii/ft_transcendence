FROM node:lts

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY . .

RUN npm i -g @nestjs/cli
RUN npm install


# RUN npx prisma generate
# RUN sleep 2
# RUN npx prisma migrate dev --name toto

# RUN npm run build

EXPOSE 3001 3002 5555
ENTRYPOINT [ "npm", "run", "start:dev" ]


# FROM node:16-alpine

# WORKDIR /app

# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package*.json ./
# COPY --from=builder /app/tsconfig.json ./
# COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/prisma ./prisma

# EXPOSE 4000
# CMD [ "npm", "run", "start:dev" ]
