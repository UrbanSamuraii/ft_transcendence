# Docker compose file location
COMPOSE		=	docker compose

# Get formatted hostname (lowercase and trimmed)
FORMATTED_HOSTNAME = $(shell hostname | tr 'A-Z' 'a-z' | cut -d'.' -f1)
# BASIC COMPOSE COMMANDS
build: dbclean # set-env
	${COMPOSE} up --build

up:
	${COMPOSE} up

down:
	${COMPOSE} down -v
	docker system prune -af

# CLEAN DATABASES
dbclean: down
	docker system prune -af

delete:
	docker system prune -af
	rm -rf frontend/node_modules
	rm -rf backend/node_modules

# set-env:
# 	@echo "Setting environment variables..."
# 	@sed -i 's/SERVER_ADRESS = .*/SERVER_ADRESS = "${FORMATTED_HOSTNAME}"/' backend/.env
# 	@sed -i 's/REACT_APP_SERVER_ADRESS = .*/REACT_APP_SERVER_ADRESS = "${FORMATTED_HOSTNAME}"/' frontend/.env
# 	@echo "Environment variables set to SERVER_ADRESS = ${FORMATTED_HOSTNAME}"

.PHONY: all build up down dbclean
