var user = {
	users: [
		"SELECT a.*, b.nama_provinsi, c.nama_kabupaten, d.group, ",
		"case (c.id % 100)/10 = 7 when true then 'KOTA ' else '' end as kabkot ",
		"FROM tbl_user a, data_provinsi b, data_kabupaten c, tbl_group d ",
		"WHERE a.id_provinsi = b.id AND a.id_kabupaten = c.id AND a.id_group = d.id_group ORDER BY a.nama"
		].join(""),
	user: 'select * from tbl_user where username = $1',
	userProvinsi: 'select * from loc_province where id_province = $1',
};

var level = {
	level: 'SELECT * FROM tbl_group ORDER BY id_group ASC',
};

var city = {
	province: "SELECT * FROM data_provinsi ORDER BY nama_provinsi",
	provinceById: "SELECT * FROM data_provinsi where id = $1 ORDER BY nama_provinsi",
        provinceByNama: "SELECT * FROM data_provinsi where nama_provinsi ILIKE $1 ORDER BY nama_provinsi",
        
	kabupaten: [ 
		"SELECT a.*, b.nama_provinsi, ",
		"case (a.id % 100)/10 = 7 when true then 'KOTA ' else '' end as kabkot ",
		"FROM data_kabupaten a, data_provinsi b ",
		"WHERE a.id_provinsi = b.id ORDER BY a.id"].join(""),
	kabupatenByNama: [ 
		"SELECT a.*, b.nama_provinsi, ",
		"case (a.id % 100)/10 = 7 when true then 'KOTA ' else '' end as kabkot ",
		"FROM data_kabupaten a, data_provinsi b ",
		"WHERE a.id_provinsi = b.id AND a.nama_kabupaten ILIKE $1 ORDER BY a.id"].join(""),            
	kabupatenById: [ 
		"SELECT a.*, b.nama_provinsi, ",
		"case (a.id % 100)/10 = 7 when true then 'KOTA ' else '' end as kabkot ",
		"FROM data_kabupaten a, data_provinsi b ",
		"WHERE a.id_provinsi = b.id AND a.id = $1"].join(""),
	kabupatenByProv: [ 
		"SELECT a.*, b.nama_provinsi, ",
		"case (a.id % 100)/10 = 7 when true then 'KOTA ' else '' end as kabkot ",
		"FROM data_kabupaten a, data_provinsi b ",
		"WHERE a.id_provinsi = b.id AND a.id_provinsi = $1 ORDER BY a.id"].join(""),

	kecamatan: [
		"SELECT a.*, b.nama_kabupaten, c.nama_provinsi ",
		"FROM data_kecamatan a ",
		"LEFT JOIN data_kabupaten b ON a.id_kabupaten = b.id ",
		"LEFT JOIN data_provinsi c ON b.id_provinsi = c.id ",
		"ORDER BY a.id"
	].join(""),

	kecamatanByNama: [
		"SELECT a.*, b.nama_kabupaten, c.nama_provinsi ",
		"FROM data_kecamatan a ",
		"LEFT JOIN data_kabupaten b ON a.id_kabupaten = b.id ",
		"LEFT JOIN data_provinsi c ON b.id_provinsi = c.id ",
		"WHERE a.nama_kecamatan ILIKE $1 ORDER BY a.id"
	].join(""),
        
	kecamatanById: [
		"SELECT a.*, b.nama_kabupaten, c.nama_provinsi ",
		"FROM data_kecamatan a ",
		"LEFT JOIN data_kabupaten b ON a.id_kabupaten = b.id ",
		"LEFT JOIN data_provinsi c ON b.id_provinsi = c.id ",
		"WHERE a.id = $1 "
	].join(""),

	kecamatanByKab: [
		"SELECT a.*, b.nama_kabupaten, c.nama_provinsi ",
		"FROM data_kecamatan a ",
		"LEFT JOIN data_kabupaten b ON a.id_kabupaten = b.id ",
		"LEFT JOIN data_provinsi c ON b.id_provinsi = c.id ",
		"WHERE b.id = $1 ORDER BY c.id "
	].join(""),

	kecamatanByProv: [
		"SELECT a.*, b.nama_kabupaten, c.nama_provinsi ",
		"FROM data_kecamatan a ",
		"LEFT JOIN data_kabupaten b ON a.id_kabupaten = b.id ",
		"LEFT JOIN data_provinsi c ON b.id_provinsi = c.id ",
		"WHERE c.id = $1 ORDER BY c.id "
	].join(""),

        desa: [
		"SELECT a.*, b.nama_kecamatan, c.nama_kabupaten, d.nama_provinsi ",
		"FROM data_desa a ",
                "LEFT JOIN data_kecamatan b ON a.id_kecamatan = b.id ",
		"LEFT JOIN data_kabupaten c ON a.id_kabupaten = c.id ",
		"LEFT JOIN data_provinsi  d ON a.id_provinsi  = d.id ",
		"ORDER BY a.id"                
        ].join(""),
        
        desaByNama: [
		"SELECT a.*, b.nama_kecamatan, c.nama_kabupaten, d.nama_provinsi ",
		"FROM data_desa a ",
                "LEFT JOIN data_kecamatan b ON a.id_kecamatan = b.id ",
		"LEFT JOIN data_kabupaten c ON a.id_kabupaten = c.id ",
		"LEFT JOIN data_provinsi  d ON a.id_provinsi  = d.id ",
		"WHERE a.nama_desa ILIKE $1 ORDER BY a.id"
        ].join(""),        
        
        desaById: [
		"SELECT a.*, b.nama_kecamatan, c.nama_kabupaten, d.nama_provinsi ",
		"FROM data_desa a ",
                "LEFT JOIN data_kecamatan b ON a.id_kecamatan = b.id ",
		"LEFT JOIN data_kabupaten c ON a.id_kabupaten = c.id ",
		"LEFT JOIN data_provinsi  d ON a.id_provinsi  = d.id ",
		"WHERE a.id = $1"                
        ].join(""),
        
        desaByKec: [
		"SELECT a.*, b.nama_kecamatan, c.nama_kabupaten, d.nama_provinsi ",
		"FROM data_desa a ",
                "LEFT JOIN data_kecamatan b ON a.id_kecamatan = b.id ",
		"LEFT JOIN data_kabupaten c ON a.id_kabupaten = c.id ",
		"LEFT JOIN data_provinsi  d ON a.id_provinsi  = d.id ",
		"WHERE a.id_kecamatan = $1 ORDER BY a.id"                
        ].join(""),
        
        desaByKab: [
		"SELECT a.*, b.nama_kecamatan, c.nama_kabupaten, d.nama_provinsi ",
		"FROM data_desa a ",
                "LEFT JOIN data_kecamatan b ON a.id_kecamatan = b.id ",
		"LEFT JOIN data_kabupaten c ON a.id_kabupaten = c.id ",
		"LEFT JOIN data_provinsi  d ON a.id_provinsi  = d.id ",
		"WHERE a.id_kabupaten = $1 ORDER BY a.id"                
        ].join(""),
        
        desaByProv: [
		"SELECT a.*, b.nama_kecamatan, c.nama_kabupaten, d.nama_provinsi ",
		"FROM data_desa a ",
                "LEFT JOIN data_kecamatan b ON a.id_kecamatan = b.id ",
		"LEFT JOIN data_kabupaten c ON a.id_kabupaten = c.id ",
		"LEFT JOIN data_provinsi  d ON a.id_provinsi  = d.id ",
		"WHERE a.id_provinsi = $1 ORDER BY a.id"                
        ].join("")        

};

var dataExt = {
    
    list: "SELECT d.id, d.nama, d.id_user, u.nama AS user, d.lingkup, d.id_lingkup, d.keterangan "
          + "FROM sumber_data_eksternal d JOIN tbl_user u "
          + "ON d.id_user = u.id_user "
          + "ORDER BY d.id",
  
    listKolomTabelEksternal: function(userId) {
        var tabelPodes = 'podes_2011';
        
        return "SELECT 0 AS id, '" + tabelPodes + "' AS nama, "
                + "( "
                + "	SELECT array_to_string(array_agg(column_name::text), ',') "
                + "	FROM information_schema.columns "
                + "	WHERE table_name = '" + tabelPodes + "' "
                + "	AND column_name NOT IN ('kode_prov', 'kode_kab', 'kode_kec', 'kode_desa') "
                + ")::text AS kolom "
                + "FROM sumber_data_eksternal "
                + "UNION ALL "
                + "SELECT id, nama, "
                + "( "
                + "	SELECT array_to_string(array_agg(column_name::text), ',') "
                + "	FROM information_schema.columns "
                + "	WHERE table_name = 'data_eksternal_' || id "
                + "	AND column_name NOT IN ('kode_prov', 'kode_kab', 'kode_kec', 'kode_desa') "
                + ")::text "
                + "FROM sumber_data_eksternal "
                + "WHERE id_user = " + parseInt(userId);
    }
    
};

module.exports = {
    user: user,
    level: level,
    city: city,
    dataEksternal: dataExt
};







/*

SELECT (R701FK2+R701FK3) / (R401A+R401B) FROM sidik.podes_2011_kabupaten_numeric 
WHERE kode_prov = 31

select kode_kab r305a from sidik.podes_2011_kabupaten_numeric;

select kec.*, agkab.r305a + agkab.r306a from 
sidik.data_kecamatan  kec left join sidik.podes_2011_kabupaten_numeric agkab
on kec.id_kabupaten = agkab.kode_kab
where id_provinsi = 11;

select x.*, y.r305a from 
sidik.data_kabupaten x left join sidik.podes_2011_kecamatan_numeric y
on x.id = y.kode_kec
where id_provinsi = 11;



SELECT a.*, b.nama_provinsi, c.nama_kabupaten, d.groups,
case c.id % 10 = 7 when true then 'KOTA ' else '' end as kabkot 
FROM tbl_user a, data_provinsi b, data_kabupaten c, tbl_group d 
WHERE a.id_provinsi = b.id AND a.id_kabupaten = c.id AND a.id_group = d.id_group ORDER BY a.nama

*/