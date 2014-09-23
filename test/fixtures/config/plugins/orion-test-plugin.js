module.exports = {
	key: 'value',
	models: {
		Test: {
			getById: function(id, cb) {
				cb(123);
			}
		}
	}
};