var winston = require('winston');
module.exports = function() {
	winston.remove(winston.transports.Console);
	winston.add(winston.transports.Console, {level: 'warn'});
};