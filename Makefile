.PHONY: ws dispatcher redis all clean websocket logs data rpc redis-p2p postgres telemetry tsc otelcol

ENV := $(shell echo $$ENV)

clean:
	docker compose down --rmi local -v --remove-orphans
	docker system prune -f

node_clean:
	if [ -d "consumer" ]; then rm -rf consumer/dist consumer/ ; fi
	if [ -d "dispatcher" ]; then rm -rf dispatcher/dist dispatcher/node_modules ; fi
	if [ -d "websocket" ]; then rm -rf websocket/dist websocket/node_modules ; fi
	if [ -d "rpc" ]; then rm -rf rpc/dist rpc/node_modules ; fi
	if [ -d "streamer" ]; then rm -rf streamer/dist streamer/node_modules ; fi
	if [ -d "p2p" ]; then rm -rf p2p/dist p2p/node_modules ; fi
	if [ -d "backend" ]; then rm -rf backend/dist backend/node_modules ; fi
	if [ -d "frontend" ]; then rm -rf frontend/dist fronted/node_modules ; fi
	if [ -d "redis" ]; then rm -rf redis/dist redis/node_modules ; fi
	if [ -d "telemetry" ]; then rm -rf telemetry/dist telemetry/node_modules ; fi

node_install:
	if [ -d "consumer" ]; then cd consumer && npm i && cd .. ; fi
	if [ -d "dispatcher" ]; then cd dispatcher && npm i && cd .. ; fi
	if [ -d "websocket" ]; then cd websocket && npm i && cd .. ; fi
	if [ -d "rpc" ]; then cd rpc && npm i && cd .. ; fi
	if [ -d "streamer" ]; then cd streamer && npm i && cd .. ; fi
	if [ -d "p2p" ]; then cd p2p && npm i && cd .. ; fi
	if [ -d "backend" ]; then cd backend && npm i && cd .. ; fi
	if [ -d "frontend" ]; then cd frontend && npm i && cd .. ; fi
	if [ -d "redis" ]; then cd redis && npm i && cd .. ; fi
	if [ -d "telemetry" ]; then cd telemetry && npm i && cd .. ; fi

tsc_kill:
	ps aux | grep -w tsc | grep -v 'grep' |grep -v 'make' | awk '{print $$2}' | xargs -r kill

autoload:
	make tsc_kill
	if [ -d "telemetry" ]; then cd telemetry && npx tsc -w & fi
	if [ -d "redis" ]; then cd redis && npx tsc -w & fi
	if [ -d "consumer" ]; then cd consumer && npx tsc -w & fi
	if [ -d "streamer" ]; then cd streamer && npx tsc -w & fi
	if [ -d "p2p" ]; then cd p2p && npx tsc -w & fi
	if [ -d "dispatcher" ]; then cd dispatcher && npx tsc -w & fi
	if [ -d "websocket" ]; then cd websocket && npx tsc -w & fi
	if [ -d "rpc" ]; then cd rpc && npx tsc -w & fi
	if [ -d "backend" ]; then cd backend && npx tsc -w & fi
	npm i -g nodemon
	nodemon || true
	[[ -z "$(jobs -p)" ]] || kill $(jobs -p)

reload:
	make websocket &
	make dispatcher &
	make rpc &
	make rpc-auth &

tsc:
	make tsc_kill
	if [ -d "telemetry" ]; then cd telemetry && npx tsc ; fi
	if [ -d "redis" ]; then cd redis && npx tsc ; fi
	if [ -d "consumer" ]; then cd consumer && npx tsc ; fi
	if [ -d "streamer" ]; then cd streamer && npx tsc ; fi
	if [ -d "p2p" ]; then cd p2p && npx tsc ; fi
	if [ -d "dispatcher" ]; then cd dispatcher && npx tsc ; fi
	if [ -d "websocket" ]; then cd websocket && npx tsc ; fi
	if [ -d "rpc" ]; then cd rpc && npx tsc ; fi
	if [ -d "backend" ]; then cd backend && npx tsc ; fi

stop:
	docker compose stop

start:
	docker compose start

restart:
	docker compose restart

dispatcher:
ifeq ($(ENV),production)
	@make dispatcher_prod
else
	@make dispatcher_dev
endif

dispatcher_prod:
	make dispatcher_down
	docker compose up -d --force-recreate --build dispatcher

dispatcher_dev:
	@if docker compose ps dispatcher | grep -qw "txrx-dispatcher"; then \
        docker compose restart dispatcher; \
    else \
        docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d dispatcher; \
    fi

dispatcher_down:
	docker compose stop dispatcher
	docker compose rm dispatcher
	docker rmi txrx-dispatcher	

rpc:
ifeq ($(ENV),production)
	@make rpc_prod
else
	@make rpc_dev
endif

rpc_prod:
	make rpc_down
	docker compose up -d --force-recreate --build rpc

rpc_dev:
	@if docker compose ps rpc | grep -qw "txrx-rpc"; then \
        docker compose restart rpc; \
    else \
        docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d rpc; \
    fi

rpc_down:
	docker compose stop rpc
	docker compose rm rpc
	docker rmi txrx-rpc	

rpc-auth:
ifeq ($(ENV),production)
	@make rpc-auth_prod
else
	@make rpc-auth_dev
endif

rpc-auth_prod:
	make rpc-auth_down
	docker compose up -d --force-recreate --build rpc-auth

rpc-auth_dev:
	@if docker compose ps rpc-auth | grep -qw "txrx-rpc-auth"; then \
        docker compose restart rpc-auth; \
    else \
        docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d rpc-auth; \
    fi

rpc-auth_down:
	docker compose stop rpc-auth
	docker compose rm rpc-auth
	docker rmi txrx-rpc-auth	

websocket:
ifeq ($(ENV),production)
	@make websocket_prod
else
	@make websocket_dev
endif

websocket_prod:
	make websocket_down
	docker compose up -d --force-recreate --build websocket

websocket_dev:
	@if docker compose ps websocket | grep -qw "txrx-websocket"; then \
        docker compose restart websocket; \
    else \
        docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d websocket; \
    fi

websocket_down:
	docker compose stop websocket
	docker compose rm websocket
	docker rmi txrx-websocket

redis:
	docker compose up -d redis

redis-p2p:
	docker compose up -d redis-p2p

redis-flush:
	docker exec txrx-redis redis-cli flushall
	docker exec txrx-redis-p2p redis-cli flushall

postgres:
	docker compose up -d postgres

all:
	make redis
	make redis-p2p
	make services
	make postgres

rpc-all:
	make rpc      
	make rpc-auth 

services:
	make dispatcher 
	make rpc-all    
	make websocket  

logs:
	docker compose logs --tail=0 --follow

otelcol:
	docker compose stop otelcol
	docker compose rm --force otelcol
	docker compose up -d otelcol --remove-orphans

jaeger:
	docker compose stop jaeger
	docker compose rm --force jaeger
	docker compose up -d jaeger --remove-orphans

telemetry:
	make jaeger
	make otelcol

notel:
	docker compose stop jaeger
	docker compose rm --force jaeger
	docker compose stop otelcol
	docker compose rm --force otelcol

