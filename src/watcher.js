var chokidar = require('chokidar');
var sass = require('node-sass');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var winston = require('winston');

module.exports = function(config, refreshFunction) {
	var options = {
		ignoreInitial: true,
		usePolling: false
	};
	options = _.extend(options, config.watcher);
	var watcher = chokidar.watch(config.root, options);

	var change = function(file) {
		var shortPath = file.substring(root.length);

		if(shortPath.substring(0, 8) == '/public/') return;

		var ext = path.extname(shortPath);
		if((shortPath.substring(0, 6) == '/sass/' || shortPath.substring(0, 6) == '/scss/') && (ext == '.scss' || ext == '.sass')) {
			var outFile = path.join(root, 'public', 'css', shortPath.substring(6, shortPath.length-5)+'.css');
			sass.render({
				file: file,
				success: function(css) {
					mkdirp(path.dirname(outFile), function(err) {
						if(err) return console.log(err);

						fs.writeFile(outFile, css, function (err) {
							if(err) console.log(err);
							console.log('Wrote sass file: '+outFile);
						});
					});
				},
				error: function(error) {
					console.log(error);
				}
			});
		}
		else {
			winston.info('File changed', shortPath);
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