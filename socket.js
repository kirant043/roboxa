
var request = require("request");
var FCM = require("fcm-node");
var main = require('./server')
const socket = require("socket.io");
const io = socket(main.server);

//var httpServer = http.createServer(app);
//io.attach(httpServer);

//httpServer.listen(app.get("http_port"), function () {
//  console.log("httpServer listening on port %d", app.get("http_port"));
  // ee.emit('ready', 'httpServerReady');
//});

// server.listen(serverPort, function() {
//   console.log('server up and running at %s port', serverPort);
// });


// var app = require('http').createServer(handler),
//     io = require('socket.io').listen(app),
//     fs = require('fs')



// var globalapiurl = 'http://192.168.143.155:3059' //'http://52.15.38.221:4063'


console.log(io)


