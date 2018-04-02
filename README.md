# Juicy

Juicy is a simple Inversion of Control Library for javascript. Available for both browsers and commonJS module specifications like nodeJS

### Prerequisites | Using in Browsers

install browserify, you can install locally as well, but you will have to change the package.json

```
npm install -g browserify

npm run build-dist
```

### Getting Started

Using Juicy in Browser

```
    var juicy = Juicy.getJuicy({debug:false});

    var userModel = function(name, position, confidence){
        this.name = name;
        this.position = position;
        this.confidence = confidence;
    }



    juicy.configureSingleton('userModel', userModel);

    var  q = {
        userModel: undefined
    }


    juicy.configureBean('q',q);
    juicy.attachBean('userModel','q','userModel');
    console.log(juicy.getObject('q').userModel);
            
```


And in NodeJS

```
    var juicyImpl = require('./src');

    var Juicy = juicyImpl.getJuicy({debug:false});
    
    class userModel{
        constructor(name, position, confidence){
            this.name = name;
            this.position = position;
            this.confidence = confidence;
        }
    }

    Juicy.configureSingleton('userModel', userModel);
    
    class q{
        constructor(){
            this.userModel = undefined;
        }
    }

    Juicy.configureClass('q',q);
    Juicy.attachBean('userModel','q','userModel');

    console.log(Juicy.getObject('q').userModel);

```
### Authors

* **Shashwat Tiwari** - *Initial work* - [shashwatsai](http://shashwatsai.me)


## License

This project is licensed under the ISC

## Acknowledgments

* [Dijon](https://github.com/creynders/dijon)


