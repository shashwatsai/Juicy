var logger = require('../logging');

class Juicy{

	constructor(){
		/**@private*/
		this._mappings = {};
		/**@private*/
		this._outlets = {};
		/**@private*/
		this._handlers = {};


		this.strictInjections = true;
		this.autoMapOutlets = true;
		this.postInjectionHook = "setup";
		this.NO_MAPPING_FOUND = 'no mapping found for this key';
	}

    _createAndSetupInstance( key,Klass ){
        var instance = new Klass();
        this.injectInto( instance, key );
        return instance;
    }

    _retrieveFromCacheOrCreate( key,overrideRules ){
        if( typeof overrideRules === 'undefined' ){
            overrideRules = false;
        }
        var output;
        if( this._mappings.hasOwnProperty( key ) ){
            var config = this._mappings[ key ];
            if( !overrideRules && config.isSingleton ){
                if( config.object === null ){
                    config.object = this._createAndSetupInstance( key, config.klass );
                }
                output = config.object;
            }else{
                if( config.klass){
                    output = this._createAndSetupInstance( key, config.klass );
                }else{
                    //TODO shouldn't this be null
                    output = config.object;
                }
            }
        }else{
            throw this.NO_MAPPING_FOUND;
        }
        return output;
    }

	configureBean(key, userKlass){
		this._mappings[key] = {
			klass       : null,
			isSingleton : true,
			object      : userKlass
		};

		if(this.autoMapOutlets == true){
			this.attachBean(key);
		}
        if( this.hasMapping( key ) ){
            this.injectInto( userKlass, key );
        }
        return this;
	}

	attachBean(sourceKey, targetKey, propertyToResolve){
		targetKey = targetKey || "global";
		propertyToResolve = propertyToResolve || sourceKey;

		if(!this._outlets.hasOwnProperty(targetKey)){
			this._outlets[targetKey] = {};
		}

		this._outlets[targetKey][propertyToResolve] = sourceKey;

		return this;
	}

	hasMapping(key){
		return this._mappings.hasOwnProperty(key);
	}

	configureClass(key, userKlass){
		this._mappings[key] ={
			klass       : userKlass,
			object      : null,
			isSingleton : false
		};

		if(this.autoMapOutlets){
			this.attachBean(key);
		}

		return this;
	}

	configureSingleton(key, userKlass){
		logger.log('info','Creating Singleton Instance for class:'+userKlass);
        this._mappings[ key ] = {
            klass       : userKlass,
            object      : null,
            isSingleton : true
        };

        if( this.autoMapOutlets ){
        	logger.log('info','autoMapOutlets is:'+this.autoMapOutlets + ', we will attach beans for key:' + key);
            this.attachBean( key );
        }
        return this;
	}

	instantiate(key){
		return this._retrieveFromCacheOrCreate( key, true );
	}

    injectInto( instance,key ){
        if( ( typeof instance === 'object' ) ){
            var o = [];
            if( this._outlets.hasOwnProperty( 'global' ) ){
                o.push( this._outlets[ 'global' ] );
            }
            if( typeof key !== 'undefined' && this._outlets.hasOwnProperty( key ) ){
                o.push( this._outlets[ key ] );
            }
            for( var i in o ){
                var l = o [ i ];
                for( var outlet in l ){
                    var source = l[ outlet ];
                    //must be "in" [!]
                    if( !this.strictInjections || outlet in instance ){
                        instance[ outlet ] = this.getObject( source );
                    }
                }
            }
            if( this.postInjectionHook in instance ){
                instance[ this.postInjectionHook ].call( instance );
            }
        }
        return this;
    }

    getObject( key ){
        return this._retrieveFromCacheOrCreate( key );
    }

    detachBean( target,outlet ){
        delete this._outlets[ target ][ outlet ];

        return this;
    }

    unmap( key ){
        delete this._mappings[ key ];

        return this;
    }

    mapHandler( eventName,key,handler,oneShot,passEvent ){
        key = key || 'global';
        handler = handler || eventName;

        if( typeof oneShot === 'undefined' ){
            oneShot = false;
        }
        if( typeof passEvent === 'undefined' ){
            passEvent = false;
        }
        if( !this._handlers.hasOwnProperty( eventName ) ){
            this._handlers[ eventName ] = { };
        }
        if( !this._handlers[eventName].hasOwnProperty( key ) ){
            this._handlers[eventName][key] = [];
        }
        this._handlers[ eventName ][ key ].push( {
            handler   : handler,
            oneShot   : oneShot,
            passEvent : passEvent
        } );

        return this;
    }

    unmapHandler( eventName,key,handler ){
        key = key || 'global';
        handler = handler || eventName;

        if( this._handlers.hasOwnProperty( eventName ) && this._handlers[ eventName ].hasOwnProperty( key ) ){
            var handlers = this._handlers[ eventName ][ key ];
            for( var i in handlers ){
                var config = handlers[ i ];
                if( config.handler === handler ){
                    handlers.splice( i, 1 );
                    break;
                }
            }
        }
        return this;
    }


    notify( eventName ){
        var argsWithEvent = Array.prototype.slice.call( arguments );
        var argsClean = argsWithEvent.slice( 1 );
        if( this._handlers.hasOwnProperty( eventName ) ){
            var handlers = this._handlers[ eventName ];
            for( var key in handlers ){
                var configs = handlers[ key ];
                var instance;
                if( key !== 'global' ){
                    instance = this.getObject( key );
                }
                var toBeDeleted = [];
                var i, n;
                for( i = 0, n = configs.length; i < n; i++ ){
                    var handler;
                    var config = configs[ i ];
                    if( instance && typeof config.handler === "string" ){
                        handler = instance[ config.handler ];
                    }else{
                        handler = config.handler;
                    }

                    //see deletion below
                    if( config.oneShot ){
                        toBeDeleted.unshift( i );
                    }

                    if( config.passEvent ){
                        handler.apply( instance, argsWithEvent );
                    }else{
                        handler.apply( instance, argsClean );
                    }
                }

                //items should be deleted in reverse order
                //either use push above and decrement here
                //or use unshift above and increment here
                for( i = 0, n = toBeDeleted.length; i < n; i++ ){
                    configs.splice( toBeDeleted[ i ], 1 );
                }
            }
        }

        return this;
    }

}

module.exports = Juicy;