module.exports = {
	options: {
		defaultController: 'IndexController',
		defaultAction: 'index'
	},
	routes: {
		'get /fancy': 'CustomController.fancy',
		'post /fancy': 'CustomController.postFancy',
		'put /cstm/:id': 'CustomController.putWithId',
		'delete /whatwat/:face': 'DeleteController.whatwat',
		'/hello-world': 'HelloController.world'
	}
};