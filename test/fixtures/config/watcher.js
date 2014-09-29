module.exports = {
	// (regexp or function) files to be ignored. Tested against the whole path
	ignored: /\.tmp/,
	// Indicates whether the process should continue to run as long as files are being watched.
	persistent: false,
	// Indicates whether to watch files that don't have read permissions.
	ignorePermissionErrors: false,
	// Indicates whether chokidar should ignore the initial add events or not.
	ignoreInitial: true,
	// Interval of file system polling.
	interval: 100,
	// Interval of file system polling for binary files.
	binaryInterval: 300,
	// Whether to use fs.watchFile (backed by polling), or fs.watch. If polling leads to high CPU utilization, consider setting this to false.
	usePolling: false
};