var sinon 	= require('sinon');
var assert 	= require('chai').assert;
var path	= require('path');
var fs		= require('fs');
var View 	= require('../../src/view');
var Request = require('../../src/request');
var Response = require('../../src/response');
var reqGen 	= require('../fixtures/requests/req1');
var resGen 	= require('../fixtures/responses/res1');

describe('view', function() {
	before(require('../before'));
	beforeEach(require('../beforeEach'));
	beforeEach(function() {
		this.req = reqGen();
		this.res = resGen();
		Request(this.req, this.res, this.config);
		Response(this.req, this.res, this.config);
	});

	describe('when we call view.loadLayouts', function() {
		it('should load all of the layouts', function(done) {
			var self = this;
			this.res.send = sinon.spy();
			View.loadLayouts(path.join(this.config.root, 'layouts'), function(err) {
				View.render(self.req, self.res, self.config, 'index/with-layout', {name: 'Aaron'}, function() {
					assert(
						self.res.send.calledWith(
							fs.readFileSync(path.join(__dirname, '../fixtures/layouts/subdir/layout.hbs')).toString()
						),
						'Layout renders properly');
					done();
				});
			});
		});
	});

	describe('when we call view.render()', function() {
		describe('with no path or params', function() {
			describe('and the request is good', function() {
				it('should show the default view', function(done) {
					var self = this;
					this.res.send = sinon.spy();
					View.render(this.req, this.res, this.config, undefined, undefined, function() {
						assert(
							self.res.send.calledWith(
								fs.readFileSync(path.join(__dirname, '../fixtures/views/index/index.hbs')).toString()
							)
						);
						done();
					});
				});
			});
			describe('and the request is bad', function() {
				it('should show the appropriate error', function(done) {
					var self = this;
					this.res.error = sinon.spy();
					delete this.req.info;
					View.render(this.req, this.res, this.config, undefined, undefined, function() {
						assert(self.res.error.calledWith('Missing request info.'));
						done();
					});
				});
			});
		});
		describe('with a path', function() {
			describe('that doesn\'t exist', function() {
				it('should show a 404 page', function(done) {
					var self = this;
					this.res.error = sinon.spy();
					delete this.req.info;
					var viewPath = 'nonexistant/view';
					View.render(this.req, this.res, this.config, viewPath, undefined, function(err) {
						var errMessage = 'Could not find view: '+path.join(self.config.root, 'views', viewPath+'.hbs');
						assert(self.res.error.calledWith(errMessage, 404));
						done();
					});
				});
			});
			describe('that exists and has params', function() {
				it('should show the view with the params replaced', function(done) {
					var self = this;
					this.res.send = sinon.spy();
					View.render(this.req, this.res, this.config, 'index/greeting', {name: 'Aaron'}, function() {
						assert(self.res.send.calledWith('Hello Aaron'));
						done();
					});
				});
			});
		});

		describe('on the same path twice', function() {
			it('should cache the view function after the first call', function(done) {
				var self = this;
				this.res.send = sinon.spy();
				View.render(this.req, this.res, this.config, undefined, undefined, function() {
					View.render(self.req, self.res, self.config, undefined, undefined, function() {	
						var viewPath = path.join(self.config.root, 'views', 'index', 'index.hbs');
						assert(View.cache.hasOwnProperty(viewPath));
						done();
					});
				});
			});
		});
	});
});