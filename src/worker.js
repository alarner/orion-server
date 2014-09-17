var http = require('http');
var Router = require('./router');
var Controller = require('./controller');
var express = require('express');

module.exports = function(cluster, config) {

	// Create the router
	var router = new Router(config);

	this.start = function(cb) {
		var controller = new Controller(config);
		controller.loadControllers(config.appRoot+'/app/controllers');
		controller.loadPolicies(config.appRoot+'/app/policies');
		http.createServer(function(req, res) {
			req.__proto__ = express.request;
			res.__proto__ = express.response;
			var routeInfo = router.route(req.method, req.url);
			controller.run(req, res, routeInfo);
		}).listen(8000);
		cluster.worker.send('orion::ready');
	};
};
