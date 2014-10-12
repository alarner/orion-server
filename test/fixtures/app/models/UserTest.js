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
	options: {}
};