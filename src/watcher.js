var chokidar = require('chokidar');
var sass = require('node-sass');
var path = require('path');
var fs = require('fs');

module.exports = function(appRoot, refreshFunction) {
	var watcher = chokidar.watch(appRoot, {
		ignoreInitial: true,
		usePolling: false
	});

	var change = function(file) {
		var shortPath = file.substring(appRoot.length);

		if(shortPath.substring(0, 8) == '/public/') return;

		var ext = path.extname(shortPath);
		if(shortPath.substring(0, 6) == '/sass/' && (ext == '.scss' || ext == '.sass')) {
			var outFile = path.join(appRoot, 'public', 'css', path.basename(shortPath, ext)+'.css');
			sass.render({
				file: file,
				success: function(css) {
					fs.writeFile(outFile, css, function (err) {
						if(err) console.log(err);
						console.log('Wrote sass file: '+outFile);
					});
				},
				error: function(error) {
					console.log(error);
				}
			});
		}
		else {
			refreshFunction();
		}
	};

	watcher
		.on('add', change)
		.on('addDir', change)
		.on('change', change)
		.on('unlink', change)
		.on('unlinkDir', change)
		.on('error', function(error) {console.error('Error happened', error);})

};

