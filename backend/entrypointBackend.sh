#!/bin/sh

# Install project dependencies
npm i -g @nestjs/cli
npm install

# Run Prisma migration
npx prisma migrate dev

# Run the main container command
exec "$@"
