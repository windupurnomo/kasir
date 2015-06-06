var pg = require('pg');
var async = require('async');
var config = require('../config');
var helper = require('./helper');

// Diset dari manager
var parameter = {};

module.exports = function(input, managerCallback) {

    // Set global parameter
    parameter = input.parameter;
    
    var nKomp = input.indikator.komponen.length;
    if(nKomp === 0) {managerCallback(new Error("Tidak ada komponen pada indikator ini"), null); return;}

    var isOrdinal = (input.indikator.komponen[0].tipe === 'ordinal');

    // Inject sumber indikator ke komponen
    for(var i = 0; i < nKomp; i++) {
        input.indikator.komponen[i]['sumber'] = input.indikator.sumber;
    }
    
    // Loop all komponen
    async.map(input.indikator.komponen, hitungKomponenTabel, function(err, results) {
        hitungIndikator(isOrdinal, results, function(hasilIndikator){
            managerCallback(err, {indeks: input.tipe, indikator: input.indikator, nilai: hasilIndikator});
        });
    });
};

function hitungKomponenTabel(komponen, callback) {
        
        if(komponen.tipe === 'numerik') {
            // Kalau skala komponen sama, sekali kueri aja
            if(komponen.formula.skala1 === komponen.formula.skala2) {
                var tabel = helper.getTabelHitung(komponen.sumber, 'numerik', parameter.skala, komponen.formula.skala1);
                var kolom1 = komponen.formula.data1.join(' + ') + " AS data1 ";
                var kolom2 = (komponen.formula.data2.length > 0) ? ", " + komponen.formula.data2.join(' + ') + " AS data2 ": ""; 
                var q = "SELECT " + helper.getDistinctOn(parameter.skala) + kolom1 + kolom2 + " FROM " + tabel
                       + helper.getWhere(parameter.lingkup, parameter.idLingkup) 
                       + helper.getOrderBy(parameter.skala);
                // console.log("[QUERY] " + q);                
                
                var client = new pg.Client(config.db);                                  
                client.connect(function(err) {
                    client.query(q, function(err, qres){ 
                        if (err) return callback(err, null);
                        var res = [];
                        var n = qres.rows.length;
                        res.length = n;
                        for(var i = 0; i < n; i++) {
                            if(komponen.formula.data2.length <= 0) { // Tanpa pembagi
                                res[i] = komponen.bobot * qres.rows[i].data1;
                            } else {
                                if(qres.rows[i].data2 === 0) { // Ada pembagi tapi nol
                                    res[i] = 0;
                                } else {
                                    res[i] = komponen.bobot * qres.rows[i].data1 / qres.rows[i].data2;
                                }
                            }
                        }
                        callback(null, res);                        
                        client.end();
                    });
                });                 
            } else {
            
                // Perlu dua kali kueri
                var tabel1 = helper.getTabelHitung(komponen.sumber, 'numerik', parameter.skala, komponen.formula.skala1);
                var kolom1 = komponen.formula.data1.join(' + ');
                var q1 = "SELECT " + helper.getDistinctOn(parameter.skala) + kolom1 + " AS data1 FROM " + tabel1 
                       + helper.getWhere(parameter.lingkup, parameter.idLingkup) 
                       + helper.getOrderBy(parameter.skala);
                // console.log("[QUERY] " + q1);

                var tabel2 = helper.getTabelHitung(komponen.sumber, 'numerik', parameter.skala, komponen.formula.skala2);
                var kolom2 = (komponen.formula.data2.length > 0) ? komponen.formula.data2.join(' + ') : "1"; // Kalau tidak ada pembaginya maka pembaginya satu
                var q2 = "SELECT " + helper.getDistinctOn(parameter.skala) + kolom2 + " AS data2 FROM " + tabel2 
                       + helper.getWhere(parameter.lingkup, parameter.idLingkup) 
                       + helper.getOrderBy(parameter.skala);
                // console.log("[QUERY] " + q2);

                async.parallel([
                    function(callback){                    
                        var client = new pg.Client(config.db);                                  
                        client.connect(function(err) {
                            client.query(q1, function(err, qres){                    
                                if (err) return callback(err);
                                var res = [];
                                var n = qres.rows.length;
                                res.length = n;
                                for(var i = 0; i < n; i++)
                                    res[i] = qres.rows[i].data1;
                                callback(null, res);   
                                client.end();
                            });
                        });
                    },
                    function(callback){
                        var client = new pg.Client(config.db);                                  
                        client.connect(function(err) {
                            client.query(q2, function(err, qres){                    
                                if (err) return callback(err);
                                var res = [];
                                var n = qres.rows.length;
                                res.length = n;
                                for(var i = 0; i < n; i++)
                                    res[i] = qres.rows[i].data2;
                                callback(null, res);   
                                client.end();
                            });
                        });
                    }                
                ], function(err, results){
                    if (err) return callback(err, null);

                    // Pembagian ada di sini
                    var data1 = results[0];
                    var data2 = results[1];
                    var result = [];
                    var n = data1.length;
                    result.length = n;

                    for(var i = 0; i < n; i++){
                        if(data2[i] === 0) { // Kalau pembaginya nol, nolkan saja
                            result[i] = 0;
                        } else {
                            result[i] = komponen.bobot * data1[i] / data2[i];   // Langsung dikali bobot komponen
                        }
                    }                

                    callback(err, result);
                });
            }
            
        } else if(komponen.tipe === 'ordinal') {
            var tabel = helper.getTabelHitung(komponen.sumber, 'ordinal', parameter.skala);
            var q = "SELECT " + helper.getDistinctOn(parameter.skala) + komponen.formula.kolom + " AS data FROM " + tabel 
                  + helper.getWhere(parameter.lingkup, parameter.idLingkup) 
                  + helper.getOrderBy(parameter.skala);
            // console.log("[QUERY] " + q);

            var client = new pg.Client(config.db);                                  
            client.connect(function(err) {
                client.query(q, function(err, qres){ 
                    if (err) return callback(err, null);
                    var res = [];
                    var n = qres.rows.length;
                    res.length = n;
                    for(var i = 0; i < n; i++) {
                        if(qres.rows[i].data in komponen.formula.nilai) {
                            res[i] = komponen.bobot * komponen.formula.nilai[qres.rows[i].data];
                        } else {
                            res[i] = komponen.bobot * komponen.formula.nilai['default'];
                        }
                    }
                    callback(null, res);                        
                    client.end();
                });
            });            
        }
        
}

function hitungIndikator(isOrdinal, hasilKomponen, callback) {
    var sumKomponen = [];
    var nKomp = hasilKomponen.length;
    if(nKomp === 1) sumKomponen = hasilKomponen[0];
    else {
        var nData = hasilKomponen[0].length;
        sumKomponen.length = nData;
        for(var i = 0; i < nData; i++) {
            var sum = 0;
            for(var j = 0; j < nKomp; j++) {
                sum += hasilKomponen[j][i];
            }
            sumKomponen[i] = sum;
        }
    }     
    
    // Ordinal tidak dinormalisasi
    if(isOrdinal) {
        callback(sumKomponen);
    } else {
        callback(helper.normalisasi(sumKomponen));
    }
    
}

