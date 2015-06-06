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

var authRouter = require('./routes/auth')(router);
var adminRouter = require('./routes/admin')(router);
var calculateRouter = require('./routes/calculate')(router);
var kerentananRouter = require('./routes/kerentanan')(router);
var modelPerhitunganRouter = require('./routes/model_perhitungan')(router);
var dataEksternalRouter = require('./routes/data_hitung_eksternal')(router);

app.use('/api', authRouter);
app.use('/api', adminRouter);
app.use('/api', calculateRouter);
app.use('/api', kerentananRouter);
app.use('/api', modelPerhitunganRouter);
app.use('/api', dataEksternalRouter);


var sqlite3 = require('sqlite3').verbose();
//var db = new sqlite3.Database(':memory:');
// var db = new sqlite3.Database('sync.db');
// var column = ["create table if not exists transactions(", 
//     "buyId text, sellId text, buyDate date, sellDate date, productId text,",
//     "productName text, buyPrice number, sellPrice number)"].join(" ");
// db.run(column);
// db.close();

// db.serialize(function() {
//     db.run("CREATE TABLE lorem (info TEXT)");

//     var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
//     for (var i = 0; i < 10; i++) {
//         stmt.run("Ipsum " + i);
//     }
//     stmt.finalize();

//     db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
//         console.log(row.id + ": " + row.info);
//     });
// });



server.listen(config.port);

console.log(config.appName + ' jalan pada port ' + config.port);
