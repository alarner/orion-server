var includeAll = require('include-all');
var path = require('path');
var _ = require('lodash');
var Waterline = require('waterline');
var underscoreDeepExtend = require('underscore-deep-extend');
_.mixin({deepExtend: underscoreDeepExtend(_)});

module.exports = function(config) {
	this.waterline = new Waterline();
	this.loadDatabase = function(cb) {
		var self = this;
		var adapters = config.database.adapters || {};
		var connections = config.database.connections || {};

		// Make sure our adapter defs have `identity` properties
		_.forOwn(adapters, function(adapter, key) {
			adapter.identity = adapter.identity || key;
		});

		// Get the default connection
		var defaultConnection = null;
		for(var i in connections) {
			if(connections.hasOwnProperty(i)) {
				defaultConnection = i;
				break;
			}
		}

		if(!defaultConnection)
			return cb('You must specify at least one connection in config/database.js');

		// Fill in attributes on app models
		var models = includeAll({
			dirname     :  path.join(config.appRoot, 'app', 'models'),
			filter      :  /^([^\.].*)\.js$/
		});
		_.forOwn(models, function(model, modelName) {
			model.identity = model.identity || modelName.toLowerCase(); // @todo convert multi word tables to underscores
			model.connection = model.connection || defaultConnection;
			var extendedModel = Waterline.Collection.extend(model);
			self.waterline.loadCollection(extendedModel);
		});

		// Fill in attributes on plugin models
		_.forOwn(config.plugins, function(pluginInfo, pluginName) {
			var models = null;
			try {
				models = includeAll({
					dirname     :  path.join(config.appRoot, 'node_modules', pluginName, 'app', 'models'),
					filter      :  /^([^\.].*)\.js$/
				});
			}
			catch(e) {
				models = {};
			}
			_.forOwn(models, function(model, modelName) {
				model.identity = null;
				// @todo convert multi word tables to underscores
				if(model.identity) {
					model.identity = pluginInfo.prefix.model+model.identity;
				}
				else {
					model.identity = pluginInfo.prefix.model+modelName.toLowerCase();
				}
				model.connection = model.connection || defaultConnection;

				if(pluginInfo.config.hasOwnProperty('models')) {
					if(pluginInfo.config.models.hasOwnProperty(modelName)) {
						model = _.deepExtend(model, pluginInfo.config.models[modelName]);
					}
				}

				var extendedModel = Waterline.Collection.extend(model);
				self.waterline.loadCollection(extendedModel);
			});
		});

		this.waterline.initialize({
			adapters: adapters,
			connections: connections
		}, function(err, ontology) {
			if(err) return cb(err);
			if(!global.model) global.model = {};
			cb(null, ontology.collections);
		});
	};
};