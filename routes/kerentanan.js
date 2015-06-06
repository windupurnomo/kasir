var ctrl = require('../controllers/kerentanan');

module.exports = function(router) {
	/**
	@api {post} /rentan/hitung Hitung Kerentanan
	@apiGroup Kerentanan
	@apiDescription Melakukan perhitungan kerentanan
	
	@apiParam {Number} idhitung		ID Perhitungan
	@apiParam {Number} idmodel		ID Model yang digunakan dalam perhitungan
	@apiParam {String} skala		Skala perhitungan. 'provinsi', 'kabupaten', 'kecamatan', 'desa'
	@apiParam {String} lingkup		Lingkup perhitungan. 'provinsi', 'kabupaten', 'kecamatan', 'desa'
	@apiParam {Number} idlingkup	ID lingkup perhitungan

	@apiParamExample {json} Request-Example:
	{
	    idPerhitungan: 18,
	    idModel: 1,
	    skala: 'kabupaten',
	    lingkup: 'provinsi',
	    idLingkup: '32'
	};
	*/
	router.post('/rentan/hitung', ctrl.rentanHitung);

	/**
	@api {get} /rentan/hasil/:idhitung Dapatkan Hasil Kerentanan
	@apiGroup Kerentanan
	@apiDescription Menampilkan hasil hitung kerentanan
    
        @apiExample Contoh URL:
                    http://apps.cs.ipb.ac.id:3007/api/rentan/hasil/12?page=1&limit=5
    
        @apiSuccessExample {json} Success-Response:
            {
                "status": true,
                "data": [
                    {
                        "nama_provinsi": "NANGGROE ACEH DARUSSALAM",
                        "id_perhitungan": 12,
                        "id_provinsi": 11,
                        "hasil_indikator": "{\"ika\":{\"Listrik\":0.9419022535849892,\"Fasilitas Kesehatan\":0.6345785204401478,\"Pendidikan\":0.5455477390626086,\"Infrastruktur Jalan\":1},\"iks\":{\"Kemiskinan\":0.7791939048575931,\"Bangunan Bantaran Sungai\":0.09776485828319482,\"KK Bantaran Sungai\":0.10379226342324352,\"Sumber Air Minum\":0.5,\"Sumber Penghasilan\":1}}",
                        "ika": 0.739513441247074,
                        "iks": 0.603913883627922,
                        "kerentanan5": 2,
                        "kerentanan6": 2,
                        "kerentanan7": 2
                    },
                    {
                        "nama_provinsi": "SUMATERA UTARA",
                        "id_perhitungan": 12,
                        "id_provinsi": 12,
                        "hasil_indikator": "{\"ika\":{\"Listrik\":0.9081349090885825,\"Fasilitas Kesehatan\":0.45550687737599554,\"Pendidikan\":0.36608200461575413,\"Infrastruktur Jalan\":1},\"iks\":{\"Kemiskinan\":0.22294400092550648,\"Bangunan Bantaran Sungai\":0.06763124451950703,\"KK Bantaran Sungai\":0.06391989312003776,\"Sumber Air Minum\":0.5,\"Sumber Penghasilan\":1}}",
                        "ika": 0.62351039186967,
                        "iks": 0.430038314041606,
                        "kerentanan5": 3,
                        "kerentanan6": 1,
                        "kerentanan7": 4
                    },
                    {
                        "nama_provinsi": "SUMATERA BARAT",
                        "id_perhitungan": 12,
                        "id_provinsi": 13,
                        "hasil_indikator": "{\"ika\":{\"Listrik\":0.9278292879202826,\"Fasilitas Kesehatan\":0.6654907471284566,\"Pendidikan\":0.323116469703518,\"Infrastruktur Jalan\":1},\"iks\":{\"Kemiskinan\":1,\"Bangunan Bantaran Sungai\":0.02662394122707412,\"KK Bantaran Sungai\":0.03676532439662419,\"Sumber Air Minum\":0,\"Sumber Penghasilan\":1}}",
                        "ika": 0.678539487029663,
                        "iks": 0.50633892656237,
                        "kerentanan5": 3,
                        "kerentanan6": 2,
                        "kerentanan7": 4
                    },
                    {
                        "nama_provinsi": "RIAU",
                        "id_perhitungan": 12,
                        "id_provinsi": 14,
                        "hasil_indikator": "{\"ika\":{\"Listrik\":0.744012447189243,\"Fasilitas Kesehatan\":0.4718656537325682,\"Pendidikan\":0.37440734530678405,\"Infrastruktur Jalan\":1},\"iks\":{\"Kemiskinan\":0.09949062101611086,\"Bangunan Bantaran Sungai\":0.221983693972172,\"KK Bantaran Sungai\":0.19604147144569956,\"Sumber Air Minum\":0.5,\"Sumber Penghasilan\":1}}",
                        "ika": 0.589885011509116,
                        "iks": 0.42164970284662,
                        "kerentanan5": 3,
                        "kerentanan6": 1,
                        "kerentanan7": 4
                    },
                    {
                        "nama_provinsi": "JAMBI",
                        "id_perhitungan": 12,
                        "id_provinsi": 15,
                        "hasil_indikator": "{\"ika\":{\"Listrik\":0.7824211928821042,\"Fasilitas Kesehatan\":0.5007070922353921,\"Pendidikan\":0.5208358558058201,\"Infrastruktur Jalan\":1},\"iks\":{\"Kemiskinan\":0.05514070674913935,\"Bangunan Bantaran Sungai\":0.42346522724539254,\"KK Bantaran Sungai\":0.41505323356258456,\"Sumber Air Minum\":0.5,\"Sumber Penghasilan\":1}}",
                        "ika": 0.65206818263289,
                        "iks": 0.45039405810554,
                        "kerentanan5": 3,
                        "kerentanan6": 1,
                        "kerentanan7": 4
                    }
                ]
            }    
	*/
	router.get('/rentan/hasil/:idhitung', ctrl.rentanHasil);
        
        /**
	@api {get} /rentan/hasil/:idhitung/:idwilayah Dapatkan Detail Hasil Kerentanan Berdasarkan Wilayah
	@apiGroup Kerentanan
	@apiDescription Menampilkan detail hasil hitung kerentanan berdasarkan wilayah. Untuk spider graph silakan pakai ini.
    
        @apiExample Contoh URL:
                    http://apps.cs.ipb.ac.id:3007/api/rentan/hasil/12/32
    
        @apiSuccessExample {json} Success-Response:
            {
                "status": true,
                "data": {
                    "id_perhitungan": 12,
                    "id_provinsi": 32,
                    "nama_provinsi": "JAWA BARAT",
                    "hasil_indikator": {
                        "ika": {
                            "Listrik": 0.9323107568755157,
                            "Fasilitas Kesehatan": 0.42657905299254617,
                            "Pendidikan": 0.12013416891727192,
                            "Infrastruktur Jalan": 1
                        },
                        "iks": {
                            "Kemiskinan": 0.09943925848150559,
                            "Bangunan Bantaran Sungai": 0.03208066785761108,
                            "KK Bantaran Sungai": 0.03582113165723227,
                            "Sumber Air Minum": 0.5,
                            "Sumber Penghasilan": 1
                        }
                    },
                    "ika": 0.547091655791824,
                    "iks": 0.386621957495936,
                    "kerentanan5": 3,
                    "kerentanan6": 1,
                    "kerentanan7": 4
                }
            }    

        */
        router.get('/rentan/hasil/:idhitung/:idwilayah', ctrl.rentanHasilByWilayah);
                        
	/**
	@api {get} /rentan/metadata/:idhitung Dapatkan Metadata Hasil Hitung
	@apiGroup Kerentanan
	@apiDescription Menampilkan metadata hasil hitung kerentanan
    
        @apiExample Contoh URL:
                    http://apps.cs.ipb.ac.id:3007/api/rentan/metadata/12
    
        @apiSuccessExample {json} Success-Response:
            {
                "status": true,
                "data": {
                    "id_perhitungan": 12,
                    "tanggal": "2014-07-14T08:52:25.000Z",
                    "tahun_hitung": "2011-01-01",
                    "tahun_baseline": "2011-01-01",
                    "skala": "provinsi",
                    "lingkup": "pusat",
                    "value_lingkup": "0",
                    "id_model": 1,
                    "id_user": "1",
                    "id_skenario": 0,
                    "tanggal_selesai": null,
                    "status": null,
                    "user": "Administrator",
                    "nama_lingkup": "Nasional"
                }
            }    
    
        */
        router.get('/rentan/metadata/:idhitung', ctrl.rentanMetadata);
        
	/**
	@api {get} /rentan/metadata/:idhitung Dapatkan List Perhitungan
	@apiGroup Kerentanan
	@apiDescription Menampilkan list hasil hitung kerentanan
    
        @apiExample Contoh URL:
                    http://apps.cs.ipb.ac.id:3007/api/rentan/perhitungan
    
        @apiSuccessExample {json} Success-Response:
            {
                "status": true,
                "data": [
                    {
                        "id_perhitungan": 8,
                        "tanggal": "2014-07-04T06:38:22.000Z",
                        "tahun_hitung": "2011-01-01",
                        "tahun_baseline": "2011-01-01",
                        "skala": "desa",
                        "lingkup": "kabupaten",
                        "value_lingkup": "3210",
                        "id_model": 1,
                        "id_user": "1",
                        "id_skenario": 0,
                        "tanggal_selesai": null,
                        "status": null,
                        "user": "Administrator",
                        "nama_lingkup": "KABUPATEN MAJALENGKA"
                    },
                    ...
                ]
            } 
    
        */        
        router.get('/rentan/perhitungan', ctrl.rentanListPerhitungan);
        
        router.post('/rentan/hitungSocket', ctrl.rentanHitungSocket);
        
	/**
	@api {get} /rentan/ringkasan/:kelas/:idhitung Ringkasan Hasil Perhitungan
	@apiGroup Kerentanan
	@apiDescription Menampilkan ringkasan hasil perhitungan berdasarkan kelasnya (5, 6, atau 7). Akan diberikan jumlah wilayah yang memiliki kelas kerentanan tertentu.
    
        @apiParam {number=5,6,7} kelas Kelompokkan wilayah berdasarkan kelas ini
        @apiParam {Number} idhitung ID perhitungan yang ingin dilihat ringkasannya
    
        @apiExample Contoh URL:
                    http://apps.cs.ipb.ac.id:3007/api/rentan/ringkasan/5/20

        @apiSuccessExample {json} Success-Response:
            {
                "status": true,
                "data": [
                    {
                        "kerentanan": 1,
                        "jumlah": "15"
                    },
                    {
                        "kerentanan": 2,
                        "jumlah": "262"
                    },
                    {
                        "kerentanan": 3,
                        "jumlah": "208"
                    },
                    {
                        "kerentanan": 4,
                        "jumlah": "5"
                    },
                    {
                        "kerentanan": 5,
                        "jumlah": "83"
                    }
                ]
            }    
        */
        router.get('/rentan/ringkasan/:kelas/:idhitung', ctrl.rentanRingkasan);
        
	/**
	@api {get} /rentan/ringkasan/:kelas/:idhitung/:kerentanan Ringkasan Wilayah Berdasarkan Kelas Kerentanan
	@apiGroup Kerentanan
	@apiDescription Menampilkan wilayah pada hasil perhitungan tertentu yang memiliki kelas kerentanan tertentu.
    
        @apiParam {number=5,6,7} kelas Kelompokkan wilayah berdasarkan kelas ini
        @apiParam {Number} idhitung ID perhitungan yang ingin dilihat ringkasannya
        @apiParam {Number} kerentanan Kelas kerentanan yang ingin dilihat daftar wilayahnya
    
        @apiExample Contoh URL:
                    http://apps.cs.ipb.ac.id:3007/api/rentan/ringkasan/5/20/1

        @apiSuccessExample {json} Success-Response:
            {
                "status": true,
                "data": [
                    {
                        "id": 3371011,
                        "nama": "MAGELANG TENGAH"
                    },
                    {
                        "id": 3323060,
                        "nama": "PRINGSURAT"
                    },
                    {
                        "id": 3313080,
                        "nama": "KARANGPANDAN"
                    },
                    {
                        "id": 3314050,
                        "nama": "SAMBIREJO"
                    },
                    {
                        "id": 3371020,
                        "nama": "MAGELANG UTARA"
                    },
                    {
                        "id": 3373010,
                        "nama": "ARGOMULYO"
                    },
                    {
                        "id": 3373020,
                        "nama": "TINGKIR"
                    },
                    {
                        "id": 3302730,
                        "nama": "PURWOKERTO TIMUR"
                    },
                    {
                        "id": 3318130,
                        "nama": "GEMBONG"
                    },
                    {
                        "id": 3311100,
                        "nama": "BAKI"
                    },
                    {
                        "id": 3312040,
                        "nama": "GIRIWOYO"
                    },
                    {
                        "id": 3320120,
                        "nama": "KARIMUNJAWA"
                    },
                    {
                        "id": 3373030,
                        "nama": "SIDOMUKTI"
                    },
                    {
                        "id": 3374130,
                        "nama": "SEMARANG TENGAH"
                    },
                    {
                        "id": 3374150,
                        "nama": "TUGU"
                    }
                ]
            }        
        */
        router.get('/rentan/ringkasan/:kelas/:idhitung/:kerentanan', ctrl.rentanRingkasanByKerentanan);
        
        /**
	@api {delete} /rentan/hapus/:idhitung Hapus Hasil Perhitungan
	@apiGroup Kerentanan
	@apiDescription Menghapus hasil hitung kerentanan
    
        @apiExample Contoh URL:
                    http://apps.cs.ipb.ac.id:3007/api/rentan/hapus/12
    
        @apiSuccessExample {json} Success-Response:
            {
                "status": true,
                "data": "DELETE OK"
            }
        */
        router.delete('/rentan/hapus/:idhitung', ctrl.rentanHapus);
        
	return router;
};
