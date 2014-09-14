var http = require('http');
var Router = require('./router');

module.exports = function(cluster, config) {

	// Create the router
	var router = new Router(config);

	// Load all controllers

	// Apply custom routes

	// Apply default fallback routes
	// router.use('/:controller(/:action)(/:id)', function(req, res) {

	// });

	this.start = function(cb) {
		http.createServer(function(req, res) {
			router.route(req, res);
		}).listen(8000);
		console.log('Started server');
		cluster.worker.send('orion::ready');
	};
};
