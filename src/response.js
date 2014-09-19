var expressResponse = require('express').response;
var viewRendered = require('./view').render;
var path = require('path');

module.exports = function(req, res, config) {
	res.__proto__ = expressResponse
	res.req = req;
	res.app = config.express.app;
	res.view = function(viewPath, params) {
		viewRendered(req, res, config, viewPath, params);
	};
	res.error = function(message, status, trace) {
		if(!status) status = 500;
		var errorViewPath = config.view.error || path.join(__dirname, 'views', 'error.ejs');
		res.status(status).view(errorViewPath, {
			message: message,
			status: status,
			trace: trace
		});
	};
};