
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
//var user = require('./routes/user');
var http = require('http');
var path = require('path');

var Eve = require('../eve.js');

var app = express();

var port = process.env.PORT || 3000;

// all environments
app.set('port', port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
// app.use(express.bodyParser()); //dont really seem to need this?
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

console.log(path.join(__dirname, 'public'));

// 
var eveOptions = {
	services: { topics: {}, p2p: {transports: {localTransport: {}, httpRequest: {port: port} } } }, // httpRequest 
	agents: {Remco: {filename: "workerAgent.js", options: {port: port} }, Giovanni: {filename: "workerAgent.js", options: {port: port} }, Peet: {filename: "managerAgent.js", options: {port: port} } }
} 
var eve = new Eve(eveOptions);



// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// TODO: is this actually the best way to do this?
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With,  Content-Type");
  next();
});



app.get('/', routes.index);
app.get('/management', routes.management);
app.get('/gui/*', routes.gui);
app.post('/agents/*', eve.incomingFromExpress);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
