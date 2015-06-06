var pg = require('pg');
var helper = require('./helper');
var config = require('../config');
var agregator = require('./aggregator');
var XLSX = require('xlsx');
var sql = require('./sql');
var fs = require('fs');

var rollback = function(client) {
  client.query('ROLLBACK', function() {
    client.end();
  });
};

function createDataEksternal(data, callback) {
    // data: {nama, idUser, lingkup, idLingkup, keterangan, filePath}
    // Callback mengembalikan ID data yang dibuat
    
    var client = new pg.Client(config.db);
    client.connect(function(err) {
        if(err) {rollback(client); return callback(err);}
        client.query('BEGIN', function(err, result) {
        
            var insertQ = "INSERT INTO sumber_data_eksternal (nama, id_user, lingkup, id_lingkup, keterangan) VALUES ($1, $2, $3, $4, $5) RETURNING id";
            var insertD = [data.nama, data.idUser, data.lingkup, data.idLingkup, data.keterangan];
            client.query(insertQ, insertD, function(err, result) {
                if(err) {rollback(client); return callback(err);}

                var dataId = result.rows[0].id;
                
                // read XLSX ===================================================

                try {
                    var workbook = XLSX.readFile(data.filePath);
                } catch(ex) {
                    rollback(client); return callback(ex);
                }
                
                if(!workbook) {rollback(client); return callback(new Error("Invalid file"));}
                
                var firstSheetName = workbook.SheetNames[0];
                var worksheet = workbook.Sheets[firstSheetName];    
                var headers = [];

                var range = XLSX.utils.decode_range(worksheet['!ref']);
                var col, row;

                for(row = range.s.r; row <= range.e.r; ++row) {
                    var cell = worksheet[XLSX.utils.encode_cell({c:0, r:row})];
                    if(cell && cell.t && XLSX.utils.format_cell(cell) === 'kode_prov') 
                        break;
                }

                for(col = 4; col <= range.e.c; ++col) {
                    var cell = worksheet[XLSX.utils.encode_cell({c:col, r:row})];

                    var hdr = "_kolom_" + col; // <-- replace with your desired default 
                    if(cell && cell.t) hdr = XLSX.utils.format_cell(cell);

                    headers.push(hdr + " double precision");
                }    

                var tableName = "data_eksternal_" + dataId;
                var createTable = "CREATE TABLE " + tableName + " (kode_prov integer NOT NULL, kode_kab integer NOT NULL, kode_kec integer NOT NULL, kode_desa bigint NOT NULL,"
                                + headers.join(", ") + ", CONSTRAINT " + tableName + "_pkey PRIMARY KEY (kode_prov, kode_kab, kode_kec, kode_desa)); "
                                + "CREATE INDEX " + tableName + "_kdesa_idx ON " + tableName + " USING btree (kode_desa); "
                                + "CREATE INDEX " + tableName + "_kkec_idx ON " + tableName + " USING btree (kode_kec); "
                                + "CREATE INDEX " + tableName + "_kkab_idx ON " + tableName + " USING btree (kode_kab); "
                                + "CREATE INDEX " + tableName + "_kprov_idx ON " + tableName + " USING btree (kode_prov);";

                client.query(createTable, function(err) {
                    if(err) {rollback(client); return callback(err);}
                    
                    // Loop all rows
                    row++;
                    for(; row <= range.e.r; ++row) {
                        var rowData = [];
                        for(col = range.s.c; col <= range.e.c; ++col) {
                            var cell = worksheet[XLSX.utils.encode_cell({c:col, r:row})];
                            if(cell && cell.v)
                                rowData.push("'" + cell.v + "'");
                            else
                                rowData.push("'0'");
                        }
                        
                        (function (num, rowData) {
                            var insertQ = "INSERT INTO " + tableName + " VALUES(" + rowData.join(",") + ");";   // Males pake prep stat
                            client.query(insertQ, function(err) {
                                if(err) {rollback(client); return callback(err);}    

                                if (num === range.e.r - 1) {
                                    // Insert missing values 
                                    // Yaitu row yang ada di podes dalam lingkup itu, tapi nggak ada di data ini
                                    // Misalnya jika lingkup prov jabar, seluruh jabar harus ada, kalau tidak ada dikasih nol
                                    var zeroCols = Array(rowData.length - 3).join('0').split('').join(',');
                                    var insertMissingQ = "INSERT INTO " + tableName + " "
                                                       + "SELECT p.kode_prov, p.kode_kab, p.kode_kec, p.kode_desa, " + zeroCols + " "
                                                       + "FROM podes_2011 p LEFT JOIN " + tableName + " e "
                                                       + "ON p.kode_desa = e.kode_desa WHERE e.kode_desa IS NULL "
                                                       + getWhere(data.lingkup, data.idLingkup) + " ORDER BY kode_desa";

                                    client.query(insertMissingQ, function(err) {
                                        if(err) {rollback(client); return callback(err);}                                      
                                    
                                        client.query('COMMIT', function () {
                                            client.end();
                                            agregatSemuanya(tableName, dataId, callback);
                                        });
                                    });
                                }
                            });              
                        })(row, rowData);
                    }                    
                });
            });
        });
    });    
    
    function getWhere(lingkup, idLingkup) {
        if (lingkup === 'pusat' || lingkup === 'nasional') return '';

        var filterLingkup = "";
        if (lingkup === 'prov' || lingkup === 'provinsi') {
            filterLingkup = " AND p.kode_prov = " + idLingkup;
        } else if (lingkup === 'kab' || lingkup === 'kabupaten') {
            filterLingkup = " AND p.kode_kab = " + idLingkup;
        } else if (lingkup === 'kec' || lingkup === 'kecamatan') {
            filterLingkup = " AND p.kode_kec = " + idLingkup;
        }
        return filterLingkup;        
    }
}

function agregatSemuanya(tableName, dataId, callback) {
    
    agregator.tabelPodes = tableName;
    agregator.agregat('kecamatan', 'numerik', function(e){
        if(e){return callback(e);}
        agregator.agregat('kecamatan', 'ordinal', function(e){
            if(e){return callback(e);}
            agregator.agregat('kabupaten', 'numerik', function(e){
                if(e){return callback(e);}
                agregator.agregat('kabupaten', 'ordinal', function(e){
                    if(e){return callback(e);}
                    agregator.agregat('provinsi', 'numerik', function(e){
                        if(e){return callback(e);}
                        agregator.agregat('provinsi', 'ordinal', function(e){
                            if(e){return callback(e);}
                            callback(null, {dataId: dataId});
                        });
                    });
                });
            });
        });        
    });    
}

function deleteDataEksternal(dataId, callback) {
    var client = new pg.Client(config.db);
    client.connect(function(err) {
        if(err) {rollback(client); return callback(err);}
        client.query('BEGIN', function(err, result) {
            var deleteQ = "DELETE FROM sumber_data_eksternal WHERE id = $1";
            client.query(deleteQ, [dataId], function(err, result) {
                if(err) {rollback(client); return callback(err);}
                if(result.rowCount === 0) {
                    callback(new Error("Data id " + dataId + " does not exist")); 
                    client.end();
                    return;
                }
                
                var tableName = "data_eksternal_" + dataId;
                // Drop all aggregate
                var toDrop = [tableName, 
                              tableName + "_kecamatan_numerik",
                              tableName + "_kecamatan_ordinal",
                              tableName + "_kabupaten_numerik",
                              tableName + "_kabupaten_ordinal",
                              tableName + "_provinsi_numerik",
                              tableName + "_provinsi_ordinal"];
                          
                var dropQ = "DROP TABLE IF EXISTS " + toDrop.join(", ");
                client.query(dropQ, function(err, result) {
                    if(err) {rollback(client); return callback(err);}                
                    
                    client.query('COMMIT', function () {
                        client.end();
                        callback(null, "DELETE OK");
                    });                    
                });
            });
        });
    });
}

var o = {
    
    listDataEksternal: function(req, res) {
        var client = new pg.Client(config.db);
        client.connect(function(err) {
            client.query(sql.dataEksternal.list, function(err, result) {
                helper.stdResponse(err, result ? result.rows : null, res);
            });
        });
        
    },
    
    createDataEksternal: function(req, res) {
        if(req.files && req.files.file) {
            var tmpPath = req.files.file.path;
            var idUser = helper.getAuthUser(req.headers.authorization).id_user;
            var data = {
                nama: req.body.nama,
                idUser: idUser,
                lingkup: req.body.lingkup,
                idLingkup: req.body.idLingkup,
                keterangan: req.body.keterangan,
                filePath: tmpPath
            };            
            
            createDataEksternal(data, function(err, result) {
                fs.unlinkSync(tmpPath);
                helper.stdResponse(err, result, res);
            });            
            
        } else {
            res.json({status:false, data:{message: "Tidak ada file yang di-upload"}});
        }
    },
    
    deleteDataEksternal: function(req, res) {
        var deleteId = req.params.id;
        var idUser = helper.getAuthUser(req.headers.authorization).id_user;
        
        // Test owner
        var client = new pg.Client(config.db);
        client.connect(function(err) {
            client.query("SELECT id_user FROM sumber_data_eksternal WHERE id = $1", [deleteId], function(err, result) {
                if(err) {helper.stdError(err, res); return;}
                if(result.rows.length !== 1) {helper.stdError("Data not found", res); return;}
                if(result.rows[0].id_user == idUser || idUser == 1) {       // Special for admin
                    deleteDataEksternal(deleteId, function(err, result){
                        helper.stdResponse(err, result, res);
                    });                                        
                } else {
                    helper.stdError("Anda tidak berhak memanipulasi data ini karena bukan milik Anda.", res);
                }                
            });
        });        
        
    }
    
};

module.exports = o;


//if(require.main === module) {
//    
//    var data = {
//        nama: 'Jabar',
//        idUser: 1,
//        lingkup: 'provinsi',
//        idLingkup: 32,
//        keterangan: "Data jawa barat",
//        filePath: "/home/abrari/Desktop/shell.php"
//    };
//    
//    createDataEksternal(data, function(err, res) {
//        if(err) console.log(err);
//        else console.log(res);
//    });
//    
//}
    
