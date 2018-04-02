class Config{

	constructor(){
		this.config = {
			debug : false
		};
	}

	setConfig(config){
		if(config==null || config == undefined || config ==='undefined'){
			return;
		}else{
			this.config = config;
		}
		
	}

	getConfig(){
		return this.config;
	}
}

module.exports = new Config();