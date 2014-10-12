var Sequelize = require('sequelize');
module.exports = {
	key: 'value',
	models: {
		Test: {
			attributes: {
				replace: {
					type: Sequelize.BOOLEAN,
					allowNull: false
				},
				add: {
					type: Sequelize.STRING,
					allowNull: false
				}
			},
			options: {
				classMethods: {
					getById: function() { return 'smth' }
				}
			}
		}
	}
};