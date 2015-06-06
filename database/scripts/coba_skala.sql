-- skala hitung kec, skala komponen kec/desa:	pakai agregat kecamatan, distinct on kec

SELECT 
	distinct on (kode_kec)
	kode_prov, kode_kab, kode_kec, 
	r401a
FROM podes_2011_kecamatan_numerik  
ORDER BY kode_kec;

-- skala hitung kec, skala komponen kab:	pakai agregat kabupaten, distinct on kec

SELECT 
	distinct on (kode_kec)
	kode_prov, kode_kab, kode_kec, 
	r401a
FROM podes_2011_kabupaten_numerik  
ORDER BY kode_kec;

-- skala hitung kab, skala komponen kab/kec/desa:	pakai agregat kabupaten, distinct on kab

SELECT 
	distinct on (kode_kab)
	kode_prov, kode_kab, 
	r401a
FROM podes_2011_kabupaten_numerik  
ORDER BY kode_kab;

-- skala hitung prov, skala komponen kab/kec/desa:	pakai agregat provinsi, distinct on prov

SELECT 
	distinct on (kode_prov)
	kode_prov, 
	r401a
FROM podes_2011_provinsi_numerik  
ORDER BY kode_prov;
