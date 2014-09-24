module.exports = {
	// Set how "dotfiles" are treated when encountered.
	// - allow: No special treatment for dotfiles.
	// - deny: Send a 403 for any request for a dotfile.
	// - ignore: Pretend like the dotfile does not exist and call next().
	dotfiles: 'ignore',
	// Enable or disable etag generation, defaults to true.
	etag: true,
	// Set file extension fallbacks. When set, if a file is not found, the 
	// given extensions will be added to the file name and search for. The 
	// first that exists will be served. Example: ['html', 'htm'].
	// The default value is false.
	extensions: false,
	// By default this module will send "index.html" files in response to a
	// request on a directory. To disable this set false or to supply a new
	// index pass a string or an array in preferred order.
	index: false,
	// Enable or disable Last-Modified header, defaults to true. Uses the
	// file system's last modified value.
	lastModified: true,
	// Provide a max-age in milliseconds for http caching, defaults to 0.
	// This can also be a string accepted by the ms module.
	maxAge: 0,
	// Redirect to trailing "/" when the pathname is a dir. Defaults to true.
	redirect: true,
	// Function to set custom headers on response.
	// Example:
	// function setHeaders(res, path) {
	// 	res.setHeader('Content-Disposition', contentDisposition(path))
	// }
	setHeaders: '%>'
};