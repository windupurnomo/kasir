var u = require('underscore');
var sqlite3 = require('sqlite3').verbose();
var helper = require('./helper');
var config = require('../config');
var db1 = new sqlite3.Database('../oldkasir.cdb');
var db2 = new sqlite3.Database('sync.db');


var a = {
    sync: function(req, res) {
        //get maksimum id transaction sync idMax
        var idMax = 0;
        db2.run('delete from transactions');
        db2.run('vacuum');
        db1.all("SELECT * FROM cash where category = 'Shop' order by id asc", function(err, rows) {
            var transactions = [];
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                for (var j = 0; j < row.quantity; j++) {
                    var o = {
                        $buyId: row.id,
                        $sellId: -1,
                        $buyDate: row.moment,
                        $productId: row.code,
                        $productName: row.description,
                        $buyPrice: row.price,
                        $sellPrice: 0
                    };
                    transactions.push(o);
                };
            }

            db1.all("SELECT * FROM cash where category = 'Sale' order by id asc", function(err, rows) {
                var result = [];
                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    for (var j = 0; j < row.quantity; j++) {
                        var x = u.where(transactions, {
                            $productId: row.code,
                            $sellId: -1
                        });
                        if (x.length > 0) {
                            x[0].$sellId = row.id;
                            x[0].$sellDate = row.moment;
                            x[0].$sellPrice = row.price;
                            result.push(x[0]);
                        };
                    };
                };
                //insert data
                var s = ["INSERT INTO transactions (buyId, sellId, buyDate, sellDate, productId, productName, buyPrice, sellPrice)",
                    "VALUES ($buyId, $sellId, $buyDate, $sellDate, $productId, $productName, $buyPrice, $sellPrice)"
                ].join(" ");
                var stmt = db2.prepare(s);
                for (var i = 0; i < result.length; i++) {
                    var o = result[i];
                    stmt.run(result[i]);
                };
                stmt.finalize();
                res.json({
                    message: 'done'
                });
                db2.close();
            });
        });
        db1.close();
    },
    all: function(req, res) {
        db2.all("select * from transactions", function(err, rows) {
            res.json(rows);
        });
    },
    margin: function (req, res){
        var s = req.query.startDate;
        var e = req.query.endDate;
        if (s === undefined || e === undefined){
            var q = "select sum(sellPrice - buyPrice) as margin, sum(sellPrice) as omzet from transactions";
            db2.get(q, [], function (err, rows){
                res.json(rows);
            });
        }else{
            s = "'" + s + "'";
            e = "'" + e + "'";
            var q = "select sum(sellPrice - buyPrice) as value, sum(sellPrice) as omzet from transactions where sellDate between "+s+" and " + e;
            db2.get(q, [], function (err, rows){
                res.json(rows);
            });
        }
    },
    
    topSell: function (req, res){
        var s = req.query.startDate;
        var e = req.query.endDate;
        var n = req.query.top ? req.query.top : 5;
        if (s === undefined || e === undefined ){
            var q = ["select productName as product, count(productName) as value from transactions", 
                    "group by productName order by value desc limit ?"].join(" ");
            db2.all(q, [n], function (err, rows){
                res.json(rows);
            });
        }else{
            s = "'" + s + "'";
            e = "'" + e + "'";
            var q = ["select productName as product, count(productName) as value from transactions where sellDate", 
                    "between " +s+ " and " +e+ " group by productName order by value desc limit ?"].join(" ");
            db2.all(q, [n], function (err, rows){
                res.json(rows);
            });
        }
    },
    topMargin: function (req, res){
        var s = req.query.startDate;
        var e = req.query.endDate;
        var n = req.query.top ? req.query.top : 5;
        if (s === undefined || e === undefined ){
            var q = ["select productName as product, sum(sellPrice) - sum(buyPrice) as value from transactions", 
                    "group by productName order by value desc limit ?"].join(" ");
            db2.all(q, [n], function (err, rows){
                res.json(rows);
            });
        }else{
            s = "'" + s + "'";
            e = "'" + e + "'";
            var q = ["select productName as product, sum(sellPrice) - sum(buyPrice) as value from transactions where sellDate", 
                    "between " +s+ " and " +e+ " group by productName order by value desc limit ?"].join(" ");
            db2.all(q, [n], function (err, rows){
                console.log(err)
                res.json(rows);
            });
        }
    }
}

module.exports = a;
