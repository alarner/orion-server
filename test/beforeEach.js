var path = require('path');
var includeAll = require('include-all');
var express = require('express');

module.exports = function() {
	var appRoot = path.join(__dirname, 'fixtures');

	// Load configuration files
	this.config = includeAll({
		dirname     :  path.join(appRoot, 'config'),
		filter      :  /^([^\.].*)\.js$/
	});
	this.config.appRoot = appRoot;
	this.config.express = {app: express()};
};