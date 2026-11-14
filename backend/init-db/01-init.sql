-- PostgreSQL & PostGIS initialization script
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Grant permissions if necessary
GRANT ALL PRIVILEGES ON DATABASE fire_intelligence TO postgres;
