var pg = require('pg');
var helper = require('./helper');
var config = require('../config');
var async = require('async');

var o = {
    
    tabelPodes: "podes_2011",
    
    agregat: function (skala, tipe, callback){
        
        var joinColumn;
        if(skala === 'kecamatan') joinColumn = 'kode_kec';
        else if(skala === 'kabupaten') joinColumn = 'kode_kab';
        else if(skala === 'provinsi') joinColumn = 'kode_prov';
        else {callback(new Error("Skala invalid"));return;}

        var aggFunc;
        if(tipe === 'numerik') aggFunc = 'sum';
        else if(tipe === 'ordinal') aggFunc = 'median';
        else {callback(new Error("Tipe data invalid"));return;}
                
        var setup = "drop table if exists " + o.tabelPodes + "_" + skala + "_" + tipe + "; "
                  + "create table " + o.tabelPodes + "_" + skala + "_" + tipe + " (like " + o.tabelPodes + " including indexes);";
        
        console.log("[INFO] Membuat tabel agregat (" + o.tabelPodes + "_" + skala + "_" + tipe + ")...");
        var start = process.hrtime();
        
        pg.connect(config.db, function(err, client, done) {
            if (err) {return callback(err);}
            client.query(setup, [], function (err){        
                if (err) {return callback(err);}
        
                o.generateColumnAggFunc(aggFunc, function (aggCol){
                    o.generateColumn('agg.', '', function (col) {

                        var subSelect = "select " + joinColumn + ", " + aggCol + " from " + o.tabelPodes + " group by " + joinColumn;
                        var select = "select tbl.kode_prov, tbl.kode_kab, tbl.kode_kec, tbl.kode_desa, " 
                                + col 
                                + " from " + o.tabelPodes + " tbl join (" + subSelect + ") agg " 
                                + "on tbl." + joinColumn + " = agg." + joinColumn + " order by tbl.kode_desa";
                        var insert = "insert into " + o.tabelPodes + "_" + skala + "_" + tipe + " " + select;

                        console.log("[INFO] Mengisi data tabel agregat...");
                        
                        client.query(insert, [], function (err, result){
                            if (err){
                                console.log(err);
                                callback(err, null);
                                return;
                            }
                            
                            var elapsed = process.hrtime(start)[1] / 1000000;
                            
                            console.log("[INFO] Selesai [" + elapsed + "ms].");
                            callback(err, result);
                            client.end();
                        });
                    });
                });
            });
        });
    },

    generateColumn: function (prefix, suffix, callback){
        pg.connect(config.db, function(err, client, done) {
            var x = ["kode_prov", "kode_kab", "kode_kec", "kode_desa"];
            var q = "select * from " + o.tabelPodes + " limit 1";
            client.query(q, [], function (err, result){
                done();
                var columns = [];
                result.fields.forEach(function(field){
                    if (x.indexOf(field.name) ===  -1)
                        columns.push(prefix + field.name + suffix);
                });
                callback(columns.join(', '));
                client.end();
            });
        });
    },

    generateColumnAggFunc: function (func, callback){
        pg.connect(config.db, function(err, client, done) {
            var x = ["kode_prov", "kode_kab", "kode_kec", "kode_desa"];
            var q = "select * from " + o.tabelPodes + " limit 1";
            client.query(q, [], function (err, result){
                done();
                var columns = [];
                result.fields.forEach(function(field){
                    if (x.indexOf(field.name) ===  -1)
                        columns.push(func + "(" + field.name + ") as " + field.name);
                });
                callback(columns.join(', '));
                client.end();
            });
        });
    }
};

module.exports = o;

// Testing command-line
if(require.main === module) {    
    
    o.agregat('kecamatan', 'numerik', function(e,r){
        o.agregat('kecamatan', 'ordinal', function(e,r){
            o.agregat('kabupaten', 'numerik', function(e,r){
                o.agregat('kabupaten', 'ordinal', function(e,r){
                    o.agregat('provinsi', 'numerik', function(e,r){
                        o.agregat('provinsi', 'ordinal', function(e,r){
                            console.log("ALL DONE!");
                        });
                    });
                });
            });
        });        
    });
    
}