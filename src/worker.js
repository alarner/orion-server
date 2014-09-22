var http = require('http');
var Router = require('./router');
var Controller = require('./controller');
var Request = require('./request');
var Response = require('./response');
var Model = require('./model');
var express = require('express');

module.exports = function(cluster, config) {

	// Create the router
	var router = new Router(config);
	router.loadRoutes(config.router.routes);
	config.express = {app: express()};

	this.start = function(cb) {
		
		var controller = new Controller(config);
		controller.loadControllers(config.appRoot+'/app/controllers');
		controller.loadPolicies(config.appRoot+'/app/policies');

		var model = new Model(config);

		model.loadDatabase(function(err, models) {
			http.createServer(function(req, res) {
				Request(req, res, config);
				Response(req, res, config);
				var routeInfo = router.route(req.method, req.url);
				controller.run(req, res, routeInfo, models);
			}).listen(config.webserver.port);
			cluster.worker.send('orion::ready');
		});
	};
};
