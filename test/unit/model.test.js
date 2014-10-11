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
		this.model.waterline.teardown(done);
	});

	describe('when we call model.loadDatabase', function() {
		it('should call the callback', function(done) {
			this.model.loadDatabase(done);
		});

		it('should load the app models', function(done) {
			var self = this;
			this.model.loadDatabase(function(err, models) {
				assert.isNull(err);
				assert.isDefined(models.UserTest);
				done();
			});
		});

		it('should load the plugin models', function(done) {
			var self = this;
			this.model.loadDatabase(function(err, models) {
				assert.isNull(err);
				assert.isDefined(models['orion-test-plugin::Test']);
				done();
			});
		});

		it('should convert model identities to snake_case', function(done) {
			var self = this;
			this.model.loadDatabase(function(err, models) {
				assert.isNull(err);
				assert.isDefined(models.UserAuthOption);
				assert.equal(models.UserAuthOption.identity, 'user_auth_option');
				assert.isDefined(models.userAuthType);
				assert.equal(models.userAuthType.identity, 'user_auth_type');
				assert.isDefined(models['orion-test-plugin::Test']);
				assert.equal(models['orion-test-plugin::Test'].identity, 'test_test');
				done();
			});
		});

		it('should apply model overrides to plugin models', function(done) {
			var self = this;
			this.model.loadDatabase(function(err, models) {
				assert.isNull(err);
				assert.isDefined(models['orion-test-plugin::Test']);
				assert.isFunction(models['orion-test-plugin::Test'].getById);
				assert.isDefined(models['orion-test-plugin::Test'].attributes.add);
				assert.isDefined(models['orion-test-plugin::Test'].attributes.replace);
				assert.equal(models['orion-test-plugin::Test'].attributes.replace.type, 'bool');
				assert.equal(models['orion-test-plugin::Test'].attributes.name.type, 'string');
				done();
			});
		});

		it('should correctly replace association names', function(done) {
			this.model.loadDatabase(function(err, models) {
				assert.equal(models.UserTest._attributes.authOptions.collection, 'user_auth_option');
				assert.equal(models.UserAuthOption._attributes.userId.model, 'user_test');
				done();
			});
		});
	});
});