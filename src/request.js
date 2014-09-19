var expressRequest = require('express').request;

module.exports = function(req, res, config) {
	req.__proto__ = expressRequest
	req.res = res;
	req.app = config.express.app;
};