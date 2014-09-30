module.exports = {
	index: function(req, res, models, config) {
		res.end('Index!');
	},
	test: function(req, res, models, config) {
		res.end('Test!');
	},
	pluginPolicy: function(req, res, models, config) {
		
	},
	paramCaseTest: function(req, res, models, config) {
		res.view();
	},
	viewTest: function(req, res, models, config) {
		res.view();
	}
}