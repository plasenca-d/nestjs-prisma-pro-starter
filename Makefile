# Makefile
.PHONY: install dev test build

install:
	pnpm ci

dev:
	docker-compose -f docker-compose.dev.yml up -d
	pnpm start:dev

test:
	pnpm test:unit

build:
	pnpm build

clean:
	docker-compose -f docker-compose.dev.yml down
	docker volume prune -f