DROP DATABASE IF EXISTS boatey;
CREATE DATABASE boatey;
\connect boatey

\i boatey-schema.sql

DROP DATABASE IF EXISTS boatey_test;
CREATE DATABASE boatey_test;
\connect boatey_test

\i boatey-schema.sql