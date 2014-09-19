module.exports = {
	// Compiled functions are cached, requires filename
	cache: false,
	// Used by cache to key caches
	filename: null,
	// Function execution context
	scope: null,
	// Output generated function body
	debug: null,
	// When false no debug instrumentation is compiled
	compileDebug: null,
	// Returns standalone compiled function
	client: null,
	// Open tag, defaulting to "<%"
	open: '<%',
	// Closing tag, defaulting to "%>"
	close: '%>'
};