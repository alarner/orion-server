var path = require('path');
var configLoader = require('../src/config-loader');

module.exports = function() {
	var appRoot = path.join(__dirname, 'fixtures');
	this.config = configLoader(appRoot);
};