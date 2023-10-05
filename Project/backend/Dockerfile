FROM node:lts

WORKDIR /app


COPY package*.json ./
COPY prisma ./prisma/
# COPY entrypoint.sh /app/entrypoint.sh
COPY . .

RUN npm i -g @nestjs/cli
RUN npm install
# RUN npx prisma generate

# RUN chmod +x /app/entrypoint.sh

EXPOSE 3001 3002 5555
# ENTRYPOINT [ "/app/entrypoint.sh" ]

ENTRYPOINT [ "npm", "run", "start:dev" ]
