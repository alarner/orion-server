var cluster = require('cluster');
var winston = require('winston');
var _ = require('lodash');
var configLoader = require('./config-loader');

module.exports = function(root) {
	var Server = null;
	if(cluster.isMaster) {
		console.log('isMaster');
		Server = require('./master');
	}
	else {
		Server = require('./worker');
	}

	// Load configuration files
	var config = configLoader(root);

	// Set up logger options
	_.forOwn(config.logger, function(value, key) {
		winston.remove(winston.transports[key]);
		winston.add(winston.transports[key], value);
	});
	var s = new Server(cluster, config);
	s.start();
};