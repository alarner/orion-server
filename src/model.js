var Sequelize = require('sequelize');
var includeAll = require('include-all');
var path = require('path');
var _ = require('lodash');
var changeCase = require('change-case');
var underscoreDeepExtend = require('underscore-deep-extend');
_.mixin({deepExtend: underscoreDeepExtend(_)});

var ModelException = function(message) {
	this.message = message;
};

var Model = function(config, sequelize) {
	this.models = {};
	this.pluginModels = {};

	if(!sequelize) {
		var database = config.database.database;
		var username = config.database.username;
		var password = config.database.password || null;
		var options = _.extend({}, config.database);
		delete options.database;
		delete options.username;
		delete options.password;

		if(options.storage)
			options.storage = path.join(config.root, options.storage);

		sequelize = new Sequelize(
			database,
			username,
			password,
			options
		);
	}

	this.sequelize = sequelize;

	this.get = function(modelName) {
		var pieces = modelName.split('::');
		var model = pieces.pop();
		var plugin = this.getPluginModels(pieces);
		if(!plugin.models.hasOwnProperty(model)) return false;
		return plugin.models[model];
	};

	this.getPluginModels = function(pluginPath) {
		var target = this;
		for(var i=0; i<pluginPath.length; i++) {
			var pluginName = pluginPath[i];
			if(!target.pluginModels.hasOwnProperty(pluginName)) return false;
			target = target.pluginModels[pluginName];
		}
		return target;
	};

	this.load = function() {
		var self = this;
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

			model.attributes = model.attributes || {};
			model.options = model.options || {};

			var attributes = _.extend({}, model.attributes);

			if(!model.options.noId && !model.attributes.id) {
				model.attributes.id = {
					type: Sequelize.INTEGER,
					primaryKey: true,
					autoIncrement: true
				};
			}

			var options = _.deepExtend({
				classMethods: {
					models: self
				}
			}, model.options);
			if(!options.tableName) {
				options.tableName = config.prefix.model+changeCase.snakeCase(modelName);
			}

			// Remove associations for now
			var associationAttributes = [];
			for(var name in attributes) {
				if(!attributes.hasOwnProperty(name)) return;
				var attribute = attributes[name];
				if(!attribute.type)
					throw new ModelException('Attribute "'+name+'" on model "'+modelName+'" does not have a type.');
				if(_.isString(attribute.type) && attribute.type.toLowerCase() == 'association') {
					associationAttributes.push(name);
				}
			}

			associationAttributes.forEach(function(name) {
				delete attributes[name];
			});

			self.models[modelName] = sequelize.define(
				modelName,
				attributes,
				options
			);
		});

		_.forOwn(config.plugins, function(pluginConfig, pluginName) {
			self.pluginModels[pluginName] = new Model(pluginConfig, sequelize);
			self.pluginModels[pluginName].load();
		});

		// Make associations
		_.forOwn(rawModels, function(model, modelName) {
			_.forOwn(model.attributes, function(attribute, name) {
				if(!_.isString(attribute.type) || attribute.type.toLowerCase() != 'association') return;
				var options = _.extend({}, attribute);
				delete options.type;
				delete options.method;
				delete options.model;
				self.models[modelName][attribute.method](self.get(attribute.model), options);
			});
		});
	};
};

module.exports = Model;

// var includeAll = require('include-all');
// var path = require('path');
// var _ = require('lodash');
// var changeCase = require('change-case');
// var underscoreDeepExtend = require('underscore-deep-extend');
// _.mixin({deepExtend: underscoreDeepExtend(_)});

// var loadModels = function(pluginPath, config, sequelize,  models) {
// 	models = models || [];

// 	// Load models
// 	var rawModels = {};
// 	try {
// 		rawModels = includeAll({
// 			dirname     :  path.join(config.root, 'app', 'models'),
// 			filter      :  /^([^\.].*)\.js$/
// 		});
// 	}
// 	catch(e) {
// 		rawModels = {};
// 	}

// 	_.forOwn(rawModels, function(model, modelName) {
// 		if(config.hasOwnProperty('models') && config.models.hasOwnProperty(modelName)) {
// 			model = _.deepExtend(model, config.models[modelName]);
// 		}
// 		// model.__orion = {
// 		// 	pluginPath: pluginPath,
// 		// 	originalName: modelName
// 		// };

// 		model.attributes = model.attributes || {};
// 		model.options = model.options || {};

// 		if(!model.options.noId && !model.attributes.id) {
// 			model.attributes.id = {
// 				type: Sequelize.INTEGER,
// 				primaryKey: true,
// 				autoIncrement: true
// 			};
// 		}

// 		var sequelizedModel = sequelize.define(
// 			modelName,
// 			model.attributes,
// 			model.options
// 		);

// 		models.push(model);
// 	});

// 	_.forOwn(config.plugins, function(pluginConfig, pluginName) {
// 		var subpluginPath = pluginPath.slice(0);
// 		subpluginPath.push(pluginName);
// 		loadModels(subpluginPath, pluginConfig, sequelize, models);
// 	});


// 	return models;
// };

// module.exports = function(config) {
// 	var database = config.database.database;
// 	var username = config.database.username;
// 	var password = config.database.password || null;
// 	var options = _.extend({}, config.database);
// 	delete options.database;
// 	delete options.username;
// 	delete options.password;
// 	this.sequelize = new Sequelize(
// 		database,
// 		useername,
// 		password,
// 		options
// 	);





// 	// this.waterline = new Waterline();
// 	// // @todo: refactor this logic to be recursive
// 	// this.loadDatabase = function(cb) {
// 	// 	var self = this;

// 	// 	var models = loadModels([], config, this.sequelize);

// 	// 	// Key models wth their pluginPath
// 	// 	var keyedModels = {};
// 	// 	_.each(models, function(model) {
// 	// 		var key = model.__orion.originalName;
// 	// 		if(model.__orion.pluginPath.length > 0) {
// 	// 			key = model.__orion.pluginPath.join('::')+'::'+model.__orion.originalName;
// 	// 		}
// 	// 		keyedModels[key] = model;
// 	// 	});

// 	// 	// Loop through models to update any association names and
// 	// 	// tell waterline to load the collection
// 	// 	var err = false;
// 	// 	_.each(models, function(model) {
// 	// 		if(!model.hasOwnProperty('attributes'))
// 	// 			model.attributes = {};

// 	// 		_.forOwn(model.attributes, function(attribute, attributeName) {
// 	// 			if(!attribute.hasOwnProperty('collection') && !attribute.hasOwnProperty('model')) return;

// 	// 			var target = attribute.collection || attribute.model;

// 	// 			if(!keyedModels.hasOwnProperty(target)) {
// 	// 				err = 'Could not find associated model "'+attribute.collection+'" in "'+model.__orion.originalName+'"';
// 	// 				return;
// 	// 			}

// 	// 			if(attribute.hasOwnProperty('collection'))
// 	// 				attribute.collection = keyedModels[target].identity;

// 	// 			if(attribute.hasOwnProperty('model'))
// 	// 				attribute.model = keyedModels[target].identity;
// 	// 		});

// 	// 		var extendedModel = Waterline.Collection.extend(model);
// 	// 		self.waterline.loadCollection(extendedModel);
// 	// 	});
// 	// 	if(err) return cb(err);

// 	// 	this.waterline.initialize({
// 	// 		adapters: adapters,
// 	// 		connections: connections
// 	// 	}, function(err, ontology) {
// 	// 		if(err) return cb(err);
// 	// 		var models = {};
// 	// 		_.forOwn(ontology.collections, function(model, name) {
// 	// 			if(!model.__orion) return;

// 	// 			var key = model.__orion.originalName;
// 	// 			if(model.__orion.pluginPath.length > 0) {
// 	// 				key = model.__orion.pluginPath.join('::')+'::'+model.__orion.originalName;
// 	// 			}

// 	// 			models[key] = model;
// 	// 		});
// 	// 		cb(null, models);
// 	// 	});
// 	// };
// };