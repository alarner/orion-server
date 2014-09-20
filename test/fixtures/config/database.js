module.exports = {
	adapters: {
		'sails-disk': require('sails-disk')
	},
	connections: {
		main: {
			adapter: 'sails-disk'
		}
	}
};