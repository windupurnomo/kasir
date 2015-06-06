var db = require('../models/model_perhitungan');
var pg = require('pg');
var helper = require('./helper');
var config = require('../config');
var sql = require('./sql');

var o = {
    
    // TODO: Sekuriti, batasi operasi di model hanya bagi pengguna yang sesuai (sesuai id_user)
    
    createModelPerhitungan: function(req, res) {
        var model = new db.ModelPerhitungan(req.body);
        model.save(function (e, t){
            helper.stdResponse(e, t, res);
        });                
    },
    
    listModelPerhitungan: function(req, res) {
        db.ModelPerhitungan.find({}).select("id nama").sort("id").exec(function (err, model){
            helper.stdResponse(err, model, res);
        });
    },
    
    getModelPerhitungan: function(req, res) {
        var modelId = req.params.id;
        
        db.ModelPerhitungan.findOne({id: modelId}, function (err, model){
            helper.stdResponse(err, model, res);
        });
    },
    
    deleteModelPerhitungan: function(req, res) {
        var modelId = req.params.id;
        
        db.ModelPerhitungan.findOneAndRemove({id: modelId}, function (err, model){
            helper.stdResponse(err, model, res);
        });
    },    
    
    updateModelPerhitungan: function(req, res) {
        var modelId = req.params.id;
        var updateObject = {
            // Membatasi update cuma nama, id_user, dsb
            nama: req.body.nama,
            id_user: req.body.id_user,
            id_wilayah: req.body.id_wilayah,
            public: req.body.public
        };
        
        db.ModelPerhitungan.findOneAndUpdate(
            {id: modelId},
            updateObject,
            {safe: true, upsert: true, new: true},
            function(err, model) {
                helper.stdResponse(err, model, res);
            }               
        );
    },
    
    updateIndikator: function(req, res) {
        var modelId = req.params.id;
        var tipe = req.params.tipe;
        var indikatorId = req.params.id_ind;
        
        db.ModelPerhitungan.findOne({id: modelId}, function(err, model) {
            if(err) {res.json({status: false,message: err}); return;}

            var indikator;
            if (tipe === 'ika') {
                indikator = model.indikator_ika.id(indikatorId);
            } else if (tipe === 'iks') {
                indikator = model.indikator_iks.id(indikatorId);
            }
            if(!indikator) {res.json({status: false, message: "Indikator dengan ID '" + indikatorId + "' tidak ditemukan"}); return;}
            
            if(req.method === 'PUT') {
                // Cuma update nama & bobot
                indikator.nama = req.body.nama;
                indikator.bobot = req.body.bobot;
            } else if(req.method === 'DELETE') {
                // Hapus
                indikator.remove();                
            }
            
            model.save(function (err, model){
                helper.stdResponse(err, model, res);
            });            
        });        
    },

    updateKomponen: function(req, res) {
        var modelId = req.params.id;
        var tipe = req.params.tipe;
        var indikatorId = req.params.id_ind;
        var komponenId = req.params.id_komp;
        
        db.ModelPerhitungan.findOne({id: modelId}, function(err, model) {
            if(err) {res.json({status: false,message: err}); return;}
            
            var indikator, komponen;
            if (tipe === 'ika') {
                indikator = model.indikator_ika.id(indikatorId);
            } else if (tipe === 'iks') {
                indikator = model.indikator_iks.id(indikatorId);
            }
            if(!indikator) {res.json({status: false, message: "Indikator dengan ID '" + indikatorId + "' tidak ditemukan"}); return;}
            
            komponen = indikator.komponen.id(komponenId);
            if(!komponen) {res.json({status: false, message: "Komponen dengan ID '" + komponenId + "' tidak ditemukan"}); return;}
            
            if(req.method === 'PUT') {
                // Update all
                komponen.nama = req.body.nama;
                komponen.tipe = req.body.tipe;
                komponen.bobot = req.body.bobot;
                komponen.formula = req.body.formula;
            } else if(req.method === 'DELETE') {
                // Delete
                komponen.remove();                
            }
            
            model.save(function (err, model){
                helper.stdResponse(err, model, res);
            });            
        });        
    },

    addIndikator: function(req, res) {
        var modelId = req.params.id;
        var tipe = req.params.tipe;
        
        if (tipe === 'ika') {
            db.ModelPerhitungan.findOneAndUpdate(
                {id: modelId},
                {$push: {indikator_ika: req.body}},
                {safe: true, upsert: true, new: true},
                function(err, model) {
                    helper.stdResponse(err, model, res);
                }                
            );
        } else if (tipe === 'iks') {
            db.ModelPerhitungan.findOneAndUpdate(
                {id: modelId},
                {$push: {indikator_iks: req.body}},
                {safe: true, upsert: true, new: true},
                function(err, model) {
                    helper.stdResponse(err, model, res);
                }                
            );            
        }
    },    
    
    addKomponen: function(req, res) {
        var modelId = req.params.id;
        var tipe = req.params.tipe;
        var indikatorId = req.params.id_ind;
        
        db.ModelPerhitungan.findOne({id: modelId}, function(err, model) {
            if(err) {res.json({status: false,message: err}); return;}
            
            var indikator;
            if (tipe === 'ika') {
                indikator = model.indikator_ika.id(indikatorId);
            } else if (tipe === 'iks') {
                indikator = model.indikator_iks.id(indikatorId);
            }
            if(!indikator) {res.json({status: false, message: "Indikator dengan ID '" + indikatorId + "' tidak ditemukan"}); return;}
            
            // console.log(indikator);
            indikator.komponen.push(req.body);
            model.save(function (err, model){
                helper.stdResponse(err, model, res);
            });            
        });
    },
    
    listKolomTabelEksternal: function(req, res) {
        var userId = 1;
        
        var q = sql.dataEksternal.listKolomTabelEksternal(userId);
        var client = new pg.Client(config.db);
        client.connect(function(err) {
            client.query(q, function(err, result) {
                helper.stdResponse(err, result ? result.rows : null, res);
            });
        });        
        
    }
    
};

module.exports = o;