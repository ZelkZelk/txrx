psql:
	psql -Atx postgres://postgres@127.0.0.1:5432/txrx

psql-nodb:
	psql -Atx postgres://postgres@127.0.0.1:5432

mg-create:
	npx sequelize-cli migration:create --name=${M}

sd-create:
	npx sequelize-cli seed:create --name=${S}

db-create:
	npx sequelize-cli db:create

db-migrate:
	npx sequelize-cli db:migrate

db-rollback:
	npx sequelize-cli db:migrate:undo

db-seed:
	npx sequelize-cli db:seed:all

db-seed-rollback:
	npx sequelize-cli db:seed:undo:all

bootstrap:
	make db-create
	make db-migrate
	make db-seed
