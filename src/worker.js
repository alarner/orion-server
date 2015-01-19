var http = require('http');
var async = require('async');
var path = require('path');
var winston = require('winston');
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
		model.load(config);

		async.parallel({
			models: function(cb) {
				if(!config.argv['sync-db']) return cb();
				model.sequelize.sync({force: true}).then(cb, function(err) {
					winston.warn('Unable to sync models.');
					winston.warn(err);
					cb();
				});
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
				var routeInfo = router.route(req.method, req.parsedUrl.pathname);
				controller.run(req, res, routeInfo, model);
			}).listen(config.webserver.port);
			cluster.worker.send('orion::ready');
		});
	};
};
