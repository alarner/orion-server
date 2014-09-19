var ejs = require('ejs');
var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var async = require('async');

var ViewException = function(message) {
	this.type = 'ViewException';
	this.message = message;
};

var View = {
	cache: {},
	render: function(req, res, config, viewPath, params) {
		var params = params || {};

		// No path is specified, try to create a default
		if(!viewPath || _.isObject(viewPath)) {
			params = viewPath || {};
			if(!req.info) throw new ViewException('Missing request info.');

			var controllerName = 
				req.info.controller
				.substring(0, req.info.controller.length - 10)
				.toLowerCase();

			viewPath = path.join(
				config.appRoot,
				'views',
				controllerName,
				req.info.action.toLowerCase()+'.ejs'
			);
		}
		// Use the path that was passed in
		else {
			viewPath = path.join(config.appRoot, 'views', viewPath);
		}

		async.series({
			compiled: function(cb) {
				if(View.cache.hasOwnProperty(viewPath))
					return cb(null, View.cache[viewPath]);

				fs.readFile(viewPath, function(err, viewData) {
					if(err) return cb(err);
						console.log(err);
					
					var compiled = ejs.compile(viewData.toString(), config.view);
					if(!compiled) return cb('Unable to compile view.');
					View.cache[viewPath] = compiled;
					cb(null, compiled);
				});
			}
		}, function(err, result) {
			// @todo make this message configurable or give the ability to turn it off
			if(err) return res.status(500).send(err);
			res.send(result.compiled(params))
		});
	}
};

module.exports = View;