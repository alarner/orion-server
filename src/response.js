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
	res.notFound = function(body) {
		if(body == undefined) body = 'Page Not Found';
		res.writeHead(404, {
			'Content-Length': body.length,
			'Content-Type': 'text/plain'
		});
		res.end(body);
	};
	res.badRequest = function(body) {
		if(body == undefined) body = 'Bad Request';
		res.writeHead(400, {
			'Content-Length': body.length,
			'Content-Type': 'text/plain'
		});
		res.end(body);
	};
	res.internalServerError = function(body) {
		if(body == undefined) body = 'Internal Server Error';
		if(typeof body !== 'string') {
			if(typeof body === 'object')
				body = JSON.stringify(body);
			else
				body = body.toString();
		}
		res.writeHead(500, {
			'Content-Length': body.length,
			'Content-Type': 'text/plain'
		});
		res.end(body);
	};
	res.redir = function(dest, status) {
		status = status || 303;
		if(dest.charAt(0) == '/') {
			dest = path.join(config.prefix.route, dest);
		}
		return res.redirect(status, dest);
	};
	res.error = function(err) {
		if(!req.session.orion.hasOwnProperty('error'))
			req.session.orion.error = {};

		req.session.orion.error = err;
	};
};