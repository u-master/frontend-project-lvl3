install:
	npm install

start:
	node src/main.js

dry-run:
	npm publish --dry-run

relink:
	npm unlink --force
	npm link

build:
	npx webpack

dev:
	NODE_ENV='development' npx webpack &

lint:
	npx eslint .

test:
	npx jest --passWithNoTests

test-coverage:
	npx jest --coverage --ci