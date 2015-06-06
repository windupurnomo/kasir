var ctrl = require('../controllers/model_perhitungan');

module.exports = function(router) {
    /**
        @api {post} /model_perhitungan Create Model Perhitungan
        @apiGroup Model Perhitungan
        @apiDescription Membuat satu model perhitungan baru (dengan indikator masih kosong)

        @apiParamExample {json} Request-Example:
            {
                "nama": "Indikator Nasional",
                "id_user": 1,
                "id_wilayah": 0,
                "public": true,
                "indikator_ika": [],
                "indikator_iks": []
            }
        
        @apiSuccess {Boolean} status True jika operasi berhasil, False jika gagal
        @apiSuccess {Object} data Data model perhitungan yang baru saja dibuat
     */
    router.post('/model_perhitungan', ctrl.createModelPerhitungan);

    /**
        @api {get} /model_perhitungan Get List Model Perhitungan
        @apiGroup Model Perhitungan
        @apiDescription List seluruh model perhitungan yang ada
        @apiExample Contoh URL:
                    http://apps.cs.ipb.ac.id:3007/api/model_perhitungan

        @apiSuccess {Boolean} status True jika operasi berhasil, False jika gagal
        @apiSuccess {Object} data Array dari model perhitungan (hanya id dan namanya saja)
        
        @apiSuccessExample {json} Success-Response:
            {
                "status": true,
                "data": [
                    {
                        "_id": "555e6004e924294e09d55fec",
                        "id": 0,
                        "nama": "Indikator Nasional"
                    },
                    {
                        "_id": "555e64dd765d305d178b9f1f",
                        "id": 1,
                        "nama": "Indikator Provinsi Jawa Barat"
                    }
                ]
            }        
     */
    router.get('/model_perhitungan', ctrl.listModelPerhitungan);

    /**
        @api {get} /model_perhitungan/:id Get Model Perhitungan
        @apiGroup Model Perhitungan
        @apiDescription Ambil detail model perhitungan dengan id tertentu
        
        @apiParam {Number} id ID model yang akan diambil detailnya
        @apiExample Contoh URL:
                    http://apps.cs.ipb.ac.id:3007/api/model_perhitungan/0

        @apiSuccess {Boolean} status True jika operasi berhasil, False jika gagal
        @apiSuccess {Object} data Full detail model perhitungan sesuai ID tersebut
        
        @apiSuccessExample {json} Success-Response:
            {
                "status": true,
                "data": {
                    "_id": "555e6004e924294e09d55fec",
                    "id": 0,
                    "nama": "Indikator Nasional",
                    "id_user": 1,
                    "id_wilayah": 0,
                    "public": true,
                    "__v": 1,
                    "indikator_iks": [],
                    "indikator_ika": [
                        {
                            "sumber": "podes_2011",
                            "bobot": 0.3,
                            "nama": "Fasilitas Kesehatan",
                            "_id": "555e605de924294e09d55fed",
                            "komponen": [
                                {
                                    "nama": "Jumlah Rumah Sakit",
                                    "bobot": 0.3,
                                    "tipe": "numerik",
                                    "formula": {
                                        "skala1": "kabupaten",
                                        "skala2": "kabupaten",
                                        "data1": [
                                            "R670A",
                                            "R670C"
                                        ],
                                        "data2": [
                                            "R301A"
                                        ]
                                    },
                                    "_id": "555e60ec1fb3b50b0e176ae1"
                                }
                            ]
                        }
                    ]
                }
            }        
        
     */
    router.get('/model_perhitungan/:id', ctrl.getModelPerhitungan);

    /**
        @api {put} /model_perhitungan/:id Update Model Perhitungan
        @apiGroup Model Perhitungan
        @apiDescription Update data model perhitungan dengan id tertentu. Field yang bisa diupdate: nama, id_user, id_wilayah, public.
        
        @apiParam {Number} id ID model yang akan diubah
        @apiExample Contoh URL:
                    http://apps.cs.ipb.ac.id:3007/api/model_perhitungan/0
                    
        @apiParamExample {json} Request-Example:
            {
                "nama": "Indikator Indonesia",
                "id_user": 1,
                "id_wilayah": 0,
                "public": true
            }        
            
        @apiSuccess {Boolean} status True jika operasi berhasil, False jika gagal
        @apiSuccess {Object} data Data model perhitungan yang telah diperbarui
    */
    router.put('/model_perhitungan/:id', ctrl.updateModelPerhitungan);

    /**
        @api {delete} /model_perhitungan/:id Hapus Model Perhitungan
        @apiGroup Model Perhitungan
        @apiDescription Hapus Model Perhitungan dengan ID tertentu
        
        @apiParam {Number} id ID model yang akan dihapus
        @apiExample Contoh URL:
                    http://apps.cs.ipb.ac.id:3007/api/model_perhitungan/1
                    
        @apiSuccess {Boolean} status True jika operasi berhasil, False jika gagal
        @apiSuccess {Object} data Data model perhitungan yang baru saja dihapus. NULL jika tidak ditemukan model dengan ID tersebut.
        
        @apiSuccessExample {json} Success-Example:
            {
                "status": true,
                "data": {
                    "_id": "555e64dd765d305d178b9f1f",
                    "id": 1,
                    "nama": "Indikator Provinsi Jawa Barat",
                    "id_user": 32,
                    "id_wilayah": 32,
                    "public": false,
                    "__v": 0,
                    "indikator_iks": [],
                    "indikator_ika": []
                }
            }        
    */
    router.delete('/model_perhitungan/:id', ctrl.deleteModelPerhitungan);

    /**
        @api {post} /indikator/:id/:tipe Tambahkan Indikator
        @apiGroup Model Perhitungan
        @apiDescription Menambahkan satu indikator (IKA/IKS) pada suatu model perhitungan
    
        @apiParam {Number} id ID model yang akan diberi indikator (angka)
        @apiParam {String} tipe String "ika" atau "iks"

        @apiExample Contoh URL:
                    http://apps.cs.ipb.ac.id:3007/api/indikator/0/ika
        @apiParamExample {json} Request-Example:
            {
                "nama": "Fasilitas Pendidikan",
                "bobot": 0.2,
                "sumber": "podes_2011",
                "komponen": []
            }     
    
        @apiSuccess {Boolean} status True jika operasi berhasil, False jika gagal
        @apiSuccess {Object} data Data model perhitungan yang telah diperbarui (ditambahkan indikator baru)
     */
    router.post('/indikator/:id/:tipe', ctrl.addIndikator);

    /**
        @api {put} /indikator/:id/:tipe/:id_ind Update Indikator
        @apiGroup Model Perhitungan
        @apiDescription Mengubah data indikator (nama atau bobot) sesuai ID yang dimasukkan.
    
        @apiParam {Number} id ID model yang indikatornya akan diubah
        @apiParam {String} tipe String "ika" atau "iks"
        @apiParam {String} id_ind ID indikator yang akan diubah. ID yang ini adalah ID MongoDB yang berbentuk hash (string hexadecimal).

        @apiExample Contoh URL:
                    http://apps.cs.ipb.ac.id:3007/api/indikator/0/ika/555e605de924294e09d55fed
        @apiParamExample {json} Request-Example:
            {
                "nama": "Kesehatan",
                "bobot": 0.3
            }

        @apiSuccess {Boolean} status True jika operasi berhasil, False jika gagal
        @apiSuccess {Object} data Data model perhitungan yang telah diperbarui
     */
    router.put('/indikator/:id/:tipe/:id_ind', ctrl.updateIndikator);

    /**
        @api {delete} /indikator/:id/:tipe/:id_ind Hapus Indikator
        @apiGroup Model Perhitungan
        @apiDescription Menghapus data indikator sesuai ID yang dimasukkan.
    
        @apiParam {Number} id ID model yang indikatornya akan diubah
        @apiParam {String} tipe String "ika" atau "iks"
        @apiParam {String} id_ind ID indikator yang akan dihapus. ID yang ini adalah ID MongoDB yang berbentuk hash (string hexadecimal).

        @apiExample Contoh URL:
                    http://apps.cs.ipb.ac.id:3007/api/indikator/0/ika/555e605de924294e09d55fed

        @apiSuccess {Boolean} status True jika operasi berhasil, False jika gagal
        @apiSuccess {Object} data Data model perhitungan yang telah diperbarui
     */
    router.delete('/indikator/:id/:tipe/:id_ind', ctrl.updateIndikator);

    /**
        @api {post} /komponen/:id/:tipe/:id_ind Tambahkan Komponen
        @apiGroup Model Perhitungan
        @apiDescription Menambahkan satu komponen pada suatu indikator pada suatu model perhitungan
    
        @apiParam {Number} id ID model yang akan diberi komponen baru
        @apiParam {String} tipe String "ika" atau "iks"
        @apiParam {String} id_ind ID indikator yang akan diberi komponen baru. ID yang ini adalah ID MongoDB yang berbentuk hash (string hexadecimal).

        @apiExample Contoh URL:
                    http://apps.cs.ipb.ac.id:3007/api/komponen/0/ika/555e605de924294e09d55fed
        @apiParamExample {json} Request-Example (Numerik):
            {
                "nama": "Jumlah Universitas",
                "bobot": 0.3,
                "tipe": "numerik",
                "formula": {
                    "skala1": "kabupaten",
                    "skala2": "kabupaten",
                    "data1": ["R470A", "R470C"],
                    "data2": ["R301A"]
                }
            }
        @apiParamExample {json} Request-Example (Ordinal):
            {
                "nama": "Sumber Penghasilan",
                "bobot": 1,
                "tipe": "ordinal",
                "formula": {
                    "kolom": "R403A",
                    "nilai": {"1":1,"2":0.75,"3":0.75,"4":0.5,"5":0.25,"default":0.25}
                }
            }
    
        @apiSuccess {Boolean} status True jika operasi berhasil, False jika gagal
        @apiSuccess {Object} data Data model perhitungan yang telah diperbarui (ditambahkan komponen baru)
     */
    router.post('/komponen/:id/:tipe/:id_ind', ctrl.addKomponen);

    /**
        @api {put} /komponen/:id/:tipe/:id_ind/:id_komp Update Komponen
        @apiGroup Model Perhitungan
        @apiDescription Mengubah komponen sesuai id_komp
    
        @apiParam {Number} id ID model yang akan diubah komponennya
        @apiParam {String} tipe String "ika" atau "iks"
        @apiParam {String} id_ind ID indikator yang akan diubah komponennya. ID yang ini adalah ID MongoDB yang berbentuk hash (string hexadecimal).
        @apiParam {String} id_komp ID komponen yang akan diubah. ID yang ini adalah ID MongoDB yang berbentuk hash (string hexadecimal).

        @apiExample Contoh URL:
                    http://apps.cs.ipb.ac.id:3007/api/komponen/0/ika/555e605de924294e09d55fed/555e60ec1fb3b50b0e176ae1
        @apiParamExample {json} Request-Example (Numerik):
            {
                "nama": "Jumlah RS",
                "bobot": 0.35,
                "tipe": "numerik",
                "formula": {
                    "skala1": "kabupaten",
                    "skala2": "kabupaten",
                    "data1": ["R670A"],
                    "data2": ["R301A"]
                }
            }

        @apiSuccess {Boolean} status True jika operasi berhasil, False jika gagal
        @apiSuccess {Object} data Data model perhitungan yang telah diperbarui
     */
    router.put('/komponen/:id/:tipe/:id_ind/:id_komp', ctrl.updateKomponen);

    /**
        @api {delete} /komponen/:id/:tipe/:id_ind/:id_komp Hapus Komponen
        @apiGroup Model Perhitungan
        @apiDescription Menghapus komponen sesuai id_komp
    
        @apiParam {Number} id ID model yang akan diubah komponennya
        @apiParam {String} tipe String "ika" atau "iks"
        @apiParam {String} id_ind ID indikator yang akan dihapus komponennya. ID yang ini adalah ID MongoDB yang berbentuk hash (string hexadecimal).
        @apiParam {String} id_komp ID komponen yang akan dihapus. ID yang ini adalah ID MongoDB yang berbentuk hash (string hexadecimal).

        @apiExample Contoh URL:
                    http://apps.cs.ipb.ac.id:3007/api/komponen/0/ika/555e605de924294e09d55fed/555e60ec1fb3b50b0e176ae1

        @apiSuccess {Boolean} status True jika operasi berhasil, False jika gagal
        @apiSuccess {Object} data Data model perhitungan yang telah diperbarui (dihapus komponennya)
     */
    router.delete('/komponen/:id/:tipe/:id_ind/:id_komp', ctrl.updateKomponen);
    
    /**
        @api {get} /kolom_tabel_data Get List Tabel Data dan Kolomnya
        @apiGroup Model Perhitungan
        @apiDescription List seluruh tabel data untuk user saat ini dan kolom-kolomnya
        @apiExample Contoh URL:
                    http://apps.cs.ipb.ac.id:3007/api/kolom_tabel_data

        @apiSuccess {Boolean} status True jika operasi berhasil, False jika gagal
        @apiSuccess {Object} data Array dari data tabel hitung (id, nama, kolom)
        
        @apiSuccessExample {json} Success-Response:
            {
                "status": true,
                "data": [
                    {
                        "id": 0,
                        "nama": "podes_2011",
                        "kolom": "r301,r302a,r302b,r303a,r303b,...,r1501bk4,r1501bk5"
                    },
                    {
                        "id": 44,
                        "nama": "jabar_lahan",
                        "kolom": "jumlah_penduduk,area,pertanian,sawah,hutan"
                    }
                ]
            }   
     */    
    router.get('/kolom_tabel_data', ctrl.listKolomTabelEksternal);

    return router;
};
