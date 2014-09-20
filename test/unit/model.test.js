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
	});
});