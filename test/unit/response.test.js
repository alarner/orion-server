var sinon 	= require('sinon');
var assert 	= require('chai').assert;
var Response = require('../../src/response');
var reqGen = require('../fixtures/requests/req1');
var resGen = require('../fixtures/responses/res1');

describe('response', function() {
	before(require('../before'));
	beforeEach(require('../beforeEach'));

	describe('when we run our response through Response', function() {
		it('should add the request to the response', function() {

			var req = reqGen();
			var res = resGen();
			Response(req, res, this.config);
			
			assert.isDefined(res.req);
		});

		it('should add the express app to the response', function() {

			var req = reqGen();
			var res = resGen();
			Response(req, res, this.config);
			
			assert.isDefined(res.app);
		});

		it('should extend the express response', function() {

			var req = reqGen();
			var res = resGen();
			Response(req, res, this.config);
			
			assert.isDefined(res.send);
		});

		it('add the view method to the response', function() {

			var req = reqGen();
			var res = resGen();
			Response(req, res, this.config);
			
			assert.isDefined(res.view);
		});

		it('add the error method to the response', function() {

			var req = reqGen();
			var res = resGen();
			Response(req, res, this.config);
			
			assert.isDefined(res.error);
		});
	});
});