var express = require('express');
var path = require('path');
var includeAll = require('include-all');
var _ = require('lodash');
var argv = require('optimist').argv;

module.exports = function(appRoot) {
	var self = this;

	// Load app configuration files
	var config = includeAll({
		dirname     :  path.join(appRoot, 'config'),
		filter      :  /^([^\.].*)\.js$/
	});

	// Load plugin override configuration files
	var pluginOverrides = includeAll({
		dirname     :  path.join(appRoot, 'config', 'plugins'),
		filter      :  /^([^\.].*)\.js$/
	});

	_.forOwn(config.plugins, function(pluginInfo, pluginName) {
		if(!pluginInfo.hasOwnProperty('prefix'))
			pluginInfo.prefix = '/'+pluginName;

		try {
			config.plugins[pluginName].config = includeAll({
				dirname     :  path.join(appRoot, 'node_modules', pluginName, 'config'),
				filter      :  /^([^\.].*)\.js$/
			});
		}
		catch(e) {
			config.plugins[pluginName].config = {};
		}

		if(pluginOverrides.hasOwnProperty(pluginName)) {
			config.plugins[pluginName].config = _.extend(
				config.plugins[pluginName].config,
				pluginOverrides[pluginName]
			);
		}
	});
	config.appRoot = appRoot;
	config.express = {app: express()};
	config.argv = argv || {};
	return config;
};