var viewRendered = require('./view').render;

module.exports = function(req, res, config) {
	res.req = req;
	res.view = function(viewPath, params) {
		viewRendered(req, res, config, viewPath, params);
	};
};