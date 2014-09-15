var _ = require('lodash');
var urlPattern = require('url-pattern');
var _s = require('underscore.string');
var Controller = require('./controller');

var RouterException = function(message) {
	this.message = message;
	this.name = 'RouterException';
};

module.exports = function(config) {
	var self = this;

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
				info.controller = match.controller || config.router.options.defaultController;
				delete match.controller;
			}

			if(info.action == null) {
				info.action = match.action || config.router.options.defaultAction;
				delete match.action;
			}

			info.params = match;

			return info;
		}

		// If we hit this spot nothing was found.
		return false;
	};

	this.loadRoutes = function(routeObject) {
		self.routes = [];

		// Parse the routes list
		_.forOwn(routeObject, function(val, key) {
			var pieces = val.split('.');
			if(pieces.length != 2)
				throw new RouterException('Invalid route target: "'+val+'". It must be in the format [Controller].[action]');

			key = key.trim();
			var parsed = {
				method: '*',
				route: key,
				controller: pieces[0],
				action: pieces[1]
			};
			var matched = key.match(/^(get|put|post|delete)\s+(.+)$/);
			if(matched) {
				parsed.method = matched[1].toLowerCase();
				parsed.route = matched[2].trim();
			}

			self.routes.push({
				pattern: urlPattern.newPattern(parsed.route),
				info: parsed
			});
		});

		self.routes.push({
			pattern: urlPattern.newPattern('/(:controller)(/:action)(/:id)'),
			info: {
				method: '*',
				route: '/(:controller)(/:action)(/:id)',
				controller: null,
				action: null
			}
		});
	};

	this.controller = new Controller();
	this.routes = [];

	this.loadRoutes(config.router.routes);
};