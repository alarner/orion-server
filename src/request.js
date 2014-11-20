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

	Handlebars.registerHelper('last', req.last);
};