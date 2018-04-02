var Juicy = require('./main');
var Config = require('./config');
var logger = require('./logging');

class JuicyInterface{
	constructor(){
		this.juicy = new Juicy();
	}

	getJuicy(config){
		Config.setConfig(config);
		if(Config.getConfig().debug){
			logger.log('info','DEBUG MODE');
		}
		return this.juicy;
	}

}

module.exports = new JuicyInterface();