var express = require('express');
var path = require('path');
var includeAll = require('include-all');
var _ = require('lodash');
var argv = require('optimist').argv;

var defaultConfig = includeAll({
	dirname     :  path.join(__dirname, 'default-config'),
	filter      :  /^([^\.].*)\.js$/
});

var configLoader = function(root, globalRoot, pluginInfo) {
	var self = this;

	// Load app configuration files
	var config = _.extend({}, defaultConfig);
	try {
		config = includeAll({
			dirname     :  path.join(root, 'config'),
			filter      :  /^([^\.].*)\.js$/
		});
	}
	catch(e) {
		//
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
	config.globalRoot = globalRoot;
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

	_.forOwn(config.plugins, function(subPluginInfo, pluginName) {
		if(!subPluginInfo.hasOwnProperty('prefix')) {
			subPluginInfo.prefix = {
				route: '/'+(subPluginInfo.name || ''),
				model: subPluginInfo.name || ''
			};
		}
		subPluginInfo.name = pluginName;
		subPluginInfo.prefix.model = config.prefix.model + subPluginInfo.prefix.model;
		subPluginInfo.prefix.route = path.join(config.prefix.route, subPluginInfo.prefix.route);
		var pluginConfig = configLoader(path.join(root, 'node_modules', pluginName), globalRoot, subPluginInfo);

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