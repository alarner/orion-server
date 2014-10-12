var Sequelize = require('sequelize');
module.exports = {
	attributes: {
		email: {
			type: Sequelize.STRING
		},
		authOptions: {
			type: 'association',
			method: 'hasMany',
			model: 'UserAuthOption',
			as: 'UserAuthOptions'
		}
	},
	options: {
		classMethods: {
			method1: function() { return 'smth' }
		},
		instanceMethods: {
			method2: function() { return 'foo' }
		}
	}
};