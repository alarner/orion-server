var sinon 	= require('sinon');
var assert 	= require('chai').assert;
var Request = require('../../src/request');
var reqGen = require('../fixtures/requests/req1');
var resGen = require('../fixtures/responses/res1');

describe('request', function() {
	before(require('../before'));
	beforeEach(require('../beforeEach'));

	describe('when we run our request through Request', function() {
		it('should add the response to the request', function() {

			var req = reqGen();
			var res = resGen();
			Request(req, res, this.config);
			
			assert.isDefined(req.res);
		});

		it('should add the express app to the request', function() {

			var req = reqGen();
			var res = resGen();
			Request(req, res, this.config);
			
			assert.isDefined(req.app);
		});

		it('should extend the express request', function() {

			var req = reqGen();
			var res = resGen();
			Request(req, res, this.config);
			
			assert.isDefined(req.header);
			assert.isDefined(req.get);
		});
	});
});