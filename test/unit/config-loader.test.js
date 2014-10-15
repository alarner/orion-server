var sinon 	= require('sinon');
var assert 	= require('chai').assert;
var path	= require('path');
var configLoader 	= require('../../src/config-loader');


describe('config-loader', function() {

	describe('when we call config-loader', function() {
		var root = path.join(__dirname, '../fixtures');
		var config = configLoader(root)
		it('should set the root', function() {
			assert.equal(config.root, path.join(__dirname, '../fixtures'));
		});
		it('should set the express app', function() {
			assert.isDefined(config.express);
			assert.isDefined(config.express.app);
		});
		it('should set the args', function() {
			assert.isDefined(config.argv);
		});
		it('should load the appropriate config values', function() {
			assert.equal(
				config.database.dialect,
				'sqlite'
			);
			assert(
				config.logger.Console.timestamp
			);
			assert.equal(
				config.policies.IndexController.index
				['auth']
			);
			assert.equal(
				config.router.options.defaultController,
				'IndexController'
			);
			assert.equal(
				config['static'].index,
				false
			);
			assert.equal(
				config.view.open,
				'<%'
			);
			assert.equal(
				config.webserver.port,
				8000
			);
		});
		it('should load the plugin configs', function() {
			var pluginConfig = config.plugins['orion-test-plugin'];
			assert.equal(
				pluginConfig.router.options.defaultAction,
				'index'
			);
			assert.equal(
				pluginConfig.root,
				path.join(
					__dirname,
					'../fixtures',
					'node_modules',
					'orion-test-plugin'
				)
			);

			assert.isDefined(pluginConfig.express);
			assert.isDefined(pluginConfig.express.app);
			assert.isDefined(config.argv);
		});

		it('should load the subplugin configs', function() {
			var subpluginConfig = config.plugins['orion-test-plugin'].plugins['orion-test-subplugin'];
			assert.equal(
				subpluginConfig.router.options.defaultAction,
				'myOverride'
			);
			assert.equal(
				subpluginConfig.root,
				path.join(
					__dirname,
					'../fixtures',
					'node_modules',
					'orion-test-plugin',
					'node_modules',
					'orion-test-subplugin'
				)
			);

			assert.isDefined(subpluginConfig.express);
			assert.isDefined(subpluginConfig.express.app);
			assert.isDefined(config.argv);
			assert.equal(subpluginConfig.prefix.model, 'test_sub_', 'Plugin model prefixes are not chained');
			assert.equal(subpluginConfig.prefix.route, '/test/sub', 'Plugin route prefixes are not chained');
		});

		it('should set the default plugin model prefix to an empty string', function() {
			assert.equal(config.prefix.model, '');
		});

		it('should set the global root', function() {
			assert.equal(config.globalConfig.root, config.root);
			assert.equal(config.plugins['orion-test-plugin'].globalConfig.root, config.root);
			assert.equal(config.plugins['orion-test-plugin'].plugins['orion-test-subplugin'].globalConfig.root, config.root);
		});
	});
});