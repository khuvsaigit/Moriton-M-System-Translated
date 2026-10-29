-- Local-development credentials only. Production credentials are managed outside Compose.
CREATE ROLE clinical LOGIN PASSWORD 'clinical' CONNECTION LIMIT 18;
CREATE ROLE integrations LOGIN PASSWORD 'integrations' CONNECTION LIMIT 12;
CREATE ROLE imaging LOGIN PASSWORD 'imaging' CONNECTION LIMIT 10;
CREATE DATABASE clinical_db OWNER clinical;
CREATE DATABASE integration_db OWNER integrations;
CREATE DATABASE imaging_db OWNER imaging;

-- PostgreSQL grants CONNECT to PUBLIC by default. Revoke it so a service login
-- cannot connect to another service database even when it guesses its name.
REVOKE ALL ON DATABASE clinical_db FROM PUBLIC;
REVOKE ALL ON DATABASE integration_db FROM PUBLIC;
REVOKE ALL ON DATABASE imaging_db FROM PUBLIC;
GRANT CONNECT ON DATABASE clinical_db TO clinical;
GRANT CONNECT ON DATABASE integration_db TO integrations;
GRANT CONNECT ON DATABASE imaging_db TO imaging;

\connect clinical_db
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE, CREATE ON SCHEMA public TO clinical;
\connect integration_db
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE, CREATE ON SCHEMA public TO integrations;
\connect imaging_db
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE, CREATE ON SCHEMA public TO imaging;
\connect postgres
