#!/usr/bin/env bash
# build.sh - Script de construcción para Render

set -o errexit  # Sale si algún comando falla

pip install -r requirements.txt

python manage.py collectstatic --no-input

python manage.py migrate

# Crea el superusuario automáticamente usando variables de entorno
# (DJANGO_SUPERUSER_USERNAME, DJANGO_SUPERUSER_PASSWORD, DJANGO_SUPERUSER_EMAIL)
python manage.py createsuperuser --no-input || true
