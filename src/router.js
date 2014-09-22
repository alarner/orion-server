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

module.exports = function(config) {
	var self = this;
	this.routes = [];

	this.route = function(method, url) {	
		for(var i in self.routes) {
			var route = self.routes[i];

			if((route.info.method != '*') && (route.info.method != method.toLowerCase()))
				continue;

			if(url.length > 1) url = _s.rtrim(url, '/');
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
					: config.router.options.defaultController;
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
					: config.router.options.defaultAction;
				info.action = info.action.charAt(0).toLowerCase() + info.action.slice(1);
				// info.action = match.action || config.router.options.defaultAction;
				delete match.action;
			}

			info.params = match;

			return info;
		}

		// If we hit this spot nothing was found.
		return false;
	};

	this.loadRoutes = function() {
		self.routes = [];

		// Add application routes
		self.addRoutes(config.router.routes, self.routes, null, null, false);

		// Add plugin routes
		_.forOwn(config.plugins, function(info, name) {
			if(!info.config.router) info.config.router = {};
			if(!info.config.router.routes) info.config.router.routes = {};
			self.addRoutes(
				info.config.router.routes,
				self.routes,
				name,
				info.prefix,
				true
			);
		});

		// Add application catchall route
		var route = '/(:controller)(/:action)(/:id)';
		self.routes.push({
			pattern: urlPattern.newPattern(route),
			info: {
				method: '*',
				route: route,
				controller: null,
				action: null,
				prefix: false,
				plugin: false
			}
		});
	};

	this.addRoutes = function(routeObject, routes, plugin, prefix, catchall) {
		if(catchall === undefined) catchall = true;
		if(!prefix || !prefix.length) prefix = false;
		if(!plugin || !plugin.length) plugin = false;

		// Normalize the prefix to start with a forward slash and *not* end with a forward slash.
		if(prefix)
			prefix = path.join('/', prefix);
		if(prefix && prefix.charAt(prefix.length-1) == '/')
			prefix.substring(0, prefix.length-1);
		
		// Parse the app routes list
		_.forOwn(routeObject, function(val, key) {
			var pieces = val.split('.');
			if(pieces.length != 2)
				throw new RouterException('Invalid route target: "'+val+'". It must be in the format [Controller].[action]');

			key = key.trim();
			if(prefix) key = path.join(prefix, key);
			var parsed = {
				method: '*',
				route: key,
				controller: pieces[0],
				action: pieces[1],
				prefix: prefix,
				plugin: plugin
			};
			var matched = key.match(/^(get|put|post|delete)\s+(.+)$/);
			if(matched) {
				var route = matched[2].trim();
				if(prefix) route = path.join(prefix, route);
				parsed.method = matched[1].toLowerCase();
				parsed.route = route;
			}

			self.routes.push({
				pattern: urlPattern.newPattern(parsed.route),
				info: parsed
			});
		});

		if(catchall) {
			var route = '(/:controller)(/:action)(/:id)';
			if(prefix)
				route = prefix+route;

			self.routes.push({
				pattern: urlPattern.newPattern(route),
				info: {
					method: '*',
					route: route,
					controller: null,
					action: null,
					prefix: prefix,
					plugin: plugin
				}
			});
		}
	};
};