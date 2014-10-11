var includeAll = require('include-all');
var path = require('path');
var _ = require('lodash');
var Waterline = require('waterline');
var changeCase = require('change-case');
var underscoreDeepExtend = require('underscore-deep-extend');
_.mixin({deepExtend: underscoreDeepExtend(_)});

var loadModels = function(pluginPath, config, defaultConnection, models) {
	models = models || [];

	// Load models
	var rawModels = {};
	try {
		rawModels = includeAll({
			dirname     :  path.join(config.root, 'app', 'models'),
			filter      :  /^([^\.].*)\.js$/
		});
	}
	catch(e) {
		rawModels = {};
	}

	_.forOwn(rawModels, function(model, modelName) {
		if(config.hasOwnProperty('models') && config.models.hasOwnProperty(modelName)) {
			model = _.deepExtend(model, config.models[modelName]);
		}
		model.identity = model.identity || config.prefix.model+changeCase.snakeCase(modelName);
		model.connection = model.connection || defaultConnection;
		model.__orion = {
			pluginPath: pluginPath,
			originalName: modelName
		};
		models.push(model);
	});

	_.forOwn(config.plugins, function(pluginConfig, pluginName) {
		var subpluginPath = pluginPath.slice(0);
		subpluginPath.push(pluginName);
		loadModels(subpluginPath, pluginConfig, defaultConnection, models);
	});


	return models;
};

module.exports = function(config) {
	this.waterline = new Waterline();
	// @todo: refactor this logic to be recursive
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

		var models = loadModels([], config, defaultConnection);

		// Key models wth their pluginPath
		var keyedModels = {};
		_.each(models, function(model) {
			var key = model.__orion.originalName;
			if(model.__orion.pluginPath.length > 0) {
				key = model.__orion.pluginPath.join('::')+'::'+model.__orion.originalName;
			}
			keyedModels[key] = model;
		});

		// Loop through models to update any association names and
		// tell waterline to load the collection
		var err = false;
		_.each(models, function(model) {
			if(!model.hasOwnProperty('attributes'))
				model.attributes = {};

			_.forOwn(model.attributes, function(attribute, attributeName) {
				if(!attribute.hasOwnProperty('collection') && !attribute.hasOwnProperty('model')) return;

				var target = attribute.collection || attribute.model;

				if(!keyedModels.hasOwnProperty(target)) {
					err = 'Could not find associated model "'+attribute.collection+'" in "'+model.__orion.originalName+'"';
					return;
				}

				if(attribute.hasOwnProperty('collection'))
					attribute.collection = keyedModels[target].identity;

				if(attribute.hasOwnProperty('model'))
					attribute.model = keyedModels[target].identity;
			});

			var extendedModel = Waterline.Collection.extend(model);
			self.waterline.loadCollection(extendedModel);
		});
		if(err) return cb(err);

		this.waterline.initialize({
			adapters: adapters,
			connections: connections
		}, function(err, ontology) {
			if(err) return cb(err);
			var models = {};
			_.forOwn(ontology.collections, function(model, name) {
				if(!model.__orion) return;

				var key = model.__orion.originalName;
				if(model.__orion.pluginPath.length > 0) {
					key = model.__orion.pluginPath.join('::')+'::'+model.__orion.originalName;
				}

				models[key] = model;
			});
			cb(null, models);
		});
	};
};