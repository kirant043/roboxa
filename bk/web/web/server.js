// set up ======================================================================
var express = require('express');
var config = require('config');
var app = express(); // create our app w/ express
if (!config.get('jwtPrivateKey')) {
	console.error('FATAL ERROR: jwtPrivateKey is not defined.');
	process.exit(1);
}

var mongoose = require('mongoose');
var fs = require('fs');
var http = require('http');
var https = require('https');

// mongoose for mongodb
// set the port
var database = require('./config/database'); // load the database config
 
var morgan = require('morgan'); // log requests to the console (express4)
var bodyParser = require('body-parser'); // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)

var options = {
	key: fs.readFileSync('server.key'),
	cert: fs.readFileSync('server.cert'),

};

// configuration ===============================================================
// connect to mongoDB database on modulus.io

app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({
	'extended': 'true'
})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({
	type: 'application/vnd.api+json'
})); // parse application/vnd.api+json as json
app.use(methodOverride());

// routes ======================================================================
require('./app/routes.js')(app);
app.set('port', process.env.PORT || 80); //4063
app.set('host', process.env.HOST || 'https://nsbluescope.roboxatech.com'); //'52.15.38.221'
// listen (start app with node server.js) ======================================
// app.listen(4026, function () {
// 	console.log('Express HTTP server listening on port ' + app.get('host') + ': 4026' );
// });
http.createServer(app).listen(4028, function(){
  console.log('Express server listening on port ' + app.get('host') + ':' + app.get('port'));
});

//https.createServer(options, app).listen(4028, function(){
//  console.log('Express HTTPS server listening on port ' + app.get('host') + ':4028' );
//});
