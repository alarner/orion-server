var express = require('express');
var path = require('path');
var includeAll = require('include-all');
var _ = require('lodash');
var argv = require('optimist').argv;

var configLoader = function(root, pluginInfo) {
	var self = this;

	// Load app configuration files
	var config = {};
	try {
		config = includeAll({
			dirname     :  path.join(root, 'config'),
			filter      :  /^([^\.].*)\.js$/
		});
	}
	catch(e) {
		config = {};
	}

	var pluginOverrides = {};
	// Load plugin override configuration files
	try {
		pluginOverrides = includeAll({
			dirname     :  path.join(root, 'config', 'plugins'),
			filter      :  /^([^\.].*)\.js$/
		});
	}
	catch(e) {
		pluginOverrides = {};
	}

	config.root = root;
	config.express = {app: express()};
	config.argv = argv || {};
	config.plugins = config.plugins || {};

	if(!pluginInfo) {
		pluginInfo = {};
	}

	if(!pluginInfo.hasOwnProperty('prefix')) {
		pluginInfo.prefix = {
			route: '/'+(pluginInfo.name || ''),
			model: pluginInfo.name || ''
		};
	}

	config.prefix = pluginInfo.prefix;

	_.forOwn(config.plugins, function(pluginInfo, pluginName) {
		pluginInfo.name = pluginName;
		var pluginConfig = configLoader(path.join(root, 'node_modules', pluginName), pluginInfo);

		if(pluginOverrides.hasOwnProperty(pluginName)) {
			pluginConfig = _.extend(
				pluginConfig,
				pluginOverrides[pluginName]
			);
		}

		config.plugins[pluginName] = pluginConfig;
	});

	return config;
};

module.exports = configLoader;