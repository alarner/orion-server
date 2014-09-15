module.exports = function() {
	
	this.run = function(req, res, info) {
		console.log(req.url);
		console.log(info);
	};
};