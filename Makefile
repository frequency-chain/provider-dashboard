UNAME := $(shell uname)

tests-all: tests-unit tests-e2e

tests-unit:
	@echo "---------------------------------------------"
	@echo "Running unit tests"
	@echo "---------------------------------------------"
	npm run test:ci

tests-e2e:
	./scripts/run_e2e_tests.sh

