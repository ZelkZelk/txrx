.PHONY: ws dispatcher redis all clean websocket logs data rpc redis-p2p postgres telemetry tsc

ENV := $(shell echo $$ENV)

clean:
	docker compose down --rmi local -v --remove-orphans
	docker system prune -f

node_clean:
	rm -rf consumer/dist consumer/node_modules
	rm -rf dispatcher/dist dispatcher/node_modules
	rm -rf websocket/dist websocket/node_modules
	rm -rf rpc/dist rpc/node_modules
	rm -rf streamer/dist streamer/node_modules
	rm -rf p2p/dist p2p/node_modules
	rm -rf backend/dist backend/node_modules
	rm -rf frontend/dist fronted/node_modules
	rm -rf redis/dist redis/node_modules
	rm -rf telemetry/dist telemetry/node_modules

node_install:
	cd consumer && npm i && cd ..
	cd dispatcher && npm i && cd ..
	cd websocket && npm i && cd ..
	cd rpc && npm i && cd ..
	cd streamer && npm i && cd ..
	cd p2p && npm i && cd ..
	cd backend && npm i && cd ..
	cd frontend && npm i && cd ..
	cd redis && npm i && cd ..
	cd telemetry && npm i && cd ..

tsc_kill:
	ps aux | grep -w tsc | grep -v 'grep' |grep -v 'make' | awk '{print $$2}' | xargs -r kill

autoload:
	make tsc_kill
	cd telemetry && npx tsc -w &
	cd redis && npx tsc -w &
	cd consumer && npx tsc -w &
	cd streamer && npx tsc -w &
	cd p2p && npx tsc -w &
	cd dispatcher && npx tsc -w &
	cd websocket && npx tsc -w &
	cd rpc && npx tsc -w &
	cd backend && npx tsc -w &
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
	cd telemetry && npx tsc &
	cd redis && npx tsc &
	cd consumer && npx tsc &
	cd streamer && npx tsc &
	cd p2p && npx tsc &
	cd dispatcher && npx tsc &
	cd websocket && npx tsc &
	cd rpc && npx tsc &
	cd backend && npx tsc &

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

prometheus:
	docker compose stop prometheus
	docker compose rm --force prometheus
	docker compose up -d prometheus --remove-orphans

grafana:
	docker compose stop grafana
	docker compose rm --force grafana
	docker compose up -d grafana --remove-orphans

telemetry:
	make jaeger
	make otelcol
	make prometheus
	make grafana

notel:
	docker compose stop prometheus
	docker compose rm --force prometheus
	docker compose stop jaeger
	docker compose rm --force jaeger
	docker compose stop otelcol
	docker compose rm --force otelcol
	docker compose stop grafana
	docker compose rm --force grafana

