# Docker compose file location
COMPOSE		=	docker compose

# BASIC COMPOSE COMMANDS
build:
	${COMPOSE} up --build

up:
	${COMPOSE} up

down:
	${COMPOSE} down

# CLEAN DATABASES
dbclean: down
	docker volume prune -f

.PHONY: all build up down dbclean