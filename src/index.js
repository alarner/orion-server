var cluster = require('cluster');
var path = require('path');
var includeAll = require('include-all');
var winston = require('winston');
var _ = require('lodash');

module.exports = function(appRoot) {
	var Server = null;
	if(cluster.isMaster) {
		console.log('isMaster');
		Server = require('./master');
	}
	else {
		Server = require('./worker');
	}

	// Load configuration files
	var config = includeAll({
		dirname     :  appRoot + '/config',
		filter      :  /^([^\.].*)\.js$/
	});
	config.appRoot = appRoot;

	// Set up logger options
	_.forOwn(config.logger, function(value, key) {
		winston.remove(winston.transports[key]);
		winston.add(winston.transports[key], value);
	});
	var s = new Server(cluster, config);
	s.start();
};