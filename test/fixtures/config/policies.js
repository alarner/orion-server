// Key of '*' will apply the policies to all of the controllers (or actions
// if it's a child of a controller) that don't explicitly have their own policies
//
// Key of '*!' will apply the policy to all of the controllers (or actions if
// it's a child of a controller) even if they have their own policies.
module.exports = {
	'*!': ['greeting'],
	'*': ['auth'],
	IndexController: {
		'*!': ['index'],
		'*': ['unspecifiedIndex'],
		index: ['auth'],
		pluginPolicy: ['orion-test-plugin::auth']
	}
};