console.log("This code is designed to present to run on localhost/bluemix/heroku with the relevant hostname:port");
console.log("./routes/server_nodejs/platform.js: to set specific values such as bluemix url etc.");

var host_uri = "localhost"; // 

var express = require('express');
var fs = require('fs'); // for certs
var os = require('os');
var https = require('https');
var http = require('http');
var platform = require('./routes/server_nodejs/platform.js');
var runtime = platform.configure();
var secrets = require('./secrets.js');

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

//console.log(secrets.mongodb.connectionStr());

var menuCollection;
var basketCollection;
var specialsCollection;
var ordersCollection;


var mDB;

mDB = secrets.mongodb.connectionStr();
//mDB = secrets.mongodb.connectionStrLocalhost();

// could move the connect string settings to secrets
var db = MongoClient.connect(mDB, function (err, db) {
    if (err)
        throw err;
    console.log("connected to the mongoDB at: " + runtime.mongodb);

    menuCollection = db.collection('menu'); // creates the collection if it does not exist
    basketCollection = db.collection('basket');
    specialsCollection = db.collection('specials');
    ordersCollection = db.collection('orders');

});

// you can research all the commented out features and 'npm install --save' as required

var compression = require('compression');

var toobusy = require('toobusy-js');

//var path = require('path');
//var logger = require('morgan');
var bodyParser = require('body-parser');


//var bluemix = require("./routes/middlewares/bluemix.js"); // force https

var helmet = require('helmet');

var connectionListener = false;

var app = express();

app.use(compression()); // must be first, GZIP all assets https://www.sitepoint.com/5-easy-performance-tweaks-node-js-express/
// log every request to the console
app.use(bodyParser.urlencoded({
    'extended': 'true'
})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
})); // parse application/vnd.api+json as json

app.use(helmet()); // by default - removes:  ; adds: X-Frame-Options:SAMEORIGIN

// middleware which blocks requests when we're too busy 
app.use(function (req, res, next) { // HAS TO BE FIRST 
    if (toobusy()) {
        res.status(503).send("<p><p>&nbsp&nbsp<h1>The server is busy, please try later, possibly in about 30 seconds.</h1>");
    } else {
        next();
    }
});

console.log(runtime);

if (runtime.isLocalHost) {
    // windows if openssl installed
    // set OPENSSL_CONF=C:\Program Files (x86)\OpenSSL-Win32\bin\openssl.cfg
    // C:\Program Files (x86)\OpenSSL-Win32\bin\openssl genrsa -out test-key.pem 1024

    // test ssl keys with openssl installed - Google for your platform  https://www.openssl.org/
    // openssl genrsa -out test-key.pem 1024 
    // openssl req -new -key test-key.pem -out certrequest.csr
    // openssl x509 -req -in certrequest.csr -signkey test-key.pem -out test-cert.pem	
    console.log("*** Using temp SSL keys on the nodejs server");
    var privateKey = fs.readFileSync('ssl/test-key.pem');
    var certificate = fs.readFileSync('ssl/test-cert.pem');

    //	var credentials = {key: privateKey, cert: certificate};	

    // use local self-signed cert
    var localCertOptions = {
        key: privateKey,
        cert: certificate,
        requestCert: false,
        rejectUnauthorized: false
    };


    https.createServer(localCertOptions, app).listen(runtime.port, function () {
        console.log(new Date().toISOString());
        console.log(runtime.architecture + ' server startup ok on port: ' + runtime.port);

    });


} else { // not local, its in the cloud somewhere bluemix/heroku

    app.set('port', runtime.port);

    if (runtime.architecture === "bluemix") {
        // cloud loads certs and establish secure connection
        app.listen(runtime.port, function () {

            console.log(runtime.architecture + ' server startup ok on port: ' + runtime.port);
        });
    } else
    if (runtime.architecture === "heroku") {
        app.listen(runtime.port, function () {
            console.log(runtime.architecture + ' server startup ok on port: ' + runtime.port);
        });
    }
}

//app.use(logger('dev'));  // log every request to the console   morgan
app.use(bodyParser.json());

app.enable('trust proxy');

app.use(function (req, res, next) { // req.protocol
    if (req.secure) {
        // request was via https, so do no special handling
        next();
    } else {
        // request was via http, so redirect to https
        console.log("redirecting from http to https");
        res.redirect('https://' + req.headers.host + req.url);
    }
});

app.use( // public client pages  THIS FINDS _ngClient/index.html
    "/", //the URL throught which you want to access   static content
    express.static(__dirname + '/_ngClient') //where your static content is located in your filesystem
);
app.use( // alias to third party js code etc
    "/js_thirdparty", //the URL throught which you want to access   content
    express.static(__dirname + '/js_thirdparty')
);

console.log(__dirname + '/_ngClient');

app.all('/*', function (req, res, next) {
    // CORS headers,     the * means any client can consume the service???
    res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    // Set custom headers for CORS;
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token');
    if (req.method == 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});

// middleware is performed before hitting the route handler proper (must pass middleware logic) 
// causes two authenications app.all('/api/v1/admin/*', [require('./middlewares/validateRequest').validateRequest]);
//app.all('/api/v1/*', [require('./routes/middlewares/validateRequest').validateRequest]);


function findMenu(findOptions, cb) {
    menuCollection.find(findOptions).toArray(cb);
}

function getMenu(req, res, findOptions, cb) {
    findMenu(findOptions, function (err, results) {

        if (err) { // throw err;
            console.log("error:");
            console.log(err.message);
            res.status(404);
            res.json({
                "error": err.message
            });
        }
        // console.log(results);		 
        res.status(200);
        res.json(results);
    });
}


function findSpecials(findOptions, cb) {
    specialsCollection.find(findOptions).toArray(cb);
}

function getSpecials(req, res, findOptions, cb) {
    findSpecials(findOptions, function (err, results) {

        if (err) { // throw err;
            console.log("error:");
            console.log(err.message);
            res.status(404);
            res.json({
                "error": err.message
            });
        }
        // console.log(results);		 
        res.status(200);
        res.json(results);
    });
}




function findOrders(findOptions, cb) {
    ordersCollection.find(findOptions).toArray(cb);
}

function getOrders(req, res, findOptions, cb) {
    findOrders(findOptions, function (err, results) {

        if (err) { // throw err;
            console.log("error:");
            console.log(err.message);
            res.status(404);
            res.json({
                "error": err.message
            });
        }
        // console.log(results);		 
        res.status(200);
        res.json(results);
    });
}




function findBasket(findOptions, cb) {
    basketCollection.find(findOptions).toArray(cb);
}

function getBasket(req, res, findOptions, cb) {
    findBasket(findOptions, function (err, results) {

        if (err) { // throw err;
            console.log("error:");
            console.log(err.message);
            res.status(404);
            res.json({
                "error": err.message
            });
        }
        // console.log(results);		 
        res.status(200);
        res.json(results);
    });
}




app.delete('/api/v1/basketitem/:_id', function (req, res) {
    console.log('DELETE /api/v1/basketitem');
    console.log(req.params._id);
    basketCollection.deleteOne({
        _id: ObjectID(req.params._id)
    }, function (err, result) {
        if (err) {
            // throw err;
            console.log("error:");
            console.log(err.message);
            res.status(404);
            res.json({
                "error": err.message
            });
        }

        if (!err)
            console.log("basket item deleted");
        res.status(200);
        console.log(JSON.stringify(result))
        res.json(result);
    });

});



app.put('/api/v1/basketitem', function (req, res) {

    console.log('PUT /api/v1/basketitem');
    console.log(req.body);
var _id = req.body._id;
    delete req.body._id;
    basketCollection.update({
        "_id": ObjectID(_id)
    }
                            )
    basketCollection.insert(req.body, function (err, result) {
        if (err) {
            // throw err;
            console.log("error:");
            console.log(err.message);
            res.status(404);
            res.json({
                "error": err.message
            });
        }

        if (!err)
            console.log("basket item entry saved");
        res.status(200);
        res.json(result);
    });
});


app.put('/api/v1/order', function (req, res) {

    console.log('PUT /api/v1/order');
    console.log(req.body);
var _id = req.body._id;
    delete req.body._id;
      
    
    ordersCollection.update({
        "_id": ObjectID(_id)
    })
    
    ordersCollection.insert(req.body, function (err, result) {
        if (err) {
            // throw err;
            console.log("error:");
            console.log(err.message);
            res.status(404);
            res.json({
                "error": err.message
            });
        }
        

        if (!err)
            console.log("basket item entry saved");
        res.status(200);
        res.json(result);
    });
    
});


app.get('/api/v1/menu', function (req, res) { // allows a browser url call

    console.log('GET /api/v1/menu');

    var findOptions = {};

    getMenu(req, res, findOptions);
});


app.get('/api/v1/basket', function (req, res) { // allows a browser url call

    console.log('GET /api/v1/basket');

    var findOptions = {};
    
    

    getBasket(req, res, findOptions);
});

app.get('/api/v1/orders', function (req, res) { // allows a browser url call

    console.log('GET /api/v1/orders');

    var findOptions = {};

    getOrders(req, res, findOptions);
});

app.get('/api/v1/specials', function (req, res) { // allows a browser url call

    console.log('GET /api/v1/specials');

    var findOptions = {};

    getSpecials(req, res, findOptions);
});

app.post('/api/v1/menu', function (req, res) { // need the post method to pass filters in the body

    console.log('POST /api/v1/menu');

    var findOptions = {};
    
    // these checks could be normalised to a function
    if (req.body.name) {
        findOptions.name = {
            $eq: req.body.name
        };
    }
    if (req.body.price) {
        findOptions.price = {
            $eq: parseInt(req.body.price)
        };
    }
     if (req.body.catagory) {
        findOptions.catagory = {
            $eq: req.body.catagory
        };
    }

    console.log(findOptions)
    getMenu(req, res, findOptions);
});




app.post('/api/v1/basket', function (req, res) { // need the post method to pass filters in the body

    console.log('POST /api/v1/basket');

    var findOptions = {};

    // these checks could be normalised to a function
    if (req.body.name) {
        findOptions.name = {
            $eq: req.body.name
        };
    }
    if (req.body.price) {
        findOptions.price = {
            $eq: parseInt(req.body.price)
        };
    }
     if (req.body.catagory) {
        findOptions.catagory = {
            $eq: req.body.catagory
        };
    }


    console.log(findOptions)
    getBasket(req, res, findOptions);
});



app.post('/api/v1/orders', function (req, res) { // need the post method to pass filters in the body

    console.log('POST /api/v1/orders');

    var findOptions = {};

    // these checks could be normalised to a function
    /*if (req.body.name) {
        findOptions.name = {
            $eq: req.body.name
        };
    }
    if (req.body.price) {
        findOptions.price = {
            $eq: parseInt(req.body.price)
        };
    }
     if (req.body.catagory) {
        findOptions.catagory = {
            $eq: req.body.catagory
        };
    }*/
    if (req.body.subtotal) {
        findOptions.subtotal = {
            $eq: req.body.subtotal
        };
    }


    console.log(findOptions)
    getOrders(req, res, findOptions);
});








app.post('/api/v1/specials', function (req, res) { // need the post method to pass filters in the body

    console.log('POST /api/v1/specials');

    var findOptions = {};

    // these checks could be normalised to a function
    if (req.body.day) {
        findOptions.day = {
            $eq: req.body.day
        };
    }
    if (req.body.name) {
        findOptions.name = {
            $eq: req.body.name
        };
    }
    if (req.body.price) {
        findOptions.price = {
            $eq: parseInt(req.body.price)
        };
    }
     if (req.body.catagory) {
        findOptions.catagory = {
            $eq: req.body.catagory
        };
    }

    console.log(findOptions)
    getSpecials(req, res, findOptions);
});







app.post('/api/v1/loadmenu', function (req, res) { // API restful semantic issues 

    console.log('POST /api/v1/loadmenu');

    var fooditems = [
        {
            "catagory": "Chips",
            "name": "Small",
            "price": 2.50
		},
        {
            "catagory": "Chips",
            "name": "Large",
            "price": 3.00
		},
        {
            "catagory": "Chips",
            "name": "Family Box",
            "price": 7.00
		},
        {
            "catagory": "Sausages",
            "name": "Plain",
            "price": 0.50
		},
        {
            "catagory": "Sausages",
            "name": "Large",
            "price": 1.00
		},
        {
            "catagory": "Sausages",
            "name": "Battered",
            "price": 1.50
		},
        {
            "catagory": "Burgers",
            "name": "Plain Burger",
            "price": 2.50
		},
        {
            "catagory": "Burgers",
            "name": "Cheese Burger",
            "price": 3.00
		},
        {
            "catagory": "Burgers",
            "name": "Double Cheese Burger",
            "price": 3.50
		},
        {
            "catagory": "Burgers",
            "name": "1/4 Pounder",
            "price": 4.00
		},
        {
            "catagory": "Burgers",
            "name": "1/4 Pounder with Chesse",
            "price": 4.50
		},
        {
            "catagory": "Chicken",
            "name": "Chicken Piece",
            "price": 2.00
		},
        {
            "catagory": "Chicken",
            "name": "6 Nuggets",
            "price": 3.00
		},
        {
            "catagory": "Chicken",
            "name": "8 Nuggets",
            "price": 3.50
		},
        {
            "catagory": "Chicken",
            "name": "10 Nuggets",
            "price": 4.00
		},
        {
            "catagory": "Chicken",
            "name": "Chicken Fillet Burger",
            "price": 4.00
		},
        {
            "catagory": "Chicken",
            "name": "Snack Box",
            "price": 6.00
		},
        {
            "catagory": "Fish",
            "name": "Cod",
            "price": 3.00
		},
        {
            "catagory": "Fish",
            "name": "Haddock",
            "price": 3.50
		},
        {
            "catagory": "Fish",
            "name": "Plaice",
            "price": 4.00
		},
         {
            "catagory": "Fish",
            "name": "Fish Box (Plaice)",
            "price": 7.00
		}
	];


    var errorFlag = false; // can use for feedback
    var insertCount = 0;

    fooditems.forEach(function (arrayItem) {
        menuCollection.insert(arrayItem, function (err, result) {
            if (err) {
                errorFlag = true;
            }
            insertCount++;
        });
    });
    var result = {
        'errorFlag': errorFlag,
        'insertCount': insertCount
    };
    console.log(result)
    res.status(200);
    res.json(result);

});




//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaa
app.post('/api/v1/loadbasket', function (req, res) { // API restful semantic issues 

    console.log('POST /api/v1/loadbasket');

    var basketitems = [];


    var errorFlag = false; // can use for feedback
    var insertCount = 0;

    basketitems.forEach(function (arrayItem) {
        basketCollection.insert(arrayItem, function (err, result) {
            if (err) {
                errorFlag = true;
            }
            insertCount++;
        });
    });
    var result = {
        'errorFlag': errorFlag,
        'insertCount': insertCount
    };
    console.log(result)
    res.status(200);
    res.json(result);

});





app.post('/api/v1/loadorders', function (req, res) { // API restful semantic issues 

    console.log('POST /api/v1/loadorders');

    var order = [];


    var errorFlag = false; // can use for feedback
    var insertCount = 0;

        order.forEach(function (arrayItem) {
        ordersCollection.insert(arrayItem, function (err, result) {
            if (err) {
                errorFlag = true;
            }
            insertCount++;
        });
    });
    var result = {
        'errorFlag': errorFlag,
        'insertCount': insertCount
    };
    console.log(result)
    res.status(200);
    res.json(result);

});

//BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB
app.post('/api/v1/loadspecials', function (req, res) { // API restful semantic issues 

    console.log('POST /api/v1/loadspecials');

    var special = [{
            "day": "Monday",
            "catagory": "Specials",
            "name": "TBA",
            "price": 2
		},
        {
            "day": "Tuesday",
            "catagory": "Specials",
            "name": "TBA",
            "price": 3
		},
        {
            "day": "Wednesday",
            "catagory": "Specials",
            "name": "TBA",
            "price": 4
		},
        {
            "day": "Thursday",
            "catagory": "Specials",
            "name": "TBA",
            "price": 4
		},
        {
            "day": "Friday",
            "catagory": "Specials",
            "name": "TBA",
            "price": 3
		},
        {
            "day": "Saturday",
            "catagory": "Specials",
            "name": "TBA",
            "price": 3
		},
         {
            "day": "Sunday",
            "catagory": "Specials",
            "name": "TBA",
            "price": 3
		}];


    var errorFlag = false; // can use for feedback
    var insertCount = 0;

    special.forEach(function (arrayItem) {
        specialsCollection.insert(arrayItem, function (err, result) {
            if (err) {
                errorFlag = true;
            }
            insertCount++;
        });
    });
    var result = {
        'errorFlag': errorFlag,
        'insertCount': insertCount
    };
    console.log(result)
    res.status(200);
    res.json(result);

});




app.delete('/api/v1/deletemenu', function (req, res) {
    console.log('DELETE /api/v1/loadmenu');
    var errorFlag = false; // can use for feedback
    try {
        menuCollection.deleteMany({}, function (err, result) {
            var resJSON = JSON.stringify(result);
            console.log(resJSON);
            console.log(result.result.n);
            res.status(200);
            res.json(resJSON);
        });
    } catch (e) {
        console.log(e);
        res.status(404);
        res.json({});
    }
});

app.delete('/api/v1/deletebasket', function (req, res) {
    console.log('DELETE /api/v1/loadbasket');
    var errorFlag = false; // can use for feedback
    try {
        basketCollection.deleteMany({}, function (err, result) {
            var resJSON = JSON.stringify(result);
            console.log(resJSON);
            console.log(result.result.n);
            res.status(200);
            res.json(resJSON);
        });
    } catch (e) {
        console.log(e);
        res.status(404);
        res.json({});
    }
});

// all the server rest type route paths are mapped in index.js
// app.use('/', require('./routes')); // will load/use index.js by default from this folder

// If no route is matched by now, it must be a 404
app.use(function (req, res, next) {
    console.log("Oops 404");

    var err = new Error('Route Not Found, are you using the correct http verb / is it defined?');
    err.status = 404;

    next(err);
});
