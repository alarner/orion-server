module.exports = function(req, res, cb) {
	if(req.user && req.user.isLoggedIn()) {
		return cb();
	}

	var redirect = encodeURIComponent(req.protocol + "://" + req.get('host') + req.url);
	res.redirect('/login/index?redirect='+redirect);
};