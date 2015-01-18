var expressRequest = require('express').request;
var Handlebars = require('handlebars');

module.exports = function(req, res, config) {
	req.__proto__ = expressRequest
	req.res = res;
	req.app = config.express.app;
	req.last = function(type, key) {
		if(req.session.orion.lastData) {
			if(req.session.orion.lastData.hasOwnProperty(type)) {
				if(req.session.orion.lastData[type].hasOwnProperty(key)) {
					return req.session.orion.lastData[type][key];
				}
			}
		}
		return '';
	};

	req.error = function() {
		var message = '';
		var params = false;
		if(req.session.hasOwnProperty('orion')) {
			if(req.session.orion.hasOwnProperty('error')) {
				if(req.session.orion.error.hasOwnProperty('message')) {
					message = req.session.orion.error.message;
				}
				if(req.session.orion.error.hasOwnProperty('params')) {
					params = req.session.orion.error.params;
				}
				delete req.session.orion.error;
			}
		}

		if(message && params)
			message = Handlebars.compile(message)(params);

		return message;
	};

	Handlebars.registerHelper('last', req.last);
};