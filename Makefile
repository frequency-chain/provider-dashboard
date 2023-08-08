UNAME := $(shell uname)

all-tests: unit-tests e2e-tests

unit-tests:
	@echo "---------------------------------------------"
	@echo "Running unit tests"
	@echo "---------------------------------------------"
	npm run test:ci

e2e-tests:
	./scripts/run_e2e_tests.sh

