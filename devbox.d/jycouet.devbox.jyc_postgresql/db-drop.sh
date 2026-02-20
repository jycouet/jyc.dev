#!/bin/bash

# Prepare things for you
jyc_postgresql_dir="./.devbox/virtenv/jycouet.devbox.jyc_postgresql"
source "$jyc_postgresql_dir/helpers.sh"

## ---Your custom things---

# DB_NAME="demo_db" # or in your devbox.json "env": { "DB_NAME": "main_db" }

execute_and_log "Database drop if exist" "dropdb --if-exists \"$DB_NAME\""
