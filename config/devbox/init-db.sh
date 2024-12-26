#!/bin/bash
DB_NAME=jyc.dev
DB_USER=postgres

# DB does not exist
if ! psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
  echo "[Postgres] Creating database..."
  createdb $DB_NAME
  echo "[Postgres] Done"
fi

# User does not exist
if ! psql -d $DB_NAME -c "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
  echo "[Postgres] Setting permissions..."
  psql -d $DB_NAME -v ON_ERROR_STOP=1 << EOSQL
    DO \$\$
    BEGIN
        IF EXISTS (SELECT FROM pg_roles WHERE rolname = '$DB_USER') THEN
            ALTER ROLE $DB_USER WITH SUPERUSER CREATEDB CREATEROLE LOGIN PASSWORD 'example';
        ELSE
            CREATE USER $DB_USER WITH SUPERUSER CREATEDB CREATEROLE LOGIN PASSWORD 'example';
        END IF;
    END
    \$\$;
    
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
    ALTER DEFAULT PRIVILEGES GRANT ALL ON TABLES TO $DB_USER;
    ALTER DEFAULT PRIVILEGES GRANT ALL ON SCHEMAS TO $DB_USER;
EOSQL
  echo "[Postgres] Done"
fi
