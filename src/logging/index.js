var winston = require('winston');
var config = require('../config');

class Logger{

	constructor(){
		this.logger = new (winston.Logger)({
		  transports: [
		    new (winston.transports.Console)({ colorize: true }),
		    new winston.transports.File({ filename: 'juicy-debug.log' })
		  ]
		});
	}
	
	log(level, message){
		if(!config.getConfig().debug){
			return;
		}
		if(level == 'info')
			this.logger.info(message);
		if(level == 'error')
			this.logger.error(message);
		if(level == 'debug')
			this.logger.debug(message);
		if(level == 'warn')
			this.logger.warn(message);

	}

}

module.exports = new Logger();