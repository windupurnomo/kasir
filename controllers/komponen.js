var pg = require('pg');
var helper = require('./helper');
var config = require('../config');

var o = {
    //todo: buat komponen IKA/IKS
    //table: ccrom_komponen_ika/iks => id, id_indikator, tipe, bobot
    //parameter: indikatortype, datatype, id_indikator, bobot
    //example: ika, nominal, 100, 0.4


    //todo: buat komponen detail IKA/IKS. 
    //table: ccrom_detail_komponen_ika/iks: id, id_komponen, data1, data2, skala1, skala2
    //parameter: indikatortype, datatype, id_komponen, topscale, botscale, topattr1, topattr2, topattr3, botattr1, botattr2, botattr3, ordvalue
    //example: ika, numeric, 1, kabupaten, desa, col1, null, null, col3, null, null
    //example: iks, ordinal, 1, ordvalue: {column: col1, pair: [{1, 0.4}, {1, 0.4}, {1, 0.4}]}
}

module.exports = o;
