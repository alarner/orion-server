var expressResponse = require('express').response;
var viewRendered = require('./view').render;

module.exports = function(req, res, config) {
	res.__proto__ = expressResponse
	res.req = req;
	res.app = config.express.app;
	res.view = function(viewPath, params) {
		viewRendered(req, res, config, viewPath, params);
	};
};