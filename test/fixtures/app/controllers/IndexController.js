module.exports = {
	index: function(req, res, models, config) {
		res.end('Index!');
	},
	test: function(req, res, models, config) {
		res.end('Test!');
	}
}