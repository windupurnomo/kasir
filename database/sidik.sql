--tools
--CREATE EXTENSION "uuid-ossp";

create table if not exists sidik_user(
	id character varying (50) primary key,
	username character varying (50),
	password character varying (100),
	first_name character varying (50),
	last_name character varying (50)
);

create table if not exists role(
	id character varying (50) primary key,
	description character varying (50)
);

create table if not exists user_role(
	role_id character varying (50),
	user_id character varying (50)
);

create table if not exists service(
	id character varying (50) primary key,
	method character varying (10),
	path character varying (100),
	description character varying (50)
);

create table if not exists role_service(
	role_id character varying (50),
	service_id character varying (50)
);



--INITIAL VALUE

DO $$

DECLARE user_id1 text;
DECLARE user_id2 text;
DECLARE service1 text;
DECLARE service2 text;

BEGIN

truncate table sidik_user;
truncate table role;
truncate table user_role;
truncate table service;
truncate table role_service;

user_id1 := uuid_generate_v1();
user_id2 := uuid_generate_v1();
service1 := uuid_generate_v1();
service2 := uuid_generate_v1();

insert into sidik_user (id, username, password, first_name, last_name) values 
	(user_id1, 'admin', '$2a$10$67ywwQAuVoxODBOWsNNkAOknFcxwnFyTclzwl.pxe9.qz4baG/Hr.', 'windu', 'purnomo'),
 	(user_id2, 'user', '$2a$10$67ywwQAuVoxODBOWsNNkAOknFcxwnFyTclzwl.pxe9.qz4baG/Hr.', 'jajang', 'purnomo');

insert into role (id, description) values
	('admin', 'aplication admin'),
	('user', 'aplication user');

insert into user_role(role_id, user_id) values
	('admin', user_id1),
	('user', user_id2);
insert into service (id, method, path, description) values
	(service1, 'GET', '/user/login', 'User login');
insert into role_service(role_id, service_id) values
	('admin', service1);

END $$;

