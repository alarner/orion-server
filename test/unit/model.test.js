var sinon 	= require('sinon');
var assert 	= require('chai').assert;
var path	= require('path');
var Model 	= require('../../src/model');


describe('model', function() {
	before(require('../before'));
	beforeEach(require('../beforeEach'));
	beforeEach(function() {
		this.model = new Model(this.config);
	});

	afterEach(function(done) {
		// this.model.waterline.teardown(done);
		done();
	});

	describe('when we call model.load()', function() {
		it('should run without errors', function() {
			this.model.load();
		});
		// it('should call the callback', function(done) {
		// 	this.model.loadDatabase(done);
		// });

		it('should load the app models', function() {
			this.model.load();
			assert.isDefined(this.model.models.UserTest);
			assert.isDefined(this.model.models.userAuthType);
			assert.isDefined(this.model.models.UserAuthOption);
			assert.isDefined(this.model.pluginModels['orion-test-plugin'].models.Test);
			assert.isDefined(this.model.pluginModels['orion-test-plugin'].models.TestTest);
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

		// it('should apply model overrides to plugin models', function(done) {
		// 	var self = this;
		// 	this.model.loadDatabase(function(err, models) {
		// 		assert.isNull(err);
		// 		assert.isDefined(models['orion-test-plugin::Test']);
		// 		assert.isFunction(models['orion-test-plugin::Test'].getById);
		// 		assert.isDefined(models['orion-test-plugin::Test'].attributes.add);
		// 		assert.isDefined(models['orion-test-plugin::Test'].attributes.replace);
		// 		assert.equal(models['orion-test-plugin::Test'].attributes.replace.type, 'bool');
		// 		assert.equal(models['orion-test-plugin::Test'].attributes.name.type, 'string');
		// 		done();
		// 	});
		// });

		// it('should correctly replace association names', function(done) {
		// 	this.model.loadDatabase(function(err, models) {
		// 		assert.equal(models.UserTest._attributes.authOptions.collection, 'user_auth_option');
		// 		assert.equal(models.UserAuthOption._attributes.userId.model, 'user_test');
		// 		done();
		// 	});
		// });
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