.PHONY: ws dispatcher redis all clean websocket logs data rpc redis-p2p postgres

clean:
	docker-compose down --rmi all -v --remove-orphans
	docker system prune -f

node_clean:
	rm -rf consumer/dist consumer/node_modules
	rm -rf dispatcher/dist dispatcher/node_modules
	rm -rf websocket/dist websocket/node_modules
	rm -rf rpc/dist rpc/node_modules
	rm -rf streamer/dist streamer/node_modules
	rm -rf p2p/dist p2p/node_modules
	rm -rf backend/dist backend/node_modules
	rm -rf frontend/dist backend/node_modules
	cd consumer && npm i && cd ..
	cd dispatcher && npm i && cd ..
	cd websocket && npm i && cd ..
	cd rpc && npm i && cd ..
	cd streamer && npm i && cd ..
	cd p2p && npm i && cd ..
	cd backend && npm i && cd ..
	cd frontend && npm i && cd ..

stop:
	docker-compose stop

dispatcher:
	docker stop txrx-dispatcher 			 || true
	docker rm txrx-dispatcher 			 || true
	docker image rm txrx-dispatcher:latest || true
	docker-compose up -d --force-recreate --build dispatcher

rpc:
	docker stop txrx-rpc 			  || true
	docker rm txrx-rpc 			  || true
	docker image rm txrx-rpc:latest || true
	docker-compose up -d --force-recreate --build rpc

rpc-auth:
	docker stop txrx-rpc-auth 			  || true
	docker rm txrx-rpc-auth 			      || true
	docker image rm txrx-rpc-auth:latest    || true
	docker-compose up -d --force-recreate --build rpc-auth

websocket:
	docker stop txrx-websocket 		    || true
	docker rm txrx-websocket 			    || true
	docker image rm txrx-websocket:latest || true
	docker-compose up -d --force-recreate --build websocket

redis:
	docker-compose up -d redis

redis-p2p:
	docker-compose up -d redis-p2p

redis-flush:
	docker exec txrx-redis redis-cli flushall
	docker exec txrx-redis-p2p redis-cli flushall

postgres:
	docker-compose up -d postgres

all:
	make redis
	make redis-p2p
	make services

rpc-all:
	make rpc      &
	make rpc-auth &

services:
	make dispatcher &
	make rpc-all    &
	make websocket  &

logs:
	docker-compose logs --tail=0 --follow
