#!/bin/bash

source "./.venv/bin/activate"
redis-server &
celery -A app:celery_app worker -l INFO &
celery -A app:celery_app beat -l INFO &
sleep 5
echo "Starting server."
python3 app.py

echo "Server started successfully."