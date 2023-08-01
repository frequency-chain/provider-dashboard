UNAME := $(shell uname)

integration-test:
	./scripts/run_integration_tests.sh

integration-test-only:
	./scripts/run_integration_tests.sh -s

