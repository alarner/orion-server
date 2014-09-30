var http = require('http');
var async = require('async');
var path = require('path');
var Router = require('./router');
var Controller = require('./controller');
var Request = require('./request');
var Response = require('./response');
var View = require('./view');
var Model = require('./model');


module.exports = function(cluster, config) {

	// Create the router
	var router = new Router();
	router.loadRoutes(config);

	this.start = function(cb) {
		
		var controller = new Controller(config);
		controller.loadControllers(config);
		controller.loadPolicies(config);

		var model = new Model(config);

		async.parallel({
			models: function(cb) {
				model.loadDatabase(cb);
			},
			layouts: function(cb) {
				View.loadLayouts(
					path.join(config.root, '/layouts'),
					cb
				);
			}
		}, function(err, results) {
			http.createServer(function(req, res) {
				Request(req, res, config);
				Response(req, res, config);
				var routeInfo = router.route(req.method, req.url);
				controller.run(req, res, routeInfo, results.models);
			}).listen(config.webserver.port);
			cluster.worker.send('orion::ready');
		});
	};
};
