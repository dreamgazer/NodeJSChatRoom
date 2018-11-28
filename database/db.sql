create table users(
	username VARCHAR(50) not null,
	hashed_password VARCHAR(255) not null,
    salt VARCHAR(16) not null,
	primary key(username)
) engine = InnoDB default character set = utf8 collate = utf8_general_ci;

create table records(
	id int unsigned not null auto_increment,
    title VARCHAR(255) not null,
    speaker VARCHAR(255) not null,
	msg VARCHAR(255) not null,
    msg_time DATETIME not null,
    members VARCHAR(255) not null,
	primary key(id)
) engine = InnoDB default character set = utf8 collate = utf8_general_ci;