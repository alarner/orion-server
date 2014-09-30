var includeAll = require('include-all');
var async = require('async');
var _ = require('lodash');
var winston = require('winston');
var path = require('path');
var serveStatic = require('serve-static');

module.exports = function(config) {
	var self = this;
	var staticMiddleware = serveStatic(
		path.join(config.root, 'public'), 
		config['static']
	);

	this.cachedControllers = {};
	this.cachedPolicies = {};
	this.policySettings = {};

	this.prepare = function(req, res, cb) {
		res.notFound = function(body) {
			if(body == undefined) body = 'Page Not Found';
			res.writeHead(404, {
				'Content-Length': body.length,
				'Content-Type': 'text/plain'
			});
			res.end(body);
		};
		cb();
	};
	
	this.run = function(req, res, info, models) {
		async.series([
			function(cb) {
				if(!config.argv || !config.argv.hasOwnProperty('static') || !config.argv['static'])
					return cb();
				
				staticMiddleware(req, res, cb);
			}
		], function(err, cb) {
			req.info = info;
			self.prepare(req, res, function(err) {
				if(!self.cachedControllers.hasOwnProperty(info.controller))
					return res.notFound();
				if(!self.cachedControllers[info.controller].hasOwnProperty(info.action))
					return res.notFound();

				async.eachSeries(
					self.policySettings[info.controller][info.action],
					function(policyName, cb) {
						return self.cachedPolicies[policyName](req, res, models, config, cb);
					},
					function(err) {
						self.cachedControllers[info.controller][info.action](req, res, models, config);
					}
				);
			});
		});
	};

	this.loadControllers = function(pluginConfig, pluginPath) {
		var self = this;
		var pluginControllers = {};
		var pluginConfigPolicies = pluginConfig.policies;

		if(!pluginPath)
			pluginPath = [];
		if(!pluginConfigPolicies)
			pluginConfigPolicies = {};

		try {
			pluginControllers = includeAll({
				dirname     :  path.join(pluginConfig.root, 'app', 'controllers'),
				filter      :  /^([^\.].*Controller)\.js$/
			});
		}
		catch(e) {
			pluginControllers = {};
		}

		_.forOwn(pluginControllers, function(actions, controllerName) {
			if(pluginPath.length)
				controllerName = pluginPath.join('::')+'::'+controllerName;

			self.cachedControllers[controllerName] = actions;
		});

		// Load the policy settings for the controllers
		var defaultControllerPolicies = pluginConfigPolicies['*'] || [];
		var forcedControllerPolicies = pluginConfigPolicies['*!'] || [];
		_.forOwn(pluginConfigPolicies, function(actions, controllerName) {
			// Ignore special keys
			if(controllerName == '*') return;
			if(controllerName == '*!') return;

			// Normalize the controllerName
			var normControllerName = controllerName;
			if(pluginPath.length)
				normControllerName = pluginPath.join('::')+'::'+controllerName;

			// Show warning if controller doesn't exist
			if(!self.cachedControllers.hasOwnProperty(normControllerName)) {
				return winston.warn(
					'Policies are specified in '+
					path.join(pluginConfig.root, 'config', 'policies.js')+
					' for '+controllerName+', which doesn\'t exist.'
				);
			}

			var defaultActionPolicies = actions['*'] || [];
			var forcedActionPolicies = actions['*!'] || [];

			self.policySettings[normControllerName] = {};

			_.forOwn(actions, function(policies, actionName) {
				// Ignore special keys
				if(actionName == '*') return;
				if(actionName == '*!') return;

				// Show warning if action doesn't exist
				if(!self.cachedControllers[normControllerName].hasOwnProperty(actionName)) {
					return winston.warn(
						'Policies are specified in '+
						path.join(pluginConfig.root, 'config', 'policies.js')+
						' for '+controllerName+'.'+actionName+', which doesn\'t exist. '
					);
				}

				self.policySettings[normControllerName][actionName] = 
					prefixPolicies(
						_.union(forcedControllerPolicies, forcedActionPolicies, policies),
						pluginPath
					);
			});

			// Apply the default controller and action policies to all actions that are not in the actions object.
			_.forOwn(self.cachedControllers[normControllerName], function(action, actionName) {
				if(actions.hasOwnProperty(actionName)) return;
				self.policySettings[normControllerName][actionName] = prefixPolicies(
					_.union(
						forcedControllerPolicies,
						defaultControllerPolicies,
						forcedActionPolicies,
						defaultActionPolicies
					),
					pluginPath
				);
			});
		});

		// Apply the default controller policies to all controllers that are not in config.policies.
		_.forOwn(self.cachedControllers, function(controller, controllerName) {
			var prefix = pluginPath.join('::')+'::';

			if(pluginPath.length && controllerName.substring(0, prefix.length) != prefix)
				return;

			if(pluginConfigPolicies.hasOwnProperty(controllerName))
				return;

			self.policySettings[controllerName] = {};

			_.forOwn(self.cachedControllers[controllerName], function(action, actionName) {
				self.policySettings[controllerName][actionName] = prefixPolicies(
					_.union(
						forcedControllerPolicies,
						defaultControllerPolicies
					),
					pluginPath
				);
			});
		});

		// Load controllers for all of the plugins
		_.forOwn(pluginConfig.plugins, function(subpluginConfig, subpluginName) {
			var subpluginPath = pluginPath.slice(0);
			subpluginPath.push(subpluginName)
			self.loadControllers(subpluginConfig, subpluginPath);
		});
	};

	var prefixPolicies = function(policies, pluginPath) {
		if(!pluginPath.length) return policies;
		for(var i=0; i<policies.length; i++) {
			policies[i] = pluginPath.join('::')+'::'+policies[i];
		}
		return policies;
	};

	this.loadPolicies = function(pluginConfig, pluginPath) {
		if(!pluginPath) pluginPath = [];
		var self = this;
		var pluginPolicies = {};
		try {
			pluginPolicies = includeAll({
				dirname     :  path.join(pluginConfig.root, 'app', 'policies'),
				filter      :  /^([^\.].*)\.js$/
			});
		}
		catch(e) {
			pluginPolicies = {};
		}
		_.forOwn(pluginPolicies, function(policy, name) {
			if(pluginPath.length)
				name = pluginPath.join('::')+'::'+name;

			self.cachedPolicies[name] = policy;
		});

		// Load plugin policies
		_.forOwn(pluginConfig.plugins, function(subpluginConfig, subpluginName) {
			var subpluginPath = pluginPath.slice(0);
			subpluginPath.push(subpluginName)
			self.loadPolicies(subpluginConfig, subpluginPath);
		});
	};
};