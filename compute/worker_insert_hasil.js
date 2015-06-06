var config = require('../config');
var pg = require('pg');

var rollback = function(client) {
  client.query('ROLLBACK', function() {
    client.end();
  });
};

module.exports = function(input, callback) {
  
    var skala = "";
    if(input.skala === 'prov' || input.skala === 'provinsi') skala = "provinsi";
    else if(input.skala === 'kab' || input.skala === 'kabupaten') skala = "kabupaten";
    else if(input.skala === 'kec' || input.skala === 'kecamatan') skala = "kecamatan";
    else if(input.skala === 'des' || input.skala === 'desa') skala = "desa";

    var q = "INSERT INTO kerentanan_skala_" + skala + " (id_perhitungan, id_" + skala + ", hasil_indikator, ika, iks, kerentanan5, kerentanan6, kerentanan7) "
          + "VALUES (" + input.idPerhitungan + ", $1, $2, $3, $4, $5, $6, $7)";
    
    var nData = input.data.length;
    
    var client = new pg.Client(config.db);                                  
    client.connect(function(err) {
        if(err) {callback(err, null); return;}    
        
        client.query('BEGIN', function(err, result) {	
            
            for (var i = 0; i < nData; i++) {
                // Do your hard work
                (function (num) {
                    client.query(q, input.data[num], function (err) {
                        if (err) {
                            rollback(client);
                            callback(err, null);
                            return;
                        }

                        if (num === nData - 1) {
                            client.query('COMMIT', function () {
                                client.end();
                                callback(null, nData);
                            });
                        }
                    });
                })(i);
            }
            
        });        
    });
    
};