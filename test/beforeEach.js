var path = require('path');
var includeAll = require('include-all');
var express = require('express');
var _ = require('lodash');

module.exports = function() {
	var appRoot = path.join(__dirname, 'fixtures');
	var self = this;

	// Load configuration files
	this.config = includeAll({
		dirname     :  path.join(appRoot, 'config'),
		filter      :  /^([^\.].*)\.js$/
	});
	_.forOwn(this.config.plugins, function(pluginInfo, pluginName) {
		if(!pluginInfo.hasOwnProperty('prefix'))
			pluginInfo.prefix = '/'+pluginName;

		self.config.plugins[pluginName].config = includeAll({
			dirname     :  path.join(appRoot, 'node_modules', pluginName, 'config'),
			filter      :  /^([^\.].*)\.js$/
		});
	});
	this.config.appRoot = appRoot;
	this.config.express = {app: express()};
};