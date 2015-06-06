/**
 * 
 * Ini script untuk run perhitungan
 * Harus dibuat script karena ternyata workerFarm agak susah kalau 
 * setelah diakhiri, tidak mau memulai lagi
 * 
 * Dipanggil oleh controller kerentanan
 * 
 */

var mongoose = require('mongoose');
var manager = require('./manager');
var config = require('../config');

mongoose.connect(config.mongodb);

var args = process.argv.slice(2);

var param = {
    idPerhitungan: args[0],
    idModel: args[1],
    skala: args[2],
    lingkup: args[3],
    idLingkup: args[4]
};

manager.runPerhitungan(param, function(err, res) {
    
    if(err) console.log(err);
    else console.log(res);
    
    mongoose.disconnect();
    
});