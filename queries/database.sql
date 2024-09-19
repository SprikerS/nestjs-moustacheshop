-- GENERATED BY https://app.chartdb.io --
-- DO NOT MODIFY MANUALLY --

CREATE SEQUENCE IF NOT EXISTS products_id_seq;
CREATE SEQUENCE IF NOT EXISTS sales_id_seq;
CREATE SEQUENCE IF NOT EXISTS employees_id_seq;
CREATE SEQUENCE IF NOT EXISTS facture_id_seq;
CREATE SEQUENCE IF NOT EXISTS categories_id_seq;
CREATE SEQUENCE IF NOT EXISTS clients_id_seq;

CREATE TABLE IF NOT EXISTS products (
  id bigint NOT NULL PRIMARY KEY DEFAULT nextval('products_id_seq'),
  name text,
  price decimal,
  stock integer,
  categoryID bigint
);

CREATE TABLE IF NOT EXISTS sales (
  id bigint NOT NULL PRIMARY KEY DEFAULT nextval('sales_id_seq'),
  quantity integer,
  salePrice decimal,
  total integer,
  productID bigint,
  factureID bigint
);

CREATE TABLE IF NOT EXISTS employees (
  id bigint NOT NULL PRIMARY KEY DEFAULT nextval('employees_id_seq'),
  names bigint,
  paternalSurname bigint,
  maternalSurname bigint,
  email bigint,
  password bigint,
  dni bigint,
  phoneNumber bigint,
  isActive boolean
);

CREATE TABLE IF NOT EXISTS facture (
  id bigint NOT NULL PRIMARY KEY DEFAULT nextval('facture_id_seq'),
  date date,
  employeeID bigint,
  clientID bigint
);

CREATE TABLE IF NOT EXISTS categories (
  id bigint NOT NULL PRIMARY KEY DEFAULT nextval('categories_id_seq'),
  name text
);

CREATE TABLE IF NOT EXISTS clients (
  id bigint NOT NULL PRIMARY KEY DEFAULT nextval('clients_id_seq'),
  names text,
  paternalSurname text,
  maternalSurname text,
  dni text
);

ALTER TABLE products ADD CONSTRAINT products_id_fk FOREIGN KEY (id) REFERENCES sales (productID);
ALTER TABLE facture ADD CONSTRAINT facture_id_fk FOREIGN KEY (id) REFERENCES sales (factureID);
ALTER TABLE products ADD CONSTRAINT products_categoryID_fk FOREIGN KEY (categoryID) REFERENCES categories (id);
ALTER TABLE clients ADD CONSTRAINT clients_id_fk FOREIGN KEY (id) REFERENCES facture (clientID);
ALTER TABLE employees ADD CONSTRAINT employees_id_fk FOREIGN KEY (id) REFERENCES facture (employeeID);