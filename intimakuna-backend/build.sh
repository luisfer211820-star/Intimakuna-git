#!/usr/bin/env bash
# build.sh - Script de construcción para Render

set -o errexit  # Sale si algún comando falla

pip install -r requirements.txt

python manage.py collectstatic --no-input

python manage.py migrate
