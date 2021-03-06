var express = require('express');
var path = require('path');
var fs = require('fs');
var includeAll = require('include-all');
var _ = require('lodash');
var changeCase = require('change-case');
var underscoreDeepExtend = require('underscore-deep-extend');
_.mixin({deepExtend: underscoreDeepExtend(_)});
var argv = require('optimist').argv;

var defaultConfig = includeAll({
	dirname     :  path.join(__dirname, 'default-config'),
	filter      :  /^([^\.].*)\.js$/
});

var configLoader = function(root, globalConfig, pluginInfo) {
	var self = this;

	// Load app configuration files
	var config = _.deepExtend({}, defaultConfig);
	var configPath = path.join(root, 'config');
	if(fs.existsSync(configPath)) {
		config = includeAll({
			dirname     :  configPath,
			filter      :  /^([^\.].*)\.js$/
		});
	}

	// Load plugin override configuration files
	var pluginOverrides = {};
	var pluginOverridePath = path.join(configPath, 'plugins');
	if(fs.existsSync(pluginOverridePath)) {
		pluginOverrides = includeAll({
			dirname     :  pluginOverridePath,
			filter      :  /^([^\.].*)\.js$/
		});
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
	if(!globalConfig) globalConfig = config;
	config.globalConfig = globalConfig;

	_.forOwn(config.plugins, function(subPluginInfo, pluginName) {
		if(!subPluginInfo.hasOwnProperty('prefix'))
			subPluginInfo.prefix = {};
		if(!subPluginInfo.prefix.hasOwnProperty('route'))
			subPluginInfo.prefix.route = '/'+pluginName;
		if(!subPluginInfo.prefix.hasOwnProperty('model'))
			subPluginInfo.prefix.model = changeCase.snakeCase(pluginName)+'_';

		subPluginInfo.name = pluginName;
		subPluginInfo.prefix.model = config.prefix.model + subPluginInfo.prefix.model;
		subPluginInfo.prefix.route = path.join(config.prefix.route, subPluginInfo.prefix.route);
		var pluginConfig = configLoader(path.join(root, 'node_modules', pluginName), globalConfig, subPluginInfo);

		if(pluginOverrides.hasOwnProperty(pluginName)) {
			pluginConfig = _.deepExtend(
				pluginConfig,
				pluginOverrides[pluginName]
			);
		}

		config.plugins[pluginName] = pluginConfig;
	});

	return config;
};

module.exports = configLoader;