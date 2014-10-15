var _ = require('lodash');
var async = require('async');
var urlPattern = require('url-pattern');
var _s = require('underscore.string');
var path = require('path');
var Controller = require('./controller');

var RouterException = function(message) {
	this.message = message;
	this.name = 'RouterException';
};

module.exports = function() {
	var self = this;
	this.routes = [];

	this.route = function(method, url) {	
		for(var i in self.routes) {
			var route = self.routes[i];
			if((route.info.method != '*') && (route.info.method != method.toLowerCase()))
				continue;

			url = _s.rtrim(url, '/');
			var match = self.routes[i].pattern.match(url);

			if(!match)
				continue;

			var info = _.extend({}, route.info);

			if(info.controller == null) {
				info.controller = 
					match.controller ?
						_.map(
							match.controller.split('-'),
							_s.capitalize
						)
						.join('')+'Controller'
					: info.config.router.options.defaultController;
				delete match.controller;
			}

			if(info.action == null) {
				info.action = 
					match.action ?
						_.map(
							match.action.split('-'),
							_s.capitalize
						)
						.join('')
					: info.config.router.options.defaultAction;
				info.action = info.action.charAt(0).toLowerCase() + info.action.slice(1);
				delete match.action;
			}

			info.params = match;

			return info;
		}

		// If we hit this spot nothing was found.
		return false;
	};

	this.loadRoutes = function(parentConfig) {
		if(!parentConfig.router) parentConfig.router = {};
		if(!parentConfig.router.routes) parentConfig.router.routes = {};

		// Add application routes
		self.addRoutes(parentConfig);

		// Add plugin routes
		_.forOwn(parentConfig.plugins, function(childConfig, name) {
			self.loadRoutes(childConfig);
		});

		// Add parent catchall route
		var route = '(/:controller)(/:action)(/:id)';
		if(parentConfig.prefix.route && parentConfig.prefix.route != '/')
			route = parentConfig.prefix.route+route;

		self.routes.push({
			pattern: urlPattern.newPattern(route),
			info: {
				method: '*',
				route: route,
				controller: null,
				action: null,
				config: parentConfig
			}
		});
	};

	this.addRoutes = function(parentConfig) {
		var prefix = parentConfig.prefix.route || false;

		// Normalize the prefix to start with a forward slash and *not* end with a forward slash.
		if(prefix)
			prefix = path.join('/', prefix);
		if(prefix && prefix.charAt(prefix.length-1) == '/')
			prefix.substring(0, prefix.length-1);
		
		// Parse the app routes list
		_.forOwn(parentConfig.router.routes, function(val, key) {
			var pieces = val.split('.');
			if(pieces.length != 2)
				throw new RouterException('Invalid route target: "'+val+'". It must be in the format [Controller].[action]');

			key = key.trim();
			var parsed = {
				method: '*',
				controller: pieces[0],
				action: pieces[1],
				config: parentConfig
			};
			var matched = key.match(/^(get|put|post|delete)\s+(.+)$/);
			if(matched) {
				var route = matched[2].trim();
				if(prefix) route = path.join(prefix, route);
				parsed.method = matched[1].toLowerCase();
				parsed.route = route;
			}
			else {
				if(prefix) key = path.join(prefix, key);
				parsed.route = key;
			}

			self.routes.push({
				pattern: urlPattern.newPattern(parsed.route),
				info: parsed
			});
		});
	};
};