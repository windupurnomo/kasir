var ctrl = require('../controllers/data_hitung_eksternal.js');

module.exports = function(router) {

    /**
        @api {post} /data_hitung_eksternal Buat Data Eksternal
        @apiGroup Data Eksternal
        @apiDescription Membuat satu data eksternal baru (sekaligus upload file yang berisi data)

        @apiParam {String} nama Nama data ini
        @apiParam {Number} idUser ID user yang membuat (TODO: harusnya dari id user yang login)
        @apiParam {String} lingkup Lingkup data ini (provinsi? kabupaten? kecamatan?)
        @apiParam {String} idLingkup ID wilayah sesuai lingkup di atas
        @apiParam {String} keterangan Keterangan data ini
        @apiParam {File} file File yang akan di-upload
        
        @apiSuccess {Boolean} status True jika operasi berhasil, False jika gagal
        @apiSuccess {Object} data dataId ID data eksternal yang baru saja dibuat
    
        @apiSuccessExample {json} Success-Response:
            {
                "status": true,
                "data": {
                    "dataId": 24
                }
            }    
     */
    router.post('/data_hitung_eksternal', ctrl.createDataEksternal);

    /**
        @api {get} /data_hitung_eksternal Get List Data Eksternal
        @apiGroup Data Eksternal
        @apiDescription List seluruh data eksternal perhitungan yang ada
        @apiExample Contoh URL:
                    http://apps.cs.ipb.ac.id:3007/api/data_hitung_eksternal

        @apiSuccess {Boolean} status True jika operasi berhasil, False jika gagal
        @apiSuccess {Object} data Array dari data hitung eksternal
        
        @apiSuccessExample {json} Success-Response:
            {
                "status": true,
                "data": [
                    {
                        "id": 24,
                        "nama": "jabar_luas_lahan",
                        "id_user": 1,
                        "user": "Administrator",
                        "lingkup": "provinsi",
                        "id_lingkup": 32,
                        "keterangan": "Data luas lahan pertanian di Jawa Barat"
                    }
                ]
            }     
     */
    router.get('/data_hitung_eksternal', ctrl.listDataEksternal);
    
    /**
        @api {delete} /data_hitung_eksternal/:id Hapus Data Eksternal
        @apiGroup Data Eksternal
        @apiDescription Hapus data eksternal dengan ID tertentu
        
        @apiParam {Number} id ID yang akan dihapus
        @apiExample Contoh URL:
                    http://apps.cs.ipb.ac.id:3007/api/data_hitung_eksternal/1
                    
        @apiSuccess {Boolean} status True jika operasi berhasil, False jika gagal
        @apiSuccess {Object} data Sekedar status. Bisa diabaikan.
        
        @apiSuccessExample {json} Success-Example:
            {
                "status": true,
                "data": "DELETE OK"
            }        
    */    
    router.delete('/data_hitung_eksternal/:id', ctrl.deleteDataEksternal);
    
    return router;
};

