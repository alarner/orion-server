var _ = require('lodash');
var async = require('async');
var winston = require('winston');
var watcher = require('./watcher');

module.exports = function(cluster, config) {
	
	var self = this;

	this.config = config;

	// Set default workerCount if it's not specified
	if(!config.webserver.workerCount)
		config.webserver.workerCount = require('os').cpus().length;

	this.start = function(cb) {

		// Watch for file changes and restart workers if the --watch flag is specified
		if(self.config.argv && self.config.argv.hasOwnProperty('watch')) {
			watcher(config.appRoot, self.refreshWorkers);
			// var watch = require('watch');
			
			// watch.watchTree(config.appRoot, function (f, curr, prev) {
			// 	if (typeof f == 'object' && prev === null && curr === null) {
			// 		// Finished walking the tree
			// 	} else {
			// 		self.refreshWorkers();
			// 	}
			// });
		}

		// Fork workers.
		for(var i=0; i<self.config.webserver.workerCount; i++) {
			winston.info('starting worker '+i);
			cluster.fork();
		}

		// Look out for dead workers
		cluster.on('exit', function(worker, code, signal) {
			if(worker.suicide) return;
			winston.warn('worker ' + worker.process.pid + ' died unexpectedly');
			cluster.fork();
		});
	};

	// Kills all of the current workers and forks a new worker for each one killed.
	// Uses an async queue to ensure that at least one worker is alive at any given time.
	this.refreshWorkers = function(cb) {
		var workersToRefresh = _.keys(cluster.workers);

		var killQueue = async.queue(function(worker, cb) {
			worker.kill();
			winston.info('killed worker', worker.id);
			var newWorker = cluster.fork();
			newWorker.on('message', function(msg) {
				if(msg == 'orion::ready') return cb();
			});
		}, workersToRefresh.length-1);

		killQueue.push(_.values(cluster.workers));
		killQueue.drain = cb;
	};
};