var sinon 	= require('sinon');
var assert 	= require('chai').assert;
var path	= require('path');
var Response = require('../../src/response');

describe('response', function() {
	before(require('../before'));
	beforeEach(require('../beforeEach'));

	describe('when we run our response through Response', function() {
		it('should add the request to the response', function() {

			var req = require('../fixtures/requests/req1');
			var res = require('../fixtures/responses/res1');
			Response(req, res, this.config);
			
			assert.isDefined(res.req);
		});

		it('should add the express app to the response', function() {

			var req = require('../fixtures/requests/req1');
			var res = require('../fixtures/responses/res1');
			Response(req, res, this.config);
			
			assert.isDefined(res.app);
		});

		it('should extend the express response', function() {

			var req = require('../fixtures/requests/req1');
			var res = require('../fixtures/responses/res1');
			Response(req, res, this.config);
			
			assert.isDefined(res.send);
		});

		it('add the view method to the response', function() {

			var req = require('../fixtures/requests/req1');
			var res = require('../fixtures/responses/res1');
			Response(req, res, this.config);
			
			assert.isDefined(res.view);
		});
	});
});