#!/bin/sh

# Apply Prisma migrations and start the application
npx prisma migrate deploy

# Run database migrations
npx prisma migrate dev --name init 

# Run the main container command
exec "$@"
