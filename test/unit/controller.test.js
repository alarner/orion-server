var sinon 	= require('sinon');
var assert 	= require('chai').assert;
var path	= require('path');
var Controller 	= require('../../src/controller');


describe('controller', function() {
	before(require('../before'));
	beforeEach(require('../beforeEach'));
	beforeEach(function() {
		this.controller = new Controller(this.config);
		this.controller.loadPolicies(this.config);
		this.controller.loadControllers(this.config);
	});

	describe('when we call controller.loadPolicies', function() {
		it('should load all of the app policies', function() {
			assert.isDefined(this.controller.cachedPolicies.greeting);
			assert.isDefined(this.controller.cachedPolicies.auth);
			assert.isUndefined(this.controller.cachedPolicies.test);
		});

		it('should load all of the plugin policies', function() {
			assert.isDefined(this.controller.cachedPolicies['orion-test-plugin::auth']);
		});

		it('should load all of the subplugin policies', function() {
			assert.isDefined(this.controller.cachedPolicies['orion-test-plugin::orion-test-subplugin::auth']);
		});
	});

	describe('when we call controller.loadControllers', function() {
		it('should load all of the app controllers', function() {
			assert.isDefined(this.controller.cachedControllers.IndexController);
			assert.isDefined(this.controller.cachedControllers.HelloController);
			assert.isUndefined(this.controller.cachedControllers.NoController);
			assert.isUndefined(this.controller.cachedControllers.auth);
		});

		it('should load all of the policies for each controller', function() {
			assert.deepEqual(
				this.controller.policySettings.IndexController.index,
				['greeting', 'index', 'auth']
			);

			assert.deepEqual(
				this.controller.policySettings.IndexController.test,
				['greeting', 'auth', 'index', 'unspecifiedIndex']
			);

			assert.deepEqual(
				this.controller.policySettings.HelloController.index,
				['greeting', 'auth']
			);

			assert.deepEqual(
				this.controller.policySettings.IndexController.pluginPolicy,
				['greeting', 'index', 'orion-test-plugin::auth']
			);
		});

		it('should load all of the plugin controllers', function() {
			assert.isDefined(this.controller.cachedControllers['orion-test-plugin::IndexController']);
		});

		it('should load all of the policies for each plugin controller', function() {
			assert.deepEqual(
				this.controller.policySettings['orion-test-plugin::IndexController'].face,
				['orion-test-plugin::auth']
			);
		});
	});
});