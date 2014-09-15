var includeAll = require('include-all');
var async = require('async');
var _ = require('lodash');
var winston = require('winston');

module.exports = function(config) {
	var self = this;

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
	
	this.run = function(req, res, info) {
		self.prepare(req, res, function(err) {
			if(!self.cachedControllers.hasOwnProperty(info.controller))
				return res.notFound();
			if(!self.cachedControllers[info.controller].hasOwnProperty(info.action))
				return res.notFound();

			async.eachSeries(
				self.policySettings[info.controller][info.action],
				function(policyName, cb) {
					return self.cachedPolicies[policyName](req, res, cb);
				},
				function(err) {
					self.cachedControllers[info.controller][info.action](req, res);
				}
			);
		});
	};

	this.loadControllers = function(dirname) {
		// Load all of the controllers
		self.cachedControllers = includeAll({
			dirname     :  dirname,
			filter      :  /^([^\.].*Controller)\.js$/
		});

		// Load the policy settings for the controllers
		var defaultControllerPolicies = config.policies['*'] || [];
		var forcedControllerPolicies = config.policies['*!'] || [];
		_.forOwn(config.policies, function(actions, controllerName) {
			// Ignore special keys
			if(controllerName == '*') return;
			if(controllerName == '*!') return;

			// Show warning if controller doesn't exist
			if(!self.cachedControllers.hasOwnProperty(controllerName))
				return winston.warn('Policies are specified in config/policies.js for '+controllerName+', which doesn\'t exist. ');

			var defaultActionPolicies = actions['*'] || [];
			var forcedActionPolicies = actions['*!'] || [];

			self.policySettings[controllerName] = {};

			_.forOwn(actions, function(policies, actionName) {
				if(actionName == '*') return;
				if(actionName == '*!') return;

				// Show warning if action doesn't exist
				if(!self.cachedControllers[controllerName].hasOwnProperty(actionName))
					return winston.warn('Policies are specified in config/policies.js for '+controllerName+'.'+actionName+', which doesn\'t exist. ');

				self.policySettings[controllerName][actionName] = 
					_.union(forcedControllerPolicies, forcedActionPolicies, policies);
			});

			// Apply the default controller and action policies to all actions that are not in the actions object.
			_.forOwn(self.cachedControllers[controllerName], function(action, actionName) {
				if(actions.hasOwnProperty(actionName)) return;
				self.policySettings[controllerName][actionName] = _.union(
					forcedControllerPolicies,
					defaultControllerPolicies,
					forcedActionPolicies,
					defaultActionPolicies
				);
			});
		});

		// Apply the default controller policies to all controllers that are not in config.policies.
		_.forOwn(self.cachedControllers, function(controller, controllerName) {
			if(config.policies.hasOwnProperty(controllerName)) return;

			self.policySettings[controllerName] = {};

			_.forOwn(self.cachedControllers[controllerName], function(action, actionName) {
				self.policySettings[controllerName][actionName] = _.union(
					forcedControllerPolicies,
					defaultControllerPolicies
				);
			});
		});
	};

	this.loadPolicies = function(dirname) {
		self.cachedPolicies = includeAll({
			dirname     :  dirname,
			filter      :  /^([^\.].*)\.js$/
		});
		self.cachedPolicies['orion::core'] = require('./core');
	};
};