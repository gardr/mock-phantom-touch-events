REPORTER = list
ISTANBUL = node_modules/istanbul/lib/cli.js
MOCHA = node_modules/mocha/bin/mocha
_MOCHA = node_modules/mocha/bin/_mocha
JSHINT = node_modules/.bin/jshint
COVERALLS = node_modules/coveralls/bin/coveralls.js
TESTS_GLOB = test/test.js
test:
	@$(MAKE) lint
	@NODE_ENV=test $(MOCHA) $(TESTS_GLOB) -b --reporter $(REPORTER)
lint:
	$(JSHINT) ./lib --exclude test/fixtures
test-cov:
	$(MAKE) lint
	@NODE_ENV=test $(ISTANBUL) cover $(_MOCHA) $(TESTS_GLOB) -- -R $(REPORTER)
test-coveralls:
	@NODE_ENV=test $(ISTANBUL) cover $(_MOCHA) $(TESTS_GLOB) --report lcovonly -- -R $(REPORTER) && cat ./coverage/lcov.info | $(COVERALLS)
.PHONY: all test clean
