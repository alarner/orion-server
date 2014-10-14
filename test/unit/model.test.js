var sinon 	= require('sinon');
var Sequelize = require('sequelize');
var path	= require('path');
var assert 	= require('chai').assert;
var Model 	= require('../../src/model');


describe('model', function() {
	before(require('../before'));
	beforeEach(require('../beforeEach'));
	beforeEach(function() {
		this.model = new Model(this.config);
	});

	describe('when we call model.load()', function() {
		it('should run without errors', function() {
			this.model.load();
		});

		it('should load the app models', function() {
			this.model.load();
			assert.isDefined(this.model.models.UserTest);
			assert.isDefined(this.model.models.userAuthType);
			assert.isDefined(this.model.models.UserAuthOption);
			assert.isDefined(this.model.pluginModels['orion-test-plugin'].models.Test);
			assert.isDefined(this.model.pluginModels['orion-test-plugin'].models.TestTest);
			assert.isFunction(this.model.models.UserTest.method1);
		});

		it('should set all of the undefined table names to snake_case', function() {
			this.model.load();
			assert.equal(this.model.models.UserTest.tableName, 'user_test');
			assert.equal(this.model.models.userAuthType.tableName, 'user_auth_type');
			assert.equal(this.model.models.UserAuthOption.tableName, 'user_auth_option');
		});

		it('should prefix plugin models correctly', function() {
			this.model.load();
			assert.equal(
				this.model.pluginModels['orion-test-plugin'].models.Test.tableName,
				'test_test'
			);
		});

		it('should apply model overrides to plugin models', function() {
			this.model.load();
			assert.isDefined(this.model.pluginModels['orion-test-plugin'].models.Test);
			assert.isFunction(this.model.pluginModels['orion-test-plugin'].models.Test.getById);
			assert.isDefined(this.model.pluginModels['orion-test-plugin'].models.Test.attributes.add);
			assert.isDefined(this.model.pluginModels['orion-test-plugin'].models.Test.attributes.replace);
			assert.equal(this.model.pluginModels['orion-test-plugin'].models.Test.attributes.replace.type, Sequelize.BOOLEAN);
			assert.equal(this.model.pluginModels['orion-test-plugin'].models.Test.attributes.name.type, Sequelize.STRING);
		});

		it('should provide access to models from each model', function() {
			this.model.load();
			assert.equal(this.model.get('UserTest').models, this.model);
			assert.equal(this.model.get('orion-test-plugin::TestTest').models, this.model.getPluginModels(['orion-test-plugin']));
		});

		it('should not set association properties on the model', function() {
			this.model.load();
			assert.isUndefined(this.model.get('UserTest').tableAttributes.authOptions);
		});
	});

	describe('when we call model.get(...)', function() {
		describe('with a direct child', function() {
			it('should return the appropriate model', function() {
				this.model.load();
				assert.equal(this.model.get('UserTest'), this.model.models['UserTest']);
				assert.equal(
					this.model.get('orion-test-plugin::Test'),
					this.model.pluginModels['orion-test-plugin'].models['Test']
				);
			});
		});
	});
});