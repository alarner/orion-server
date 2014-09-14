var http = require('http');
// var router = require('router').Router([options]);

module.exports = function(cluster, appRoot) {

	// Load all controllers

	// Apply custom routes

	// Apply default fallback routes
	// router.use('/:controller(/:action)(/:id)', function(req, res) {

	// });

	this.start = function(cb) {
		http.createServer(function(req, res) {
			// console.log(process.pid);
			// res.writeHead(200);
			// res.end("hello world\n");
		}).listen(8000);
		console.log('Started server');
		cluster.worker.send('orion::ready');
	};
};
