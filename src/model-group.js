var includeAll = require('include-all');
var path = require('path');
var _ = require('lodash');
var underscoreDeepExtend = require('underscore-deep-extend');
_.mixin({deepExtend: underscoreDeepExtend(_)});

var ModelGroup = function(config, sequelize) {
	this.pluginPath = pluginPath;
	this.models = {};
	this.pluginModels = {};

	this.get = function(modelName) {

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

			// Remove associations for now
			_.forOwn(attributes, function(attribute, name) {
				if(attribute.type.toLowerCase() == 'assocation');
				delete attributes[name];
			});

			self.models[modelName] = sequelize.define(
				modelName,
				model.attributes,
				model.options
			);
		});

		_.forOwn(config.plugins, function(pluginConfig, pluginName) {
			self.pluginModels[pluginName] = new ModelGroup(pluginConfig, sequelize);
			self.pluginModels.load();
		});

		// Make associations
		_.forOwn(rawModels, function(model, modelName) {
			_.forOwn(model.attributes, function(attribute, name) {
				if(attribute.type.toLowerCase() != 'assocation') return;
				var options = _.extend({}, attribute);
				delete options.type;
				delete options.method;
				delete options.model;
				self.models[modelName][attribute.method](self.get(attribute.model), options);
			});
		});
	};
};

module.exports = ModelGroup;