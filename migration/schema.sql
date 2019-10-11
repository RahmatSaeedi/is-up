CREATE DATABASE isup;
\c isup;


CREATE TABLE users (
  uid SERIAL PRIMARY KEY NOT NULL UNIQUE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(64) NOT NULL,
  tos_agreement BOOLEAN NOT NULL DEFAULT FALSE,
  date_created DATE
);




\dt