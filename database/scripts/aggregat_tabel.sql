drop table if exists podes_2011_kecamatan_numerik

-- drop table podes_2011_test;

-- create table podes_2011_test (like podes_2011);

-- insert into podes_2011_test select * from podes_2011 where kode_prov = 11;

select tbl.kode_prov, tbl.kode_kab, tbl.kode_kec, tbl.kode_desa, agg.R701DK2, agg.R701DK3
from podes_2011_test tbl
join (
	select 
	kode_kec, 
	sum(R701DK2) as R701DK2, 
	sum(R701DK3) as R701DK3
	from podes_2011_test 
	group by kode_kec
	order by kode_kec
) as agg
on tbl.kode_kec = agg.kode_kec
order by tbl.kode_desa


