var sinon 	= require('sinon');
var assert 	= require('chai').assert;
var path	= require('path');
var Controller 	= require('../src/controller');


describe('controller', function() {
	before(require('./before'));

	var config = {
		webserver: {
			workerCount: 2
		}
	};

	// describe('when we call master.start()', function() {
	// 	it('should fork some worker processes', function() {
	// 	});
	// });
});