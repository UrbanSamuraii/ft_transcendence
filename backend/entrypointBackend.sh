#!/bin/sh

# Install project dependencies
npm i -g @nestjs/cli
npm install
npx prisma generate

while true; do
	npx prisma migrate dev --name start
	EXIT_CODE=$?
	echo "PRISMA EXIT CODE: $EXIT_CODE"
	if [ $EXIT_CODE -eq 0 ]; then
		break
	fi
done

# Run the main container command
exec "$@"
