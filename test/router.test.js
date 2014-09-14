var sinon 	= require('sinon');
var assert 	= require('chai').assert;
var path	= require('path');
var Router 	= require('../src/router');


describe('router', function() {
	before(require('./before'));

	var config = {
		router: {
			options: {
				caseSensitive: false,
				strict: false,
				mergeParams: false,
				defaultController: 'IndexController',
				defaultAction: 'index'
			},
			routes: {
				'get /': 'IndexController.index',
				'/hello-word': 'HelloController.world'
			}
		}
	};

	it('test', function() {
		var router = new Router(config);
	});
});