var _ = require('lodash');
var Controller = require('./controller');

var RouterException = function(message) {
	this.message = message;
	this.name = 'RouterException';
};

module.exports = function(config) {
	var self = this;

	this.expressRouter = require('express').Router(config.router.options);
	this.controller = new Controller();

	// Parse the routes list
	_.forOwn(config.router.routes, function(val, key) {
		var pieces = val.split('.');
		if(pieces.length != 2)
			throw new RouterException('Invalid route target: "'+val+'". It must be in the format [Controller].[action]');

		key = key.trim();
		var parsed = {
			method: 'use',
			route: key,
			controller: pieces[0],
			action: pieces[1]
		};
		var matched = key.match(/^(get|put|post|delete)\s+(.+)$/);
		if(matched) {
			parsed.method = matched[1].toLowerCase();
			parsed.route = matched[2].trim();
		}
		
		self.expressRouter[parsed.method](parsed.route, function(req, res) {
			self.controller.run(req, res, parsed);
		});
	});

	self.expressRouter.use('/:controller/(:action/:id)', function(req, res) {
		self.controller.run(req, res, {});
	});

	this.route = function(req, res) {
		self.expressRouter(req, res);
	};
};