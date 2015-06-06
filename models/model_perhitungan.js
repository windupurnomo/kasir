var mongoose = require('mongoose');
var mongoAutoIncrement = require('mongoose-auto-increment');

var config = require('../config');

mongoAutoIncrement.initialize(mongoose.connection);

var Komponen = new mongoose.Schema({
    nama: String,
    tipe: {type: String, enum: ['numerik', 'ordinal'], required: true},
    bobot: {type: Number, min: 0, max: 1, required: true},
    formula: {type: mongoose.Schema.Types.Mixed, required: true}
});

var Indikator = new mongoose.Schema({
    nama: {type: String, required: true},
    bobot: {type: Number, min: 0, max: 1, required: true},
    sumber: String,
    komponen: [Komponen]
});

var ModelPerhitungan = new mongoose.Schema({
    id: Number,
    nama: String,
    id_user: Number,
    id_wilayah: Number,
    public: Boolean,
    indikator_ika: [Indikator],
    indikator_iks: [Indikator]
}, {collection: 'ModelPerhitungan'});

var db = {};
db.ModelPerhitungan = mongoose.model('ModelPerhitungan', ModelPerhitungan);

ModelPerhitungan.plugin(mongoAutoIncrement.plugin, { model: 'ModelPerhitungan', field: 'id' });

module.exports = db;
