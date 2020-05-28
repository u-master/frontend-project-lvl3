install:
	npm install

start:
	node bin/index.js

dry-run:
	npm publish --dry-run

relink:
	npm unlink --force
	npm link

lint:
	npx eslint .

test:
	npx jest --passWithNoTests

test-coverage:
	npx jest --coverage --ci