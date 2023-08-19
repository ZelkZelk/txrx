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

ws:
	docker-compose up -d --force-recreate --build websocket

dispatcher:
	docker stop tienda-dispatcher 			 || true
	docker rm tienda-dispatcher 			 || true
	docker image rm tienda-dispatcher:latest || true
	docker-compose up -d --force-recreate --build dispatcher

rpc:
	docker stop tienda-rpc 			  || true
	docker rm tienda-rpc 			  || true
	docker image rm tienda-rpc:latest || true
	docker-compose up -d --force-recreate --build rpc

rpc-auth:
	docker stop tienda-rpc-auth 			  || true
	docker rm tienda-rpc-auth 			      || true
	docker image rm tienda-rpc-auth:latest    || true
	docker-compose up -d --force-recreate --build rpc-auth

websocket:
	docker stop tienda-websocket 		    || true
	docker rm tienda-websocket 			    || true
	docker image rm tienda-websocket:latest || true
	docker-compose up -d --force-recreate --build websocket

redis:
	docker-compose up -d redis

redis-p2p:
	docker-compose up -d redis-p2p

redis-flush:
	docker exec tienda-redis redis-cli flushall
	docker exec tienda-redis-p2p redis-cli flushall

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
	make ws         &

logs:
	docker-compose logs --tail=0 --follow
