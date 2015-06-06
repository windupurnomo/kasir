var pg = require('pg');
var helper = require('./helper');
var config = require('../config');

var rollback = function(client) {
  client.query('ROLLBACK', function() {
    client.end();
  });
};

var o = {

    metadataQ: "SELECT perhitungan.*, tbl_user.nama AS user, "
                + "CASE "
                + "	WHEN lingkup = 'pusat' OR lingkup = 'nasional' THEN 'NASIONAL' "
                + "	WHEN lingkup = 'prov' OR lingkup = 'provinsi' THEN 'PROVINSI ' || (SELECT nama_provinsi FROM data_provinsi WHERE id = perhitungan.value_lingkup) "
                + "	WHEN lingkup = 'kab' OR lingkup = 'kabupaten' THEN 'KABUPATEN ' || (SELECT nama_kabupaten FROM data_kabupaten WHERE id = perhitungan.value_lingkup) "
                + "	WHEN lingkup = 'kec' OR lingkup = 'kecamatan' THEN 'KECAMATAN ' || (SELECT nama_kecamatan FROM data_kecamatan WHERE id = perhitungan.value_lingkup) "
                + "END as nama_lingkup  "
                + "FROM perhitungan JOIN tbl_user ON perhitungan.id_user = tbl_user.id_user ",

    rentanListPerhitungan: function(req, res) {
        var client = new pg.Client(config.db);
        client.connect(function(err) {
            var metadataQ = o.metadataQ + "ORDER BY perhitungan.id_perhitungan";
            client.query(metadataQ, function(err, result) {                             
                helper.stdResponse(err, result.rows, res);
            });
        });             
    },

    rentanMetadata: function(req, res) {
        var idHitung = req.params.idhitung;
        var client = new pg.Client(config.db);
        client.connect(function(err) {
            var metadataQ = o.metadataQ + "WHERE perhitungan.id_perhitungan = $1";
            client.query(metadataQ, [idHitung], function(err, result) {
                if(err) {
                    client.end();
                    return helper.stdError(err, res);
                }
                if(result.rowCount === 0) {
                    client.end();
                    return helper.stdError("Tidak ada perhitungan dengan id " + idHitung, res);
                }

                var metadata = result.rows[0];                                
                helper.stdResponse(err, metadata, res);
            });
        });              
    },

    rentanHasil: function(req, res) {
        
        var idHitung = req.params.idhitung;
        var client = new pg.Client(config.db);
        client.connect(function(err) {
            client.query("SELECT * FROM perhitungan WHERE id_perhitungan = $1", [idHitung], function(err, result) {
                if(err) {
                    client.end();
                    return helper.stdError(err, res);
                }
                if(result.rowCount === 0) {
                    client.end();
                    return helper.stdError("Tidak ada perhitungan dengan id " + idHitung, res);
                }
                var skala = result.rows[0].skala;
                
                if(skala === 'prov') skala = 'provinsi';
                else if(skala === 'kab') skala = 'kabupaten';
                else if(skala === 'kec') skala = 'kecamatan';
                else if(skala === 'des') skala = 'desa';
                
                var sql = "select k.id_perhitungan, k.id_" + skala + ", p.nama_" + skala + ", k.ika, k.iks, k.kerentanan5, k.kerentanan6, k.kerentanan7 from kerentanan_skala_" + skala + " k inner join data_" + skala + " p on k.id_" + skala + " = p.id where k.id_perhitungan = $1 order by p.id";
                
                helper.stdQuery(req, res, sql, [idHitung]);
            });
        });        
    },

    rentanHasilByWilayah: function(req, res) {
        
        var idHitung = req.params.idhitung;
        var idWilayah = req.params.idwilayah;
        var client = new pg.Client(config.db);
        client.connect(function(err) {
            client.query("SELECT * FROM perhitungan WHERE id_perhitungan = $1", [idHitung], function(err, result) {
                if(err) {
                    client.end();
                    return helper.stdError(err, res);
                }
                if(result.rowCount === 0) {
                    client.end();
                    return helper.stdError("Tidak ada perhitungan dengan id " + idHitung, res);
                }
                var skala = result.rows[0].skala;
                
                if(skala === 'prov') skala = 'provinsi';
                else if(skala === 'kab') skala = 'kabupaten';
                else if(skala === 'kec') skala = 'kecamatan';
                else if(skala === 'des') skala = 'desa';
                
                var sql = "select k.id_perhitungan, k.id_" + skala + ", p.nama_" + skala + ", k.hasil_indikator::json, k.ika, k.iks, k.kerentanan5, k.kerentanan6, k.kerentanan7 from kerentanan_skala_" + skala + " k inner join data_" + skala + " p on k.id_" + skala + " = p.id where k.id_perhitungan = $1 and k.id_" + skala + " = $2";
                
                helper.stdQuery(req, res, sql, [idHitung, idWilayah], true);
            });
        });        
    },
    
    rentanRingkasan: function (req, res) {
        
        var idHitung = req.params.idhitung;
        var kelas = req.params.kelas;
        
        var kelasValid = ['5', '6', '7'];
        
        if(kelasValid.indexOf(kelas) === -1) helper.stdError("Kelas kerentanan tidak valid: " + kelas, res);
        
        var client = new pg.Client(config.db);
        client.connect(function(err) {
            client.query("SELECT * FROM perhitungan WHERE id_perhitungan = $1", [idHitung], function(err, result) {
                if(err) {
                    client.end();
                    return helper.stdError(err, res);
                }
                if(result.rowCount === 0) {
                    client.end();
                    return helper.stdError("Tidak ada perhitungan dengan id " + idHitung, res);
                }
                var skala = result.rows[0].skala;
                
                if(skala === 'prov') skala = 'provinsi';
                else if(skala === 'kab') skala = 'kabupaten';
                else if(skala === 'kec') skala = 'kecamatan';
                else if(skala === 'des') skala = 'desa';
                
                var sql = "SELECT kerentanan" + kelas + " AS kerentanan, count(kerentanan5) AS jumlah "
                        + "FROM kerentanan_skala_" + skala + " "
                        + "WHERE id_perhitungan = $1 "
                        + "GROUP BY kerentanan" + kelas + " "
                        + "ORDER BY kerentanan" + kelas + " ";
                
                helper.stdQuery(req, res, sql, [idHitung]);
            });
        });        
    },

    rentanRingkasanByKerentanan: function (req, res) {
        
        var idHitung = req.params.idhitung;
        var kelas = req.params.kelas;
        var filterKerentanan = req.params.kerentanan;
        
        var kelasValid = ['5', '6', '7'];
        
        if(kelasValid.indexOf(kelas) === -1) helper.stdError("Kelas kerentanan tidak valid: " + kelas, res);
        
        var client = new pg.Client(config.db);
        client.connect(function(err) {
            client.query("SELECT * FROM perhitungan WHERE id_perhitungan = $1", [idHitung], function(err, result) {
                if(err) {
                    client.end();
                    return helper.stdError(err, res);
                }
                if(result.rowCount === 0) {
                    client.end();
                    return helper.stdError("Tidak ada perhitungan dengan id " + idHitung, res);
                }
                var skala = result.rows[0].skala;
                
                if(skala === 'prov') skala = 'provinsi';
                else if(skala === 'kab') skala = 'kabupaten';
                else if(skala === 'kec') skala = 'kecamatan';
                else if(skala === 'des') skala = 'desa';
                
                var sql = "SELECT d.id, d.nama_" + skala + " AS nama "
                        + "FROM kerentanan_skala_" + skala + " k JOIN data_" + skala + " d "
                        + "ON d.id = k.id_" + skala + " "
                        + "WHERE k.id_perhitungan = $1 AND k.kerentanan" + kelas + " = $2";
                
                helper.stdQuery(req, res, sql, [idHitung, filterKerentanan]);
            });
        });        
    },
    
    rentanHapus: function(req, res) {
        
        // TODO otorisasi, hapus hanya bisa oleh pemilik perhitungan
        
        var idHitung = req.params.idhitung;
        var client = new pg.Client(config.db);
        client.connect(function(err) {
            client.query('BEGIN', function() {
                client.query("SELECT * FROM perhitungan WHERE id_perhitungan = $1", [idHitung], function(err, result) {
                    if(err) {
                        client.end();
                        return helper.stdError(err, res);
                    }
                    if(result.rowCount === 0) {
                        client.end();
                        return helper.stdError("Tidak ada perhitungan dengan id " + idHitung, res);
                    }
                    var skala = result.rows[0].skala;

                    if(skala === 'prov') skala = 'provinsi';
                    else if(skala === 'kab') skala = 'kabupaten';
                    else if(skala === 'kec') skala = 'kecamatan';
                    else if(skala === 'des') skala = 'desa';

                    client.query("DELETE FROM kerentanan_skala_" + skala + " WHERE id_perhitungan = $1", [idHitung], function(err, result) {
                        if(err) rollback(client);
                        client.query("DELETE FROM perhitungan WHERE id_perhitungan = $1", [idHitung], function(err, result) {
                            if(err) rollback(client);
                            client.query('COMMIT', function () {
                                client.end();
                                helper.stdResponse(err, "DELETE OK", res);
                            });
                        });                        
                    });
                });
            });
        });        
    },    

    rentanHitung: function (req, res){

        /*
        var exec = require('child_process').exec, child;

        var escapeShell = function(cmd) {
          cmd = cmd + ''; // force to string
          return '"'+cmd.replace(/(["\s'$`\\])/g,'\\$1')+'"';
        };

        var args = [];
        args.push(escapeShell(req.body.idhitung));
        args.push(escapeShell(req.body.idmodel));
        args.push(escapeShell(req.body.skala));
        args.push(escapeShell(req.body.lingkup));
        args.push(escapeShell(req.body.idlingkup));

        var cmd = "node compute/run_hitung.js " + args.join(" ");

        child = exec(cmd, function(err, stdout) { // Sorry
            helper.stdResponse(err, stdout, res);
        });
        */

        var param = {
            idPerhitungan: req.body.idhitung,
            idModel: req.body.idmodel,
            skala: req.body.skala,
            lingkup: req.body.lingkup,
            idLingkup: req.body.idlingkup
        };
        
        var manager = require('../compute/manager');
        
        manager.runPerhitungan(param, function(err, result) {
            helper.stdResponse(err, result, res);
        });
    },
    
    rentanHitungSocket: function (req, res){
        
        var wsClientId = req.body.wsClientId;
        
        var param = {
            idModel: req.body.idmodel,
            skala: req.body.skala,
            lingkup: req.body.lingkup,
            idLingkup: req.body.idlingkup
        };
        // console.log(param);
        
        var client = new pg.Client(config.db);
        client.connect(function(err) {
            var insertQ = "INSERT INTO perhitungan(tanggal, tahun_hitung, tahun_baseline, skala, lingkup, value_lingkup, id_model, id_user, id_skenario, tanggal_selesai, status) " 
                        + "VALUES (current_timestamp, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id_perhitungan";
            var insertD = [
                2011,
                2011,
                param.skala,
                param.lingkup,
                param.idLingkup,
                param.idModel,
                1,
                0,
                null,
                'running'
            ];
            client.query(insertQ, insertD, function(err, result) {
                if(err) {console.log(err); return;}

                // Emit new ID to client
                var dataId = result.rows[0].id_perhitungan;                
                req.io.sockets.emit('perhitungan', { status: 'new', for: wsClientId, id: dataId });
                
                param.idPerhitungan = dataId;
                
                // RUN RUN RUN!
				var manager = require('../compute/manager');
				
                manager.runPerhitungan(param, function(mgrErr, mgrResult) {
                    var updateQ = "UPDATE perhitungan SET tanggal_selesai = current_timestamp, status = $1 WHERE id_perhitungan = $2";
                    if(err) {
                        client.query(updateQ, ['error', dataId], function(err, result) {
                            req.io.sockets.emit('perhitungan', { status: 'error', for: wsClientId, error: mgrErr, result: mgrResult });
                            res.end(); 
                        });
                    }
                    else {
                        client.query(updateQ, ['finish', dataId], function(err, result) {
                            req.io.sockets.emit('perhitungan', { status: 'finish', for: wsClientId, error: mgrErr, result: mgrResult });
                            res.end(); 
                        });                        
                    }
                });                
            });
        });          
        
            
    }
};

module.exports = o;
