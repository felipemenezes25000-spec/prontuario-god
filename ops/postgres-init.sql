-- Meridiana — init Postgres
-- Extensões habilitadas no container pgvector/pgvector:pg16
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- busca fuzzy em nomes de pacientes
CREATE EXTENSION IF NOT EXISTS unaccent; -- "maria" == "maría"
