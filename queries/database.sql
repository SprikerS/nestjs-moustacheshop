create database postgres;

use postgres;

create table product (
  id int auto_increment not null primary key,
  name varchar(255) not null,
  price decimal(5, 2) not null,
  stock int not null
);

create table client (
  id int auto_increment not null primary key,
  name varchar(255) not null,
  email varchar(255) not null
);

create table facture (
  id int auto_increment not null primary key,
  date datetime not null,
  fkclient int,
  foreign key (fkclient) references client(id)
);

create table details (
  id int auto_increment not null primary key,
  quantity int not null,
  sale_price decimal(5, 2) not null,
  fkfacture int,
  fkproduct int,
  foreign key (fkfacture) references facture(id),
  foreign key (fkproduct) references product(id)
);