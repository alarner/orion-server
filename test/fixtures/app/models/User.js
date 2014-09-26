module.exports = {
	attributes: {
		email: { type: 'string' },
		authOptions: {
			collection: 'UserAuthOption',
			via: 'userId'
		}
	}
};