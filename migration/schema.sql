CREATE DATABASE isup;
\c isup;


CREATE TABLE users (
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) PRIMARY KEY NOT NULL UNIQUE,
  password VARCHAR(64) NOT NULL,
  tos_agreement BOOLEAN NOT NULL DEFAULT FALSE,
  checks VARCHAR NOT NULL DEFAULT '',
  date_created DATE
);


CREATE TABLE tokens (
  email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  id VARCHAR(255) PRIMARY KEY NOT NULL UNIQUE,
  expires TIMESTAMP NOT NULL
);

CREATE TABLE checks (
  id VARCHAR NOT NULL PRIMARY KEY,
  email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  protocol VARCHAR(7) NOT NULL,
  url VARCHAR(255) NOT NULL,
  method VARCHAR(7) NOT NULL,
  success_codes VARCHAR(255) NOT NULL,
  timeout_seconds SMALLINT NOT NULL,
  state VARCHAR(7) NOT NULL DEFAULT 'down',
  last_checked TIMESTAMP,


  CONSTRAINT valid_protocols CHECK (protocol IN ('http', 'https')),
  CONSTRAINT valid_methods CHECK (method IN ('post', 'put', 'get', 'delete')),
  CONSTRAINT valid_state CHECK (state IN ('up', 'down'))
);


\dt