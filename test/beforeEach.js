var path = require('path');
var configLoader = require('../src/config-loader');

module.exports = function() {
	var root = path.join(__dirname, 'fixtures');
	this.config = configLoader(root, root);
};