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
				assert.isDefined(self.model.waterline);
				assert.isDefined(models.user);
				done();
			});
		});

		it('should load the plugin models', function(done) {
			var self = this;
			this.model.loadDatabase(function(err, models) {
				assert.isNull(err);
				assert.isDefined(self.model.waterline);
				assert.isDefined(models.test_test);
				done();
			});
		});

		it('should apply model overrides to plugin models', function(done) {
			var self = this;
			this.model.loadDatabase(function(err, models) {
				assert.isNull(err);
				assert.isDefined(self.model.waterline);
				assert.isDefined(models.test_test);
				assert.isFunction(models.test_test.getById);
				assert.isDefined(models.test_test.attributes.add);
				assert.isDefined(models.test_test.attributes.replace);
				assert.equal(models.test_test.attributes.replace.type, 'bool');
				assert.equal(models.test_test.attributes.name.type, 'string');
				done();
			});
		});
	});
});