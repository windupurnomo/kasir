var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var bodyParser = require('body-parser');
var config = require('./config');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    res.setHeader('Access-Control-Expose-Headers', 'token, totalItem');
    next();
});

var router = express.Router();

router.use(function(req, res, next) {
    console.log(req.method, req.url);
    next();
});

app.use(express.static(__dirname + '/client'));
app.get('/', function(req, res) {
    res.render('index.html');
});

var adminRouter = require('./routes/admin')(router);

app.use('/api', adminRouter);


var sqlite3 = require('sqlite3').verbose();

server.listen(config.port);

console.log(config.appName + ' jalan pada port ' + config.port);
