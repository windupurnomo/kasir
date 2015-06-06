var mongoose = require('mongoose');
var helper = require('./helper');
var config = require('../config');
var pg = require('pg');
var mongo = require('../models/model_perhitungan');

var workerFarm = require('worker-farm');

var parameter = {};

function cekParameter(param) {
    if(param.hasOwnProperty("idPerhitungan") 
        && param.hasOwnProperty("idModel") 
        && param.hasOwnProperty("skala")
        && param.hasOwnProperty("lingkup")
        && param.hasOwnProperty("idLingkup")) {
        return true;
    } else {
        return false;
    }
}

module.exports = {

    runPerhitungan: function(param, callback) {
        
        if(!cekParameter(param)) {
            callback(new Error("Parameter perhitungan tidak sesuai ketentuan!"), null); 
            return;
        }
        
        // Set global
        parameter = param;
        var hasilHitungKomponen = [];
        
        mongo.ModelPerhitungan.findOne({id:parameter.idModel}).exec(function(err, model){
            
            if(err) {
                callback(err, null); 
                return;
            }
            if(!model) {
                callback(new Error("Rumus dengan id " + parameter.idModel + " tidak ditemukan"), null); 
                return;
            }
            
            console.log("[INFO] Perhitungan #" + parameter.idPerhitungan + " started at " + new Date());
            
            var indikatorIKA = model.indikator_ika;
            var indikatorIKS = model.indikator_iks;

            var n = indikatorIKA.length + indikatorIKS.length;
            var ret = 0;
            
            var workerHitungKomponen = workerFarm(require.resolve('./worker_hitung_komponen'));
            
            for(var i = 0; i < indikatorIKA.length; i++) {
                var ia = indikatorIKA[i];

                workerHitungKomponen({num: i, indikator: ia, tipe: 'ika', parameter: parameter}, function (err, output) {        
                    hasilHitungKomponen.push(output);

                    if (++ret === n) {
                        workerFarm.end(workerHitungKomponen);
                        finishAndSave(hasilHitungKomponen, callback);
                    }
                });                
            }

            for(var j = 0; j < indikatorIKS.length; j++) {
                var is = indikatorIKS[j];

                workerHitungKomponen({num: j, indikator: is, tipe: 'iks', parameter: parameter}, function (err, output) {        
                    hasilHitungKomponen.push(output);

                    if (++ret === n) {
                        workerFarm.end(workerHitungKomponen);
                        finishAndSave(hasilHitungKomponen, callback);
                    }
                });                
            }    

        });
    }

};

// Mengumpulkan seluruh hasil perhitungan indikator dari para kroco
function hitungIndeks(data, callback) {
    // data = [{indeks: "ika", indikator: {}, nilai: []}]
    
    var n = data.length;
    
    var indikatorIKA = [];
    var indikatorIKS = [];
    
    for(var i = 0; i < n; i++) {
        var d = data[i];
        
        // Kelompokkan dulu
        if(d.indeks === 'ika') {
            indikatorIKA.push({nama: d.indikator.nama, bobot: d.indikator.bobot, nilai: d.nilai});
        } else if(d.indeks === 'iks') {
            indikatorIKS.push({nama: d.indikator.nama, bobot: d.indikator.bobot, nilai: d.nilai});
        }
    }
    
    var workerResult = {};
    var nProc = 2;
    var nRet = 0;
    
    var workerHitungIndeks = workerFarm(require.resolve('./worker_hitung_indeks'));
    
    workerHitungIndeks(indikatorIKA, function (err, output) {        
        workerResult.ika = output;
        if (++nRet === nProc) {
            workerFarm.end(workerHitungIndeks);
            finished();
        }
    });      
    workerHitungIndeks(indikatorIKS, function (err, output) {        
        workerResult.iks = output;
        if (++nRet === nProc) {
            workerFarm.end(workerHitungIndeks);
            finished();
        }
    });      
    
    function finished() {
        callback(workerResult);
    }
}

function finishAndSave(hasilHitungKomponen, callback) {
    
    getWilayah(function(err, wilayah){
        if(err) {callback(err, null); return;}
        
        hitungIndeks(hasilHitungKomponen, function(hasilHitungIndeks){
            
            var nData = wilayah.length;
            var nKomp = hasilHitungKomponen.length;
            if(nData === hasilHitungKomponen[0].nilai.length && nData === hasilHitungIndeks.ika.length) {

                var hasilRentan5 = helper.hitungKerentanan5(hasilHitungIndeks),
                    hasilRentan6 = helper.hitungKerentanan6(hasilHitungIndeks),
                    hasilRentan7 = helper.hitungKerentanan7(hasilHitungIndeks);

                console.log("[INFO] Done, now inserting data at " + new Date());

                var insertData = [];
                insertData.length = nData;

                for (var i = 0; i < nData; i++) {
                    
                    var komp = {ika: {}, iks: {}};
                    for (var j = 0; j < nKomp; j++) {
                        komp[hasilHitungKomponen[j].indeks][hasilHitungKomponen[j].indikator.nama] = hasilHitungKomponen[j].nilai[i];
                    }

                    var IKA = hasilHitungIndeks.ika[i],
                        IKS = hasilHitungIndeks.iks[i],
                        rentan5 = hasilRentan5[i],
                        rentan6 = hasilRentan6[i],
                        rentan7 = hasilRentan7[i];

                    var row = [];

                    row.push(wilayah[i]);
                    row.push(JSON.stringify(komp));
                    row.push(IKA);
                    row.push(IKS);
                    row.push(rentan5);
                    row.push(rentan6);
                    row.push(rentan7);

                    insertData[i] = row;
                }
                
                // Disebar ke para kroco
                var i = 0;
                var maxWorker = 16;
                var nWorker = Math.min(maxWorker, nData);   // bugfix kalau nData < 16
                var nRet = 0;
                var nSplit = nWorker;
                var nInserted = 0;
                
                var workerInsertHasil = workerFarm(require.resolve('./worker_insert_hasil'));
                
                while(i < nData) {
                    var size = Math.ceil((nData - i) / nSplit--);
                    var chunk = insertData.slice(i, i += size);
                    
                    workerInsertHasil({idPerhitungan:parameter.idPerhitungan,skala:parameter.skala,data:chunk}, function (err, output) {
                        nInserted += output;
                        if (++nRet === nWorker) {
                            workerFarm.end(workerInsertHasil);
                            console.log("[INFO] Finished at " + new Date());
                            callback(null, nInserted + " data inserted.");
                        }
                    });                    
                }
            
            } else {
                callback(new Error("Ukuran data tidak sama!"), null);
            }
        });
    });
    
}

function getWilayah(callback) {
    var tabel = "podes_2011";    
    var kolom = helper.getKolom(parameter.skala);
    var where = helper.getWhere(parameter.lingkup, parameter.idLingkup);
    var distinct = helper.getDistinctOn(parameter.skala);
    var order = helper.getOrderBy(parameter.skala);
    
    var q = "SELECT " + distinct + kolom + " AS kode_wilayah FROM " + tabel + where + order;
    
    var client = new pg.Client(config.db);                                  
    client.connect(function(err) {
        client.query(q, function(err, qres){ 
            if (err) return callback(err, null);
            var res = [];
            var n = qres.rows.length;
            res.length = n;
            for(var i = 0; i < n; i++) {
                res[i] = qres.rows[i].kode_wilayah;
            }
            callback(null, res);                        
            client.end();            
        });
    });    
}