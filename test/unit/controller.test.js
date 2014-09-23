var sinon 	= require('sinon');
var assert 	= require('chai').assert;
var path	= require('path');
var Controller 	= require('../../src/controller');


describe('controller', function() {
	before(require('../before'));
	beforeEach(require('../beforeEach'));

	describe('when we call controller.loadPolicies', function() {
		it('should load all of the policies', function() {
			var controller = new Controller(this.config);
			controller.loadPolicies();

			assert.isDefined(controller.cachedPolicies.greeting);
			assert.isDefined(controller.cachedPolicies.auth);
			assert.isDefined(controller.cachedPolicies['orion-test-plugin::auth']);
			assert.isUndefined(controller.cachedPolicies.test);
		});
	});

	describe('when we call controller.loadControllers', function() {
		it('should load all of the controllers', function() {
			var controller = new Controller(this.config);
			controller.loadControllers(path.join(this.config.appRoot, 'app', 'controllers'));

			assert.isDefined(controller.cachedControllers.IndexController);
			assert.isDefined(controller.cachedControllers.HelloController);
			assert.isUndefined(controller.cachedControllers.NoController);
			assert.isUndefined(controller.cachedControllers.auth);
		});

		it('should load all of the policies for each controller', function() {
			var controller = new Controller(this.config);
			controller.loadControllers(path.join(this.config.appRoot, 'app', 'controllers'));

			assert.deepEqual(
				controller.policySettings.IndexController.index,
				['greeting', 'index', 'auth']
			);

			assert.deepEqual(
				controller.policySettings.IndexController.test,
				['greeting', 'auth', 'index', 'unspecifiedIndex']
			);

			assert.deepEqual(
				controller.policySettings.HelloController.index,
				['greeting', 'auth']
			);

			assert.deepEqual(
				controller.policySettings.IndexController.pluginPolicy,
				['greeting', 'index', 'orion-test-plugin::auth']
			);
		});
	});

	
});