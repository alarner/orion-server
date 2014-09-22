var sinon 	= require('sinon');
var assert 	= require('chai').assert;
var Router 	= require('../../src/router');


describe('router', function() {
	before(require('../before'));
	beforeEach(require('../beforeEach'));

	describe('when we call router.route()', function() {
		describe('with a url that doesn\'t match a custom route', function() {
			it('should default to the fallback route', function() {
				var router = new Router(this.config);
				router.loadRoutes(this.config.router.routes);

				var routeInfo = router.route('get', '/what/myaction');
				assert.equal(routeInfo.controller, 'WhatController');
				assert.equal(routeInfo.action, 'myaction');

				var routeInfo = router.route('post', '/what/myaction/');
				assert.equal(routeInfo.controller, 'WhatController');
				assert.equal(routeInfo.action, 'myaction');

				var routeInfo = router.route('put', '/what/');
				assert.equal(routeInfo.controller, 'WhatController');
				assert.equal(routeInfo.action, this.config.router.options.defaultAction);

				var routeInfo = router.route('delete', '/what');
				assert.equal(routeInfo.controller, 'WhatController');
				assert.equal(routeInfo.action, this.config.router.options.defaultAction);
			});

			describe('with dashes in it', function() {
				it('should default to the fallback route and convert the dashes', function() {
					var router = new Router(this.config);
					router.loadRoutes(this.config.router.routes);

					var routeInfo = router.route('get', '/hello-earth');
					assert.equal(routeInfo.controller, 'HelloEarthController');
					assert.equal(routeInfo.action, this.config.router.options.defaultAction);

					var routeInfo = router.route('get', '/hello-earth/speak-now');
					assert.equal(routeInfo.controller, 'HelloEarthController');
					assert.equal(routeInfo.action, 'speakNow');
				});
			});
		});
		describe('with a url that matches a custom route', function() {
			it('should return that custom route', function() {
				var router = new Router(this.config);
				router.loadRoutes(this.config.router.routes);

				var routeInfo = router.route('get', '/fancy');
				assert.equal(routeInfo.controller, 'CustomController');
				assert.equal(routeInfo.action, 'fancy');

				var routeInfo = router.route('post', '/fancy');
				assert.equal(routeInfo.controller, 'CustomController');
				assert.equal(routeInfo.action, 'postFancy');

				var routeInfo = router.route('put', '/cstm/7');
				assert.equal(routeInfo.controller, 'CustomController');
				assert.equal(routeInfo.action, 'putWithId');
				assert.equal(routeInfo.params.id, '7');

				var routeInfo = router.route('delete', '/whatwat/askdjhsdf');
				assert.equal(routeInfo.controller, 'DeleteController');
				assert.equal(routeInfo.action, 'whatwat');
				assert.equal(routeInfo.params.face, 'askdjhsdf');

				var routeInfo = router.route('get', '/hello-world');
				assert.equal(routeInfo.controller, 'HelloController');
				assert.equal(routeInfo.action, 'world');

				var routeInfo = router.route('post', '/hello-world');
				assert.equal(routeInfo.controller, 'HelloController');
				assert.equal(routeInfo.action, 'world');

				var routeInfo = router.route('put', '/hello-world');
				assert.equal(routeInfo.controller, 'HelloController');
				assert.equal(routeInfo.action, 'world');

				var routeInfo = router.route('delete', '/hello-world');
				assert.equal(routeInfo.controller, 'HelloController');
				assert.equal(routeInfo.action, 'world');
			});
		});
		describe('with the root url (/)', function() {
			it('should use the defaults specified in the config', function() {
				var router = new Router(this.config);
				router.loadRoutes(this.config.router.routes);
				
				var routeInfo = router.route('get', '/');
				assert.equal(routeInfo.controller, this.config.router.options.defaultController);
				assert.equal(routeInfo.action, this.config.router.options.defaultAction);
			});
		});
	});
});