drop table sidik.podes_2011_nasional_numeric;
drop table sidik.podes_2011_provinsi_numeric;
drop table sidik.podes_2011_kabupaten_numeric;
drop table sidik.podes_2011_kecamatan_numeric;

drop table sidik.podes_2011_nasional_ordinal;
drop table sidik.podes_2011_provinsi_ordinal;
drop table sidik.podes_2011_kabupaten_ordinal;
drop table sidik.podes_2011_kecamatan_ordinal;



-- create podes mirror
select * into podes_2011_mirror from podes_2011;
alter table podes_2011_mirror alter column kode_desa type bigint;
update podes_2011_mirror set 
kode_kab = (kode_prov*100 + kode_kab),
kode_kec = (kode_prov*100000 + kode_kab*1000 + kode_kec),
kode_desa = (kode_prov*cast (100000000 as bigint) + kode_kab*1000000 + kode_kec*1000 + kode_desa);



-- create median function
CREATE FUNCTION _final_median(anyarray) RETURNS float8 AS $$ 
  WITH q AS
  (
     SELECT val
     FROM unnest($1) val
     WHERE VAL IS NOT NULL
     ORDER BY 1
  ),
  cnt AS
  (
    SELECT COUNT(*) AS c FROM q
  )
  SELECT AVG(val)::float8
  FROM 
  (
    SELECT val FROM q
    LIMIT  2 - MOD((SELECT c FROM cnt), 2)
    OFFSET GREATEST(CEIL((SELECT c FROM cnt) / 2.0) - 1,0)  
  ) q2;
$$ LANGUAGE sql IMMUTABLE;
 
CREATE AGGREGATE median(anyelement) (
  SFUNC=array_append,
  STYPE=anyarray,
  FINALFUNC=_final_median,
  INITCOND='{}'
);

-- usage median function
SELECT median(value) AS median_value FROM t;


