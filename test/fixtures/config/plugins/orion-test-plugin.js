module.exports = {
	key: 'value',
	models: {
		Test: {
			attributes: {
				replace: {
					type: 'bool',
					required: true
				},
				add: {
					type: 'string',
					required: true
				}
			},
			getById: function(id, cb) {
				cb(123);
			}
		}
	}
};