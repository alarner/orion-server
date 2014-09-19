var sinon 	= require('sinon');
var assert 	= require('chai').assert;
var path	= require('path');
var request = require('../../src/request');

describe('request', function() {
	before(require('../before'));
	beforeEach(require('../beforeEach'));

	describe('when we call master.start()', function() {
		it('should fork some worker processes', function() {
			this.config.appRoot = path.join(__dirname, '..', 'fixtures');

			var req = require('../fixtures/requests/r1');
			request(req, this.config);
			req.view();
		});
	});
});