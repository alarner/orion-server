var Handlebars = require('handlebars');
var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var async = require('async');
var recursive = require('recursive-readdir');
var changeCase = require('change-case');

require('handlebars-layouts')(Handlebars);

var View = {
	cache: {},
	loadLayouts: function(layoutRoot, cb) {
		recursive(layoutRoot, function(err, files) {
			if(err) return cb(err);
			async.each(
				files,
				function(file, cb) {
					fs.readFile(file, function(err, layout) {
						if(err) return cb(err);
						
						Handlebars.registerPartial(
							file.substring(layoutRoot.length+1, file.length-4),
							layout.toString()
						);
						cb();
					});
				},
				cb
			);
		});
	},
	render: function(req, res, config, viewPath, params, cb) {
		var params = params || {};

		// No path is specified, try to create a default
		if(!viewPath || _.isObject(viewPath)) {
			params = viewPath || {};
			if(!req.info) {
				var err = 'Missing request info.';
				res.error(err);
				return cb ? cb(err) : false;
			}

			var controllerName = 
				req.info.controller
				.substring(0, req.info.controller.length - 10)
				.toLowerCase();

			viewPath = path.join(
				config.root,
				'views',
				controllerName,
				changeCase.paramCase(req.info.action)+'.hbs'
			);
		}
		// Use the path that was passed in. Make it relative to root/views 
		// unless it's an absolute path.
		else if(viewPath.charAt(0) != '/') {
			viewPath = path.join(config.root, 'views', viewPath+'.hbs');
		}

		async.series({
			compiled: function(cb) {
				if(View.cache.hasOwnProperty(viewPath))
					return cb(null, View.cache[viewPath]);

				fs.readFile(viewPath, function(err, viewData) {
					if(err) return cb(err);
					
					var compiled = Handlebars.compile(viewData.toString());
					if(!compiled) return cb('Unable to compile view.');
					View.cache[viewPath] = compiled;
					cb(null, compiled);
				});
			}
		}, function(err, result) {
			if(err) {
				if(err.code && err.code == 'ENOENT') {
					res.error('Could not find view: '+err.path, 404);
				}
				else {
					res.error(err);
				}
				return cb ? cb(err) : false;
			}
			res.send(result.compiled(params));
			if(cb) cb();
		});
	}
};

module.exports = View;