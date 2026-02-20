#!/bin/bash

# Prepare things for you
jyc_postgresql_dir="./.devbox/virtenv/jycouet.devbox.jyc_postgresql"
source "$jyc_postgresql_dir/helpers.sh"

## ---Your custom things---

# DB_NAME="demo_db" # or in your devbox.json "env": { "DB_NAME": "main_db" }

# run the db-init script to create a database
"$jyc_postgresql_dir/db-init.sh" -n $DB_NAME

# additionals examples
execute_and_log "Database timezone to UTC enforcing" "psql -d \"$DB_NAME\" -c \"ALTER DATABASE \\\"$DB_NAME\\\" SET timezone TO 'UTC';\""
execute_and_log "Timezone check" 'echo "Timezone: $(psql -U postgres -d "'$DB_NAME'" -t -A -c "SHOW timezone;")"' 
